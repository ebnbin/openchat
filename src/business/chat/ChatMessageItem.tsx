import {Avatar, ListItem, ListItemAvatar, useTheme} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {FaceRounded, PsychologyAltRounded} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React from "react";
import {contentWidth} from "./ChatPage";
import ChatMessageContent from "./ChatMessageContent";

interface MessageItemProps {
  role: ChatCompletionRequestMessageRoleEnum,
  message: string,
  context: boolean,
}

export default function ChatMessageItem(props: MessageItemProps) {
  const { role, message, context } = props

  const theme = useTheme()

  function itemColor(): string | undefined {
    return role === ChatCompletionRequestMessageRoleEnum.Assistant
      ? theme.palette.action.hover
      : undefined
  }

  function avatarColor(): string | undefined {
    if (context) {
      switch (role) {
        case ChatCompletionRequestMessageRoleEnum.User:
          return 'primary.main'
        case ChatCompletionRequestMessageRoleEnum.Assistant:
          return 'secondary.main'
      }
    }
    return undefined
  }

  function avatarIcon(): JSX.Element | undefined {
    switch (role) {
      case ChatCompletionRequestMessageRoleEnum.User:
        return <FaceRounded />
      case ChatCompletionRequestMessageRoleEnum.Assistant:
        return <PsychologyAltRounded />
    }
    return undefined
  }

  return (
    <Box
      sx={{
        bgcolor: itemColor(),
      }}
    >
      <ListItem
        sx={{
          maxWidth: contentWidth,
          margin: '0 auto',
          alignItems: 'flex-start',
        }}
      >
        <ListItemAvatar
          sx={{
            display: 'flex',
            height: '56px',
            flexShrink: 0,
            placeItems: 'center',
          }}
        >
          <Avatar
            sx={{
              bgcolor: avatarColor()
            }}
          >
            {avatarIcon()}
          </Avatar>
        </ListItemAvatar>
        <Box
          sx={{
            flexGrow: 1,
            width: '0px',
          }}
        >
          <ChatMessageContent
            content={message}
          />
        </Box>
      </ListItem>
    </Box>
  )
}
