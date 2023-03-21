import React from 'react';
import ResponsiveDrawer from "./ResponsiveDrawer";
import {createTheme, ThemeProvider} from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";

function App() {
  const theme = createTheme({
    palette: {
      mode: 'light',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ResponsiveDrawer />
    </ThemeProvider>
  );
}

export default App;
