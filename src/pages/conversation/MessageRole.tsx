import Box from "@mui/material/Box";
import {Avatar, Typography, useTheme} from "@mui/material";
import {FaceRounded} from "@mui/icons-material";
import chatGPTLogo from "../../assets/chatgpt_logo.png";
import React from "react";

interface MessageRoleProps {
  isUser: boolean;
  context: boolean;
  handleClick: () => void;
}

export default function MessageRole(props: MessageRoleProps) {
  const theme = useTheme();

  return (
    <Box
      onClick={props.handleClick}
      sx={{
        height: "32px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Avatar
        variant={props.isUser ? "circular" : "rounded"}
        sx={{
          width: "24px",
          height: "24px",
          marginRight: "8px",
          bgcolor: props.context ? (props.isUser ? theme.palette.primary.main : "#74aa9c") : theme.palette.action.disabled,
        }}
      >
        {props.isUser ? <FaceRounded/> : (
          <img
            src={chatGPTLogo}
            width={"24px"}
            height={"24px"}
          />
        )}
      </Avatar>
      <Typography
        variant={"caption"}
        color={props.context ? theme.palette.text.primary : theme.palette.text.disabled}
        sx={{
          fontWeight: "bold",
          userSelect: "none",
        }}
      >
        {props.isUser ? "You" : "ChatGPT"}
      </Typography>
    </Box>
  );
}
