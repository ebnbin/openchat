import {Avatar, useTheme} from "@mui/material";
import React from "react";
import {colorValue} from "./ColorPicker";
import {ChatRounded} from "@mui/icons-material";

interface ChatIconProps {
  iconText: string;
  iconTextSize: string,
  iconColor: string;
}

export default function ChatIcon(props: ChatIconProps) {
  const theme = useTheme();

  const fontSize = () => {
    switch (props.iconTextSize) {
      case 'small':
        return '10px';
      case 'medium':
        return '20px';
      case 'large':
        return '30px';
      default:
        return '20px';
    }
  }
  const bgColor = colorValue(theme, props.iconColor);
  const textColor = bgColor === 'transparent' ? theme.palette.getContrastText(theme.palette.background.default) : theme.palette.getContrastText(bgColor);

  return (
    <Avatar
      variant={'rounded'}
      sx={{
        fontSize: fontSize(),
        textAlign: 'center',
        color: props.iconText === '' ? 'inherit' : textColor,
        bgcolor: bgColor,
      }}
    >
      {props.iconText === '' ? <ChatRounded/> : props.iconText}
    </Avatar>
  )
}
