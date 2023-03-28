import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../util/data";
import {useState} from "react";
import store from "../../util/store";
import {ChatNewSettingsDialog} from "../chat/ChatNewSettingsDialog";
import ImagePage from "../image/ImagePage";

interface HomePageProps {
  setSettingsOpen: (settingsOpen: boolean) => void
}

export default function HomePage(props: HomePageProps) {
  const [chats, _setChats] = useState(store.getChats())

  const createChat = (chat: Chat) => {
    store.createChat(chat)
    _setChats(store.getChats());
    setSelectedChatId(chat.id)
  }

  const updateChat = (chat: Chat) => {
    store.updateChat(chat);
    _setChats(store.getChats());
  }

  const deleteChat = (chatId: string) => {
    toNewChatPage()
    store.deleteChat(chatId);
    _setChats(store.getChats());
  }

  const { setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState<string>('');

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = React.useState(false);

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const handleImageClick = () => {
    setSelectedChatId('image')
    setMobileOpen(false)
  }

  const toNewChatPage = () => {
    setNewChat(store.newChat())
    setSelectedChatId('');
    setMobileOpen(false)
  }

  const [newChat, setNewChat] = useState(store.newChat())

  const dialogPage = () => {
    if (selectedChatId === '') {
      return (
        <ChatNewSettingsDialog
          chat={newChat}
          updateChat={setNewChat}
          open={newChatSettingsDialogOpen}
          handleClose={() => setNewChatSettingsDialogOpen(false)}
        />
      )
    }
    if (selectedChatId === 'image') {
      return undefined
    }
    return (
      <ChatSettingsDialog
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        updateChat={updateChat}
        deleteChat={deleteChat}
        open={chatSettingsDialogOpen}
        handleClose={() => setChatSettingsDialogOpen(false)}
      />
    )
  }

  const contentPage = () => {
    if (selectedChatId === '') {
      return (
        <ChatPage
          key={`ChatPage${newChat.id}`}
          chat={newChat}
          isNewChat={true}
          createChat={createChat}
          updateChat={updateChat}
          openNewChatSettings={() => setNewChatSettingsDialogOpen(true)}
        />
      )
    }
    if (selectedChatId === 'image') {
      return <ImagePage
        key={'image'}
      />
    }
    return (
      <ChatPage
        key={`ChatPage${selectedChatId}`}
        chat={chats.find((chat) => chat.id === selectedChatId)!!}
        isNewChat={false}
        createChat={createChat}
        updateChat={updateChat}
        openNewChatSettings={null}
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
