import {Avatar, Button, CircularProgress, Typography, useTheme} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {
  ContentCopyRounded,
  FaceRounded,
  PsychologyAltRounded,
  TextFormatRounded
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React from "react";
import {contentWidth} from "./ChatPage";
import ChatMarkdownMessage from "./ChatMarkdownMessage";
import {copy} from "../../util/util";

interface ChatMessageItemProps {
  id: number,
  role: ChatCompletionRequestMessageRoleEnum,
  message: string,
  context: boolean,
  isLoading: boolean,
  raw: boolean,
  setRaw: (id: number, isUser: boolean, raw: boolean) => void,
}

export default function ChatMessageItem(props: ChatMessageItemProps) {
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

  const rawOnClick = () => {
    if (isLoading) {
      return
    }
    setRaw(id, role === "user", !raw)
  }

  const handleCopyClick = async (text: string) => {
    await copy(text, null);
  }

  return (
    <Box
      sx={{
        bgcolor: itemColor(),
      }}
    >
      <Box
        sx={{
          maxWidth: contentWidth,
          margin: '0 auto',
          paddingX: '16px',
          paddingY: '0px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            placeItems: 'center',
            paddingTop: '8px',
          }}
        >
          <Avatar
            sx={{
              width: '24px',
              height: '24px',
              marginRight: '8px',
              bgcolor: avatarColor()
            }}
          >
            {avatarIcon()}
          </Avatar>
          <Typography
            variant={'subtitle2'}
            color={context ? theme.palette.text.primary : theme.palette.text.disabled}
            sx={{
              fontWeight: 'bold',
              flexGrow: 1,
            }}
          >
            {role === "user" ? "You" : "OpenAI"}
          </Typography>
          <Button
            variant={'text'}
            size={'small'}
            onClick={rawOnClick}
            startIcon={<TextFormatRounded/>}
            color={'info'}
            sx={{
              textTransform: 'none',
            }}
          >
            {raw ? 'Raw Text' : 'Markdown'}
          </Button>
          <Button
            variant={'text'}
            size={'small'}
            startIcon={<ContentCopyRounded/>}
            onClick={() => handleCopyClick(message)}
            color={'info'}
            sx={{
              textTransform: 'none',
            }}
          >
            {'Copy'}
          </Button>
        </Box>
        <Box
          sx={{
            width: '100%',
          }}
        >
          {(role === "assistant" && isLoading) ? (
            <Box
              sx={{
                height: '56px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CircularProgress
                size={32}
              />
            </Box>
          ) : (
            raw ? (
              <Typography
                sx={{
                  paddingY: '16px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </Typography>
            ) : (
              <ChatMarkdownMessage
                content={message}
              />
            )
          )}
        </Box>
      </Box>
    </Box>
  )
}
