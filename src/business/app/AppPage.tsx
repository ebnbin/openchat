import * as React from 'react';
import {useEffect, useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {AppData} from "../../data/data";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useIsDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";

export default function AppPage() {
  const isDarkMode = useIsDarkMode()

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  })

  const [settings, setSettings] = useState<AppData>(
    {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData
  )

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

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage
        appData={settings}
        setAppData={setSettingsAndStore}
        setSettingsOpen={setSettingsOpen}
      />
      <SettingsDialog
        settings={settings}
        setSettings={setSettingsAndStore}
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
