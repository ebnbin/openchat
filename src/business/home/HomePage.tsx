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

  const createChat = () => {
    const chat = store.createChat();
    _setChats(store.getChats());
    return chat;
  }

  const updateChat = (chat: Chat) => {
    store.updateChat(chat);
    _setChats(store.getChats());
  }

  const deleteChat = (chatId: string) => {
    setSelectedChatId('');
    store.deleteChat(chatId);
    _setChats(store.getChats());
  }

  const { setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState<string>('');

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = React.useState(false);

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
          createChat={createChat}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          handleChatSettingsDialogOpen={() => setChatSettingsDialogOpen(true)}
          setSettingsOpen={setSettingsOpen}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
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
                updateChat={updateChat}
              />
            ) : (
              <></>
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
