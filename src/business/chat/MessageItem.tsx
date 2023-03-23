import {Avatar, ListItem, ListItemAvatar, useTheme} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {FaceRounded, PsychologyAltRounded} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React from "react";
import {contentWidth, MessageWrapper} from "./ChatPage";
import MessageContent from "./MessageContent";

interface MessageItemProps {
  messageWrapper: MessageWrapper
}

export default function MessageItem(props: MessageItemProps) {
  const { messageWrapper } = props

  const theme = useTheme()

  function itemColor(): string | undefined {
    return messageWrapper.message.role === ChatCompletionRequestMessageRoleEnum.Assistant
      ? theme.palette.action.hover
      : undefined
  }

  function avatarColor(): string | undefined {
    if (messageWrapper.context) {
      switch (messageWrapper.message.role) {
        case ChatCompletionRequestMessageRoleEnum.User:
          return 'primary.main'
        case ChatCompletionRequestMessageRoleEnum.Assistant:
          return 'secondary.main'
      }
    }
    return undefined
  }

  function avatarIcon(): JSX.Element | undefined {
    switch (messageWrapper.message.role) {
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
          <MessageContent
            content={messageWrapper.message.content}
          />
        </Box>
      </ListItem>
    </Box>
  )
}
