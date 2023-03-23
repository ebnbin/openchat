import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import * as React from "react";
import {AppData, Chat} from "../../data/data";
import {useState} from "react";

interface HomePageProps {
  appData: AppData
  setAppData: (appData: AppData) => void
  setSettingsOpen: (settingsOpen: boolean) => void
}

export default function HomePage(props: HomePageProps) {
  const { appData, setAppData, setSettingsOpen } = props

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const setChat = (chat: Chat) => {
    const copyChats = appData.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chat.id)
    if (index === -1) {
      setAppData(
        {
          ...appData,
          chats: [...copyChats, chat],
        } as AppData,
      )
      setSelectedChatId(chat.id)
    } else {
      copyChats[index] = chat
      setAppData(
        {
          ...appData,
          chats: copyChats,
        } as AppData,
      )
    }
  }

  const deleteChat = (chatId: string) => {
    setSelectedChatId('')
    const copyChats = appData.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chatId)
    copyChats.splice(index, 1)
    setAppData(
      {
        ...appData,
        chats: copyChats,
      } as AppData,
    )
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
          appData={appData}
          setAppData={setAppData}
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
            appData={appData}
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
                appData={appData}
                chatId={selectedChatId}
                setChat={setChat}
              />
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
      {selectedChatId !== '' ? (
        <ChatSettingsDialog
          chat={appData.chats.find((chat) => chat.id === selectedChatId)!!}
          setChat={setChat}
          deleteChat={deleteChat}
          open={chatSettingsDialogOpen}
          handleClose={() => setChatSettingsDialogOpen(true)}
        />
      ) : <></>}
    </>
  )
}
