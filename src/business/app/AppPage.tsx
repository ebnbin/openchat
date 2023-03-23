import * as React from 'react';
import {useEffect, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {AppData} from "../../data/data";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useIsDarkMode} from "../../util/util";
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
    const storedSettings = localStorage.getItem('app_data')
    if (storedSettings) {
      setAppData(JSON.parse(storedSettings))
    }
  }, [])

  const setAppDataAndStore = (appData: AppData) => {
    setAppData(appData)
    localStorage.setItem('app_data', JSON.stringify(appData))
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
        appData={appData}
        setAppData={setAppDataAndStore}
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
