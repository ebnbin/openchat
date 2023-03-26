import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";
import {api, defaultGPTModel} from "../../util/util";
import {Chat} from "../../util/data";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";
import {MessageWrapper} from "./ChatPage";

function getRequestingMessageWrapper(
  input: string,
): MessageWrapper {
  return {
    id: `${new Date().getTime()}`,
    message: {
      content: input,
      role: ChatCompletionRequestMessageRoleEnum.User,
    } as ChatCompletionRequestMessage,
    context: true,
  } as MessageWrapper
}

function getRequestMessages(
  chat: Chat,
  messageWrappers: MessageWrapper[],
  requestingMessageWrapper: MessageWrapper,
): ChatCompletionRequestMessage[] {
  const result = [...messageWrappers, requestingMessageWrapper]
    .filter((message) => message.context)
    .map((messageWrapper) => messageWrapper.message)
  if (chat.system_message !== '') {
    result.unshift(
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chat.system_message,
      } as ChatCompletionRequestMessage
    )
  }
  return result
}

function handleResponse1(
  chat: Chat,
  requestMessages: ChatCompletionRequestMessage[],
  response: CreateChatCompletionResponse,
): Chat {
  const responseMessage = response.choices[0].message!!
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessages
    .map((message) => message.content)
    .concat(responseMessage.content)
    .reduce((acc, message) => acc + message.length + defaultGPTModel.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chat.tokens + responseTotalTokens
  return {
    ...chat,
    tokens_per_char: tokensPerChar,
    tokens: tokens,
  } as Chat
}

function handleResponse2(
  chat: Chat,
  messageWrappers: MessageWrapper[],
  response: CreateChatCompletionResponse,
): MessageWrapper[] {
  const responseMessage = response.choices[0].message!!
  return [
    ...messageWrappers,
    {
      id: `${new Date().getTime()}`,
      message: {
        role: responseMessage.role,
        content: responseMessage.content,
      } as ChatCompletionRequestMessage,
      context: false,
    } as MessageWrapper,
  ];
}

interface InputCardProps {
  chat: Chat
  messageWrappers: MessageWrapper[]
  isLoading: boolean
  handleRequestStart: (requestingMessageWrapper: MessageWrapper, messageWrapper: MessageWrapper[]) => void
  handleRequestSuccess: (chat: Chat, messageWrapper: ((prev: MessageWrapper[]) => MessageWrapper[])) => void
  handleRequestError: () => void
}

export default function ChatInputCard(props: InputCardProps) {
  const { chat, messageWrappers, isLoading, handleRequestStart, handleRequestSuccess,
    handleRequestError } = props

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input !== '') {
        request()
      }
    }
  }

  const [input, setInput] = useState('')

  const request = () => {
    const requestingMessageWrapper = getRequestingMessageWrapper(input)
    setInput('')
    const requestMessages = getRequestMessages(chat, messageWrappers, requestingMessageWrapper)
    handleRequestStart(requestingMessageWrapper, [...messageWrappers, requestingMessageWrapper])

    api()
      .createChatCompletion({
        model: defaultGPTModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const nextChat = handleResponse1(chat, requestMessages, response.data)
        handleRequestSuccess(nextChat, (prev) => handleResponse2(nextChat, prev, response.data))
      })
      .catch(() => {
        handleRequestError()
      })
  }

  return (
    <Card
      elevation={8}
      sx={{
        width: '100%',
        padding: '16px',
        paddingTop: '8px',
        borderRadius: 0,
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
      >
        <TextField
          variant={'standard'}
          fullWidth={true}
          multiline={true}
          maxRows={8}
          label={'Message'}
          placeholder={'Hello, who are you?'}
          value={input}
          autoFocus={true}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            flexGrow: 1,
          }}
        />
        <IconButton
          disabled={input === '' || isLoading}
          onClick={request}
        >
          <SendRounded />
        </IconButton>
      </Box>
    </Card>
  )
}
