import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../util/data";
import {useEffect, useState} from "react";
import store from "../../util/store";
import ImagePage from "../image/ImagePage";
import Logo from "../../component/Logo";
import {Button} from "@mui/material";
import {EditRounded} from "@mui/icons-material";

export const idNewChat = '';
export const idImage = 'image';

interface HomePageProps {
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

  const updateChat = (chatId: string, chat: Partial<Chat>) => {
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
    store.updateConversationsDeleteConversationsAsync(chat.conversations);
  }

  const { setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState('');

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = React.useState(false);

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const handleImageClick = () => {
    setSelectedChatId(idImage)
    setMobileOpen(false)
  }

  const toNewChatPage = () => {
    setNewChat(store.newChat())
    setSelectedChatId(idNewChat);
    setMobileOpen(false)
  }

  const [newChat, setNewChat] = useState(store.newChat())

  const dialogPage = () => {
    if (selectedChatId === idNewChat) {
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
    if (selectedChatId === idImage) {
      return undefined
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
    if (selectedChatId === idNewChat) {
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
            <Button
              variant={'outlined'}
              startIcon={<EditRounded/>}
              sx={{
                marginTop: '32px',
              }}
              onClick={() => setNewChatSettingsDialogOpen(true)}
            >
              New chat settings
            </Button>
          </Box>
        </ChatPage>
      )
    }
    if (selectedChatId === idImage) {
      return <ImagePage
        key={'image'}
      />
    }
    return (
      <ChatPage
        key={`ChatPage${selectedChatId}`}
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        updateChat={updateChat}
      />
    )
  }

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
        <HomeDrawer
          chats={chats}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          handleChatSettingsDialogOpen={() => setChatSettingsDialogOpen(true)}
          setSettingsOpen={setSettingsOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          handleNewChatClick={handleNewChatClick}
          handleImageClick={handleImageClick}
        />
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <HomeAppBar
            chats={chats}
            selectedChatId={selectedChatId}
            handleChatSettingsDialogOpen={() => setChatSettingsDialogOpen(true)}
            setMobileOpen={setMobileOpen}
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
      {dialogPage()}
    </>
  );
}
