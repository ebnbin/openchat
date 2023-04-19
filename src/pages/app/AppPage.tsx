import * as React from "react";
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import {useDarkMode} from "../../utils/utils";
import HomePage from "../home/HomePage";
import {blue, blueGrey, grey, orange, red} from "@mui/material/colors";
import {createContext, useContext, useEffect, useState} from "react";
import store from "../../utils/store";
import {Theme} from "../../utils/types";
import {SettingsDialog} from "../settings/SettingsDialog";
import Box from "@mui/material/Box";

const DataTimestampContext = createContext<any>(null);

export const useDataTimestamp = () => {
  return useContext(DataTimestampContext)
}

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: blue["A100"],
    },
    info: {
      main: blueGrey["A100"],
    },
    error: {
      main: red["A100"],
    },
    warning: {
      main: orange["A100"],
    },
    background: {
      default: blueGrey[900],
      paper: blueGrey[900],
    },
  },
})

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue[700],
    },
    info: {
      main: blueGrey[700],
    },
    error: {
      main: red[700],
    },
    warning: {
      main: orange["700"],
    },
    background: {
      default: grey[50],
      paper: grey[50],
    },
  },
})

export default function AppPage() {
  const [dataTimestamp, setDataTimestamp] = useState({ data: Date.now() })

  const themeMode = (darkMode: string, isSystemDarkMode: boolean) => {
    switch (darkMode) {
      case "dark":
        return "dark";
      case "light":
        return "light";
      default:
        return isSystemDarkMode ? "dark" : "light";
    }
  }

  const [storeTheme, _setStoreTheme] = useState<Theme>(store.theme.get())

  const setStoreTheme = (theme: Theme) => {
    _setStoreTheme(theme)
    store.theme.set(theme)
  }

  const isSystemDarkMode = useDarkMode()
  const isDarkMode = themeMode(storeTheme, isSystemDarkMode) === "dark"
  const theme = isDarkMode ? darkTheme : lightTheme

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const [width, setWidth] = useState(window.innerWidth);
  const [height, setHeight] = useState(window.innerHeight);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <DataTimestampContext.Provider
      key={dataTimestamp.data}
      value={{dataTimestamp, setDataTimestamp}}
    >
      <ThemeProvider
        theme={theme}
      >
        <CssBaseline />
        <Box
          sx={{
            width: width,
            height: height,
          }}
        >
          <HomePage
            handleSettingsDialogOpen={() => setSettingsOpen(true)}
          />
        </Box>
        <SettingsDialog
          theme={storeTheme}
          setTheme={setStoreTheme}
          dialogOpen={settingsOpen}
          handleDialogClose={handleSettingsClose}
        />
      </ThemeProvider>
    </DataTimestampContext.Provider>
  );
}
