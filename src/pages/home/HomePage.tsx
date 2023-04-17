import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../utils/data";
import {useEffect, useState} from "react";
import store from "../../utils/store";
import Logo from "../../components/Logo";
import LikesPage from "../likes/LikesPage";
import {useMediaQuery} from "@mui/material";
import {widePageWidth} from "../../utils/util";
import {SettingsDialog} from "../settings/SettingsDialog";

export const contentNewChat = 0;
export const contentLikes = -1;

interface HomePageProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export default function HomePage(props: HomePageProps) {
  const [chats, _setChats] = useState<Chat[]>([])

  useEffect(() => {
    store.getChatsAsync()
      .then((chats) => {
        _setChats(chats)
        _setSelectedChatId(startupPage(chats))
      });
  }, []);

  const createChat = (chat: Chat) => {
    _setChats((chats) => [...chats, chat]);
    store.updateChatsCreateChatAsync(chat);
    updateSelectedChatId(chat.id)
  }

  const updateChat = (chatId: number, chat: Partial<Chat>) => {
    _setChats((chats) => chats.map((foundChat) => {
      if (foundChat.id === chatId) {
        return {
          ...foundChat,
          ...chat,
        }
      }
      return foundChat
    }));
    store.updateChatsUpdateChatAsync(chatId, chat);
  }

  const deleteChat = (chat: Chat) => {
    toNewChatPage()
    _setChats((chats) => chats.filter((foundChat) => foundChat.id !== chat.id));
    store.updateChatsDeleteChatAsync(chat.id);
    store.updateConversationsDeleteConversationsAsync(chat.id);
  }

  const startupPage = (chats: Chat[]) => {
    const reopen = store.reopenChat.get();
    if (!reopen) {
      return contentNewChat;
    }
    const latestId = store.selectedPageId.get();
    if (latestId === contentNewChat || latestId === contentLikes) {
      return latestId;
    }
    if (chats.some((chat) => chat.id === latestId)) {
      return latestId;
    }
    return contentNewChat;
  }

  const [selectedChatId, _setSelectedChatId] = useState(contentNewChat);

  const updateSelectedChatId = (chatId: number) => {
    _setSelectedChatId(chatId)
    store.selectedPageId.set(chatId)
  }

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = React.useState(false);

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const handleLikesClick = () => {
    updateSelectedChatId(contentLikes)
    setMobileOpen(false)
  }

  const toNewChatPage = () => {
    setNewChat(store.newChat())
    updateSelectedChatId(contentNewChat);
    setMobileOpen(false)
  }

  const [newChat, setNewChat] = useState(store.newChat())

  const dialogPage = () => {
    if (selectedChatId === contentNewChat) {
      return (
        <ChatSettingsDialog
          key={`ChatSettingsDialog${newChat.id}`}
          chat={newChat}
          isNew={true}
          createChat={createChat}
          dialogOpen={newChatSettingsDialogOpen}
          handleDialogClose={() => setNewChatSettingsDialogOpen(false)}
        />
      )
    }
    if (selectedChatId === contentLikes) {
      return undefined;
    }
    return (
      <ChatSettingsDialog
        key={`ChatSettingsDialog${selectedChatId}`}
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        isNew={false}
        updateChat={updateChat}
        deleteChat={deleteChat}
        dialogOpen={chatSettingsDialogOpen}
        handleDialogClose={() => setChatSettingsDialogOpen(false)}
      />
    )
  }

  const contentPage = () => {
    if (selectedChatId === contentNewChat) {
      return (
        <ChatPage
          key={`ChatPage${newChat.id}`}
          chat={newChat}
          updateChat={updateChat}
          createChat={createChat}
        >
          <Box
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Logo/>
          </Box>
        </ChatPage>
      )
    }
    if (selectedChatId === contentLikes) {
      return (
        <LikesPage/>
      );
    }
    return (
      <ChatPage
        key={`ChatPage${selectedChatId}`}
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        updateChat={updateChat}
      />
    )
  }

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          width: width,
          height: height,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <HomeAppBar
            chats={chats}
            contentId={selectedChatId}
            handleChatSettingsDialogOpen={() => setChatSettingsDialogOpen(true)}
            selectedContentId={selectedChatId}
            handleNewChatSettingsDialogOpen={() => setNewChatSettingsDialogOpen(true)}
            setDrawerOpen={setMobileOpen}
          />
          <Box
            style={{
              width: '100%',
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            {contentPage()}
          </Box>
        </Box>
        <HomeDrawer
          chats={chats}
          selectedChatId={selectedChatId}
          setSelectedChatId={updateSelectedChatId}
          handleChatSettingsDialogOpen={() => setChatSettingsDialogOpen(true)}
          setSettingsOpen={setSettingsOpen}
          handleNewChatClick={handleNewChatClick}
          handleLikesClick={handleLikesClick}
          handleNewChatSettingsDialogOpen={() => setNewChatSettingsDialogOpen(true)}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </Box>
      {dialogPage()}
      {
        <SettingsDialog
          theme={props.theme}
          setTheme={props.setTheme}
          chats={chats}
          dialogOpen={settingsOpen}
          handleDialogClose={handleSettingsClose}
        />
      }
    </>
  );
}
