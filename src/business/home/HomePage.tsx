import Box from "@mui/material/Box";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat, Settings} from "../../util/data";
import {useEffect, useState} from "react";
import store from "../../util/store";
import Logo from "../../component/Logo";
import LikesPage from "../likes/LikesPage";
import HomeGridCard from "./HomeGridCard";

export const contentNewChat = 0;
export const contentLikes = -1;

interface HomePageProps {
  settings: Settings;
  setSettingsOpen: (settingsOpen: boolean) => void
}

export default function HomePage(props: HomePageProps) {
  const [chats, _setChats] = useState<Chat[]>([])

  useEffect(() => {
    store.getChatsAsync()
      .then((chats) => {
        _setChats(chats)
      });
  }, []);

  const createChat = (chat: Chat) => {
    _setChats((chats) => [...chats, chat]);
    store.updateChatsCreateChatAsync(chat);
    setSelectedChatId(chat.id)
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

  const updateChatPinTimestamps = (pinTimestamps: Record<number, number>) => {
    _setChats((chats) => chats.map((chat) => {
      if (chat.id in pinTimestamps) {
        return {
          ...chat,
          pin_timestamp: pinTimestamps[chat.id],
        }
      }
      return chat
    }));
    store.updateChatsAsync((chatId: number) => {
      if (chatId in pinTimestamps) {
        return {
          pin_timestamp: pinTimestamps[chatId],
        }
      }
      return {};
    });
  }

  const { setSettingsOpen } = props

  const [selectedChatId, setSelectedChatId] = useState(contentNewChat);

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = React.useState(false);

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const handleLikesClick = () => {
    setSelectedChatId(contentLikes)
  }

  const toNewChatPage = () => {
    setNewChat(store.newChat())
    setSelectedChatId(contentNewChat);
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

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Box
        sx={{
          width: '100%',
          height: '100vh',
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
            handleAppsClick={handleClick}
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
      </Box>
      <HomeGridCard
        chats={chats}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        selectedContentId={selectedChatId}
        setSelectedContentId={setSelectedChatId}
        handleNewChatClick={handleNewChatClick}
        handleLikesClick={handleLikesClick}
        handleNewChatSettingsDialogOpen={() => setNewChatSettingsDialogOpen(true)}
        handleSettingsDialogOpen={() => setSettingsOpen(true)}
        updateChatPinTimestamps={updateChatPinTimestamps}
      />
      {dialogPage()}
    </>
  );
}
