import * as React from 'react';
import {createTheme, ThemeProvider} from "@mui/material";
import {SettingsDialog} from "../settings/SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {useIsDarkMode} from "../../util/util";
import HomePage from "../home/HomePage";

export default function AppPage() {
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
        setSettingsOpen={setSettingsOpen}
      />
      <SettingsDialog
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
