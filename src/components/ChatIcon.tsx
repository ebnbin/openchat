import {Avatar, useTheme} from "@mui/material";
import React from "react";
import {ChatRounded} from "@mui/icons-material";
import {IconColor, IconTextSize} from "../utils/types";
import {
  amber,
  blue, blueGrey, brown,
  cyan, deepOrange,
  deepPurple,
  green, grey,
  indigo,
  lightBlue,
  lightGreen, lime, orange,
  pink,
  purple,
  red,
  teal, yellow
} from "@mui/material/colors";

export const iconColorValue = (isDarkMode: boolean, iconColor: IconColor): string => {
  const index = isDarkMode ? "A100" : "700";
  switch (iconColor) {
    case "":
      return "transparent";
    case "red":
      return red[index];
    case "pink":
      return pink[index];
    case "purple":
      return purple[index];
    case "deepPurple":
      return deepPurple[index];
    case "indigo":
      return indigo[index];
    case "blue":
      return blue[index];
    case "lightBlue":
      return lightBlue[index];
    case "cyan":
      return cyan[index];
    case "teal":
      return teal[index];
    case "green":
      return green[index];
    case "lightGreen":
      return lightGreen[index];
    case "lime":
      return lime[index];
    case "yellow":
      return yellow[index];
    case "amber":
      return amber[index];
    case "orange":
      return orange[index];
    case "deepOrange":
      return deepOrange[index];
    case "brown":
      return brown[index];
    case "grey":
      return grey[index];
    case "blueGrey":
      return blueGrey[index];
    default:
      return "transparent";
  }
}

export const iconTextSizeValue = (iconTextSize: IconTextSize): number => {
  switch (iconTextSize) {
    case "small":
      return 10;
    case "medium":
      return 20;
    case "large":
      return 30;
    default:
      return 20;
  }
}

interface ChatIconProps {
  iconText: string;
  iconTextSize: IconTextSize;
  iconColor: IconColor;
}

export default function ChatIcon(props: ChatIconProps) {
  const theme = useTheme();

  const bgColor = iconColorValue(theme.palette.mode === "dark", props.iconColor);
  const color = props.iconColor === "" ? theme.palette.text.primary : theme.palette.getContrastText(bgColor);

  return (
    <Avatar
      variant={"rounded"}
      sx={{
        fontSize: `${iconTextSizeValue(props.iconTextSize)}px`,
        textAlign: "center",
        color: color,
        bgcolor: bgColor,
      }}
    >
      {props.iconText === "" ? <ChatRounded/> : props.iconText}
    </Avatar>
  );
}
