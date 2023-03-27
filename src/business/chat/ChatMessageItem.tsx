import {Avatar, CircularProgress, ListItem, ListItemAvatar, useTheme} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {FaceRounded, PsychologyAltRounded} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React from "react";
import {contentWidth} from "./ChatPage";
import ChatMessageContent from "./ChatMessageContent";

interface MessageItemProps {
  id: string,
  role: ChatCompletionRequestMessageRoleEnum,
  message: string,
  context: boolean,
  isLoading: boolean,
  raw: boolean,
  setRaw: ((id: string, raw: boolean) => void) | null,
}

export default function ChatMessageItem(props: MessageItemProps) {
  const { id, role, message, context, isLoading, raw, setRaw } = props

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

  const avatarOnClick = () => {
    if (setRaw === null) {
      return
    }
    setRaw(id, !raw)
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
          onClick={avatarOnClick}
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
          {isLoading ? (
              <Box
                sx={{
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <CircularProgress/>
              </Box>
            ) : (
            <ChatMessageContent
              content={message}
              raw={raw}
            />
          )}
        </Box>
      </ListItem>
    </Box>
  )
}
