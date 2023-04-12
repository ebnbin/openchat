import * as React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";
import {blueGrey} from "@mui/material/colors";
import {createContext, useContext, useState} from "react";

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

  const isDarkMode = useDarkMode()
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      info: blueGrey,
    },
  })

  return (
    <DataTimestampContext.Provider
      key={dataTimestamp.data}
      value={{dataTimestamp, setDataTimestamp}}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <HomePage
          setSettingsOpen={setSettingsOpen}
        />
        <SettingsDialog
          dialogOpen={settingsOpen}
          handleDialogClose={handleSettingsClose}
        />
      </ThemeProvider>
    </DataTimestampContext.Provider>
  );
}
