import {Theme} from "../../utils/types";
import {Button, ButtonGroup, Checkbox, FormControlLabel, TextField, useTheme} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import store from "../../utils/store";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

interface SettingsItemThemeProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export default function SettingsItemTheme(props: SettingsItemThemeProps) {
  const theme = useTheme();

  const [darkThemeForCodeBlock, _setDarkThemeForCodeBlock] = useState(store.darkThemeForCodeBlock.get());

  const setDarkThemeForCodeBlock = (darkThemeForCode: boolean) => {
    _setDarkThemeForCodeBlock(darkThemeForCode)
    store.darkThemeForCodeBlock.set(darkThemeForCode)
  }

  return (
    <SettingsItem
      title={"Theme"}
    >
      <ButtonGroup
        size={"small"}
      >
        <Button
          variant={props.theme === "system" ? "contained" : "outlined"}
          onClick={() => props.setTheme("system")}
          sx={{
            textTransform: "none",
          }}
        >
          {"System"}
        </Button>
        <Button
          variant={props.theme === "light" ? "contained" : "outlined"}
          onClick={() => props.setTheme("light")}
          sx={{
            textTransform: "none",
          }}
        >
          {"Light"}
        </Button>
        <Button
          variant={props.theme === "dark" ? "contained" : "outlined"}
          onClick={() => props.setTheme("dark")}
          sx={{
            textTransform: "none",
          }}
        >
          {"Dark"}
        </Button>
      </ButtonGroup>
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={darkThemeForCodeBlock}
              onChange={(event) => setDarkThemeForCodeBlock(event.target.checked)}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: theme.typography.body2.fontSize,
              }}
            >
              {"Dark theme for code block"}
            </Typography>
          }
        />
      </Box>
    </SettingsItem>
  );
}
