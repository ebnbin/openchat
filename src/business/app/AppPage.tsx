import * as React from 'react';
import {useEffect, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {AppData, Chat} from "../../data/data";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {openAIApiKey, useIsDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";

export default function AppPage() {
  const [appData, setAppData] = useState<AppData>(
    {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData
  )

  useEffect(() => {
    const storedAppData = localStorage.getItem('app_data')
    if (storedAppData) {
      const appData: AppData = JSON.parse(storedAppData)
      setAppData(appData)
      openAIApiKey.value = appData.openai_api_key
    }
  }, [])

  const setAppDataAndStore = (appData: AppData) => {
    setAppData(appData)
    localStorage.setItem('app_data', JSON.stringify(appData))
  }

  const setChats = (chats: Chat[]) => {
    setAppDataAndStore(
      {
        ...appData,
        chats: chats,
      } as AppData
    )
  }

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const isDarkMode = useIsDarkMode()
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage
        chats={appData.chats}
        setChats={setChats}
        setSettingsOpen={setSettingsOpen}
      />
      <SettingsDialog
        appData={appData}
        setAppData={(setAppDataAndStore)}
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
