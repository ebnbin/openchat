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
    store.createChatAsync(chat);
    setSelectedChatId(chat.id)
  }

  const updateChat = (chatId: number, chat: Partial<Chat>) => {
    _setChats((chats) => chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          ...chat,
        }
      }
      return c
    }));
    store.updateChatAsync(chatId, chat);
  }

  const deleteChat = (chatId: number) => {
    toNewChatPage()
    _setChats((chats) => chats.filter((c) => c.id !== chatId));
    store.deleteChatAsync(chatId);
  }

  const { setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState<number>(0);

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = React.useState(false);

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const handleImageClick = () => {
    setSelectedChatId(-1)
    setMobileOpen(false)
  }

  const toNewChatPage = () => {
    setNewChat(store.newChat())
    setSelectedChatId(0);
    setMobileOpen(false)
  }

  const [newChat, setNewChat] = useState(store.newChat())

  const updateNewChat = (chatId: number, chat: Partial<Chat>) => {
    setNewChat({
      ...newChat,
      ...chat,
    })
  }

  const deleteNewChat = (chatId: number) => {
  }

  const dialogPage = () => {
    if (selectedChatId === 0) {
      return (
        <ChatSettingsDialog
          key={`ChatSettingsDialog${newChat.id}`}
          chat={newChat}
          updateChat={updateNewChat}
          deleteChat={deleteNewChat}
          isNew={true}
          dialogOpen={newChatSettingsDialogOpen}
          handleDialogClose={() => setNewChatSettingsDialogOpen(false)}
        />
        // <ChatNewSettingsDialog
        //   chat={newChat}
        //   updateChat={setNewChat}
        //   open={newChatSettingsDialogOpen}
        //   handleClose={() => setNewChatSettingsDialogOpen(false)}
        // />
      )
    }
    if (selectedChatId === -1) {
      return undefined
    }
    return (
      <ChatSettingsDialog
        key={`ChatSettingsDialog${selectedChatId}`}
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        updateChat={updateChat}
        deleteChat={deleteChat}
        isNew={false}
        dialogOpen={chatSettingsDialogOpen}
        handleDialogClose={() => setChatSettingsDialogOpen(false)}
      />
    )
  }

  const contentPage = () => {
    if (selectedChatId === 0) {
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
    if (selectedChatId === -1) {
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
  )
}
