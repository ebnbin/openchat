import * as React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";
import {blueGrey} from "@mui/material/colors";
import {createContext, useContext, useState} from "react";
import store from "../../util/store";

const DataTimestampContext = createContext<any>(null);

export const useDataTimestamp = () => {
  return useContext(DataTimestampContext)
}

export default function AppPage() {
  const [dataTimestamp, setDataTimestamp] = useState({ data: new Date().getTime() })

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const [darkMode, _setDarkMode] = useState(store.getSettings().dark_mode)

  const setDarkMode = (darkMode: string) => {
    _setDarkMode(darkMode)
    store.updateSettings({
      dark_mode: darkMode
    })
  }

  const themeMode = (darkMode: string, isSystemDarkMode: boolean) => {
    switch (darkMode) {
      case 'dark':
        return 'dark';
      case 'light':
        return 'light';
      default:
        return isSystemDarkMode ? 'dark' : 'light';
    }
  }

  const isSystemDarkMode = useDarkMode()
  const theme = createTheme({
    palette: {
      mode: themeMode(darkMode, isSystemDarkMode),
      info: blueGrey,
    },
  })

  return (
    <DataTimestampContext.Provider
      key={dataTimestamp.data}
      value={{dataTimestamp, setDataTimestamp}}
    >
      <ThemeProvider
        theme={theme}
      >
        <CssBaseline />
        <HomePage
          setSettingsOpen={setSettingsOpen}
        />
        <SettingsDialog
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          dialogOpen={settingsOpen}
          handleDialogClose={handleSettingsClose}
        />
      </ThemeProvider>
    </DataTimestampContext.Provider>
  );
}
