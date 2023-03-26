import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../util/data";
import {useState} from "react";
import store from "../../util/store";

interface HomePageProps {
  setSettingsOpen: (settingsOpen: boolean) => void
}

export default function HomePage(props: HomePageProps) {
  const [chats, _setChats] = useState(store.getChats())

  const updateChat = (chat: Chat) => {
    store.updateChat(chat);
    _setChats(store.getChats());
  }

  const createOrUpdateChat = (chat: Chat, isNewChat: boolean) => {
    if (isNewChat) {
      store.createChat(chat)
      _setChats(store.getChats());
      setSelectedChatId(chat.id)
    } else {
      updateChat(chat)
    }
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

  const handleNewChatClick = () => {
    toNewChatPage()
  }

  const toNewChatPage = () => {
    if (selectedChatId !== '') {
      setNewChat(store.newChat())
      setSelectedChatId('');
    }
  }

  const [newChat, setNewChat] = useState(store.newChat())

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
            {selectedChatId !== '' ? (
              <ChatPage
                key={`ChatPage${selectedChatId}`}
                chat={chats.find((chat) => chat.id === selectedChatId)!!}
                isNewChat={false}
                createOrUpdateChat={createOrUpdateChat}
              />
            ) : (
              <ChatPage
                key={`ChatPage${newChat.id}`}
                chat={newChat}
                isNewChat={true}
                createOrUpdateChat={createOrUpdateChat}
              />
            )}
          </Box>
        </Box>
      </Box>
      {selectedChatId !== '' ? (
        <ChatSettingsDialog
          chat={chats.find((chat) => chat.id === selectedChatId)!!}
          updateChat={updateChat}
          deleteChat={deleteChat}
          open={chatSettingsDialogOpen}
          handleClose={() => setChatSettingsDialogOpen(false)}
        />
      ) : <></>}
    </>
  )
}
