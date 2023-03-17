import React, {ChangeEvent, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage, ChatCompletionResponseMessageRoleEnum,
  Configuration,
  OpenAIApi
} from "openai";
import Box from "@mui/material/Box";
import {
  Avatar,
  Card, Divider,
  IconButton, InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField
} from "@mui/material";
import SendIcon from "@mui/icons-material/SendRounded";
import DownloadingIcon from "@mui/icons-material/DownloadingRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccountsRounded";
import FaceIcon from "@mui/icons-material/FaceRounded";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAltRounded";

interface ChatProps {
  apiKey: string
  model: string
  maxTokens: number,
}

class Message {
  constructor(public message: ChatCompletionRequestMessage, public remember: boolean) {
  }
}

function responseMessageToRequestMessage(responseMessage: ChatCompletionResponseMessage): ChatCompletionRequestMessage {
  let role: ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum.Assistant
  switch (responseMessage.role) {
    case ChatCompletionResponseMessageRoleEnum.System:
      role = ChatCompletionRequestMessageRoleEnum.System;
      break;
    case ChatCompletionResponseMessageRoleEnum.User:
      role = ChatCompletionRequestMessageRoleEnum.User;
      break;
    case ChatCompletionResponseMessageRoleEnum.Assistant:
      role = ChatCompletionRequestMessageRoleEnum.Assistant;
      break;
    default:
      break;
  }
  return {
    role: role,
    content: responseMessage.content,
  } as ChatCompletionRequestMessage
}

function calcPromptMessages(messages: Message[], input: string, usedTokens: number, maxTokens: number): Message[] {
  const charCount = messages
    .filter((message) => message.remember)
    .reduce((acc, cur) => acc + cur.message.content.length, 0)
  const tokenPerChar = usedTokens / charCount
  let currentTokens = 0
  const result: Message[] = [
    new Message(
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: input,
      } as ChatCompletionRequestMessage,
      true,
    )
  ]
  messages.reverse().forEach((message) => {
    const token = message.message.content.length * tokenPerChar
    currentTokens += token
    const newMessage = {...message}
    if (currentTokens <= maxTokens) {
      newMessage.remember = true
    } else {
      newMessage.remember = false
    }
    result.unshift(newMessage)
  })
  return result
}

export function Chat(props: ChatProps) {
  const { apiKey, model, maxTokens } = props

  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [usedTokens, setUsedTokens] = useState(0)

  const isInputEmpty = inputMessage === ''

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputMessage(event.target.value)
  };

  const request = async () => {
    if (isInputEmpty) {
      return
    }

    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const nextMessages = calcPromptMessages(messages, inputMessage, usedTokens, maxTokens * 0.9)

    setMessages(nextMessages)
    setInputMessage('')

    setIsLoading(true)

    const response = await openai
      .createChatCompletion({
        model: model,
        messages: nextMessages
          .filter((message) => message.remember)
          .map((message) => {
            return message.message
          }),
      })
      .catch(() => {
        setIsLoading(false)
      })
    const responseMessage = responseMessageToRequestMessage(response.data.choices[0].message)

    setUsedTokens(response.data.usage.total_tokens)
    setMessages([...nextMessages, new Message(responseMessage, true)])

    setIsLoading(false)
  }

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      width={'100%'}
      height={'100%'}
      position={'relative'}
    >
      <Box
        flexShrink={0}>
        usedTokens={usedTokens}
      </Box>
      <Box
        width={'100%'}
        flexGrow={1}
        overflow={'auto'}
        padding={'0px'}
        paddingBottom={'72px'}
      >
        <Box
          maxWidth={960}
          margin={'0 auto'}
        >
          <MessageList
            messages={messages}
          />
        </Box>
      </Box>
      <Box
        width={'100%'}
        flexShrink={0}
        position={'absolute'}
        bottom={0}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 960,
            margin: '0 auto',
            padding: '16px',
            paddingTop: '8px',
            borderRadius: 0,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
          elevation={8}
        >
          <Box
            display={'flex'}
            flexDirection={'row'}
            width={'100%'}
            alignItems={'flex-end'}
          >
            <TextField
              variant={'standard'}
              fullWidth={true}
              multiline={true}
              maxRows={8}
              label={'Message'}
              sx={{
                flexGrow: 1,
              }}
              value={inputMessage}
              onChange={handleInputChange}
            />
            <IconButton
              sx={{
                display: isLoading ? 'none' : 'inline',
              }}
              onClick={request}
            >
              <SendIcon/>
            </IconButton>
            <IconButton
              sx={{
                display: isLoading ? 'inline' : 'none',
              }}
            >
              <DownloadingIcon/>
            </IconButton>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <List>
      {
        messages.map((message) => {
          let icon;
          switch (message.message.role) {
            case ChatCompletionRequestMessageRoleEnum.User:
              icon = <FaceIcon/>
              break
            case ChatCompletionRequestMessageRoleEnum.Assistant:
              icon = <PsychologyAltIcon/>
              break
            default:
              icon = <ManageAccountsIcon/>
              break
          }
          return (
            <Box>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.remember ? 'primary.main' : undefined }}>
                    {icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.message.content}
                />
              </ListItem>
              <Divider variant="inset" />
            </Box>
          )
        })
      }
    </List>
  );
}
