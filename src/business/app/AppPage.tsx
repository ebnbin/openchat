import * as React from 'react';
import {useState} from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import {AppData, Chat} from "../../data/data";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useIsDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";
import store from "../../util/store";

export default function AppPage() {
  const [appData, setAppData] = useState<AppData>(store.appData)

  const setAppDataAndStore = (appData: AppData) => {
    setAppData(appData)
    store.setAppData(appData)
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
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
