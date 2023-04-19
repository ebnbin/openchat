import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import HomePage from "../home/HomePage";
import {createContext, useContext, useEffect, useState} from "react";
import store from "../../utils/store";
import {Theme} from "../../utils/types";
import {SettingsDialog} from "../settings/SettingsDialog";
import Box from "@mui/material/Box";
import AppThemePage from "./AppThemePage";
import Toast from "../../components/Toast";
import {AlertColor} from "@mui/material/Alert/Alert";

interface AppContextType {
  reload: (toastColor?: AlertColor, toastText?: string) => void;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function useAppContext() {
  return useContext(AppContext);
}

export default function AppPage() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    store.migrate()
      .then(() => {
        setInitialized(true)
      });
  }, []);

  const [appTimestamp, setAppTimestamp] = useState(0);

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

  const [theme, _setTheme] = useState<Theme>(store.theme.get())

  const updateTheme = (theme: Theme) => {
    _setTheme(theme)
    store.theme.set(theme)
  }

  const [settingsDialogOpen, setSettingsDialogOpen] = React.useState(false);

  const [toastOpen, setToastOpen] = useState(false);
  const [toastColor, setToastColor] = useState<AlertColor>("success");
  const [toastText, setToastText] = useState("");

  return initialized ? (
    <AppContext.Provider
      key={appTimestamp}
      value={{
        reload: (alertColor, alertText) => {
          setAppTimestamp(Date.now());
          if (alertColor !== undefined && alertText !== undefined) {
            setToastColor(alertColor);
            setToastText(alertText);
            setToastOpen(true);
          }
        },
      }}>
      <AppThemePage
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
            handleSettingsDialogOpen={() => setSettingsDialogOpen(true)}
          />
        </Box>
        <SettingsDialog
          theme={theme}
          setTheme={updateTheme}
          dialogOpen={settingsDialogOpen}
          handleDialogClose={() => setSettingsDialogOpen(false)}
        />
        <Toast
          open={toastOpen}
          handleClose={() => setToastOpen(false)}
          color={toastColor}
          text={toastText}
        />
      </AppThemePage>
    </AppContext.Provider>
  ) : null;
}
