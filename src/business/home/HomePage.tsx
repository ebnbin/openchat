import * as React from 'react';
import Box from '@mui/material/Box';
import {useEffect, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {Chat, AppData} from "../../data/data";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {ChatSettingsDialog} from "../chat/ChatSettingsDialog";
import {useIsDarkMode} from "../../util/util";
import ChatPage from "../chat/ChatPage";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";

export const drawerWidth = 300;

export function HomePage() {
  const isDarkMode = useIsDarkMode()

  const [settings, setSettings] = useState<AppData>(
    {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData
  )

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  })

  useEffect(() => {
    const storedSettings = localStorage.getItem('app_data')
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  const setSettingsAndStore = (settings: AppData) => {
    setSettings(settings)
    localStorage.setItem('app_data', JSON.stringify(settings))
  }

  const setChatSettings = (chat: Chat) => {
    const copyChats = settings.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chat.id)
    if (index === -1) {
      setSettingsAndStore(
        {
          ...settings,
          chats: [...copyChats, chat],
        } as AppData,
      )
      setSelectedChatId(chat.id)
    } else {
      copyChats[index] = chat
      setSettingsAndStore(
        {
          ...settings,
          chats: copyChats,
        } as AppData,
      )
    }
  }

  const deleteChat = (chatId: string) => {
    setSelectedChatId('')
    const copyChats = settings.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chatId)
    copyChats.splice(index, 1)
    setSettingsAndStore(
      {
        ...settings,
        chats: copyChats,
      } as AppData,
    )
    localStorage.removeItem(`chat_${chatId}`)
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState<string>('');


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <HomeDrawer
          appData={settings}
          setAppData={setSettings}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          handleClickOpen={handleClickOpen}
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
            appData={settings}
            selectedChatId={selectedChatId}
            handleClickOpen={handleClickOpen}
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
                settings={settings}
                chatId={selectedChatId}
                setChatSettings={setChatSettings}
              />
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
      {selectedChatId !== '' ? (
        <ChatSettingsDialog
          settings={settings}
          chatId={selectedChatId}
          setChatSettings={setChatSettings}
          deleteChat={deleteChat}
          open={open}
          handleClose={handleClose}
        />
      ) : <></>}
      <SettingsDialog
        settings={settings}
        setSettings={setSettingsAndStore}
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
