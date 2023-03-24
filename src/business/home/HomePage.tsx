import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../data/data";
import {useState} from "react";

interface HomePageProps {
  chats: Chat[],
  setChats: (chats: Chat[]) => void,
  setSettingsOpen: (settingsOpen: boolean) => void
}

export default function HomePage(props: HomePageProps) {
  const { chats, setChats, setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const updateChat = (chat: Chat) => {
    const copyChats = chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chat.id)
    if (index === -1) {
      setChats([...copyChats, chat])
      setSelectedChatId(chat.id)
    } else {
      copyChats[index] = chat
      setChats(copyChats)
    }
  }

  const deleteChat = (chatId: string) => {
    setSelectedChatId('')
    const copyChats = chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chatId)
    copyChats.splice(index, 1)
    setChats(copyChats)
    localStorage.removeItem(`chat_${chatId}`)
  }

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
          setChats={setChats}
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
                setChat={updateChat}
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
          setChat={updateChat}
          deleteChat={deleteChat}
          open={chatSettingsDialogOpen}
          handleClose={() => setChatSettingsDialogOpen(false)}
        />
      ) : <></>}
    </>
  )
}
