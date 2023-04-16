import * as React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {useDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";
import {blue, blueGrey, grey, red} from "@mui/material/colors";
import {createContext, useContext, useState} from "react";
import store from "../../util/store";

const DataTimestampContext = createContext<any>(null);

export const useDataTimestamp = () => {
  return useContext(DataTimestampContext)
}

export default function AppPage() {
  const [dataTimestamp, setDataTimestamp] = useState({ data: Date.now() })

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

  const [storeTheme, _setStoreTheme] = useState(store.theme.get())

  const setStoreTheme = (theme: string) => {
    _setStoreTheme(theme)
    store.theme.set(theme)
  }

  const isSystemDarkMode = useDarkMode()
  const isDarkMode = themeMode(storeTheme, isSystemDarkMode) === 'dark'
  const theme = isDarkMode ? createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: blue['A100'],
      },
      info: {
        main: blueGrey['A100'],
      },
      error: {
        main: red['A100'],
      },
      background: {
        default: blueGrey[900],
        paper: blueGrey[900],
      },
    },
  }) : createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: blue[700],
      },
      info: {
        main: blueGrey[700],
      },
      error: {
        main: red[700],
      },
      background: {
        default: grey[50],
        paper: grey[50],
      },
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
          theme={storeTheme}
          setTheme={setStoreTheme}
        />
      </ThemeProvider>
    </DataTimestampContext.Provider>
  );
}
