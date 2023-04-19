import {createTheme, ThemeProvider} from "@mui/material";
import {blue, blueGrey, grey, orange, red} from "@mui/material/colors";
import * as React from "react";
import {Theme} from "../../utils/types";
import {useEffect, useState} from "react";

const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: blue["700"],
    },
    error: {
      main: red["700"],
    },
    warning: {
      main: orange["700"],
    },
    info: {
      main: blueGrey["700"],
    },
    background: {
      default: grey["50"],
      paper: grey["50"],
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: blue["A100"],
    },
    error: {
      main: red["A100"],
    },
    warning: {
      main: orange["A100"],
    },
    info: {
      main: blueGrey["A100"],
    },
    background: {
      default: blueGrey["900"],
      paper: blueGrey["900"],
    },
  },
});

interface AppThemePageProps {
  theme: Theme;
  children: React.ReactNode;
}

export default function AppThemePage(props: AppThemePageProps) {
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (props.theme === "system") {
      const handleDarkModeChange = (event: MediaQueryListEvent) => {
        setThemeMode(event.matches ? "dark" : "light");
      }
      const darkModeMediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
      setThemeMode(darkModeMediaQueryList.matches ? "dark" : "light");
      darkModeMediaQueryList.addEventListener("change", handleDarkModeChange);
      return () => {
        darkModeMediaQueryList.removeEventListener("change", handleDarkModeChange);
      }
    } else {
      setThemeMode(props.theme);
    }
  }, [props.theme]);

  return (
    <ThemeProvider
      theme={themeMode === "dark" ? darkTheme : lightTheme}
    >
      {props.children}
    </ThemeProvider>
  );
}
