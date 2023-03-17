import React, {ChangeEvent, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessage, ChatCompletionResponseMessageRoleEnum,
  Configuration,
  OpenAIApi
} from "openai";
import Box from "@mui/material/Box";
import {Card, IconButton, TextField} from "@mui/material";
import SendIcon from "@mui/icons-material/SendRounded";
import DownloadingIcon from "@mui/icons-material/DownloadingRounded";

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
        padding={'16px'}
        paddingBottom={'88px'}
      >
        <Box
          maxWidth={960}
          margin={'0 auto'}
        >
          <ul>
            {messages.map((message: Message) => {
              return <li>{`[${message.message.role}, ${message.remember}] ${message.message.content}`}</li>
            })}
          </ul>
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
            maxWidth: 992,
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
