import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";
import {api} from "../../util/util";
import {Chat, ChatMessage, defaultModel} from "../../util/data";
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
  messageWrappers: MessageWrapper[],
  requestingMessageWrapper: MessageWrapper,
): ChatCompletionRequestMessage[] {
  return [...messageWrappers, requestingMessageWrapper]
    .filter((message) => message.context)
    .map((messageWrapper) => messageWrapper.message)
}

function handleResponse(
  chat: Chat,
  chatMessages: ChatMessage[],
  requestChatMessages: ChatCompletionRequestMessage[],
  requestingMessageWrapper: MessageWrapper,
  response: CreateChatCompletionResponse,
): { nextChat: Chat, nextChatMessages: ChatMessage[] } {
  const id = `${new Date().getTime()}`
  const responseMessage = response.choices[0].message!!
  const nextChatMessages = [
    ...chatMessages,
    {
      id: requestingMessageWrapper.id,
      role: requestingMessageWrapper.message.role,
      content: requestingMessageWrapper.message.content,
    } as ChatMessage,
    {
      id: id,
      role: responseMessage.role,
      content: responseMessage.content,
    } as ChatMessage,
  ]
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestChatMessages
    .map((message) => message.content)
    .concat(responseMessage.content)
    .reduce((acc, message) => acc + message.length + defaultModel.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chat.tokens + responseTotalTokens
  const nextChat = {
    ...chat,
    tokens_per_char: tokensPerChar,
    tokens: tokens,
  } as Chat

  return {
    nextChat: nextChat,
    nextChatMessages: nextChatMessages,
  }
}

function handleResponseError(
  chatMessages: ChatMessage[],
  requestingMessageWrapper: MessageWrapper,
): ChatMessage[] {
  return [
    ...chatMessages,
    {
      id: requestingMessageWrapper.id,
      role: requestingMessageWrapper.message.role,
      content: requestingMessageWrapper.message.content,
    } as ChatMessage,
  ]
}

interface InputCardProps {
  chat: Chat
  chatMessages: ChatMessage[]
  messageWrappers: MessageWrapper[]
  isLoading: boolean
  handleRequestStart: (requestingMessageWrapper: MessageWrapper) => void
  handleRequestSuccess: (chat: Chat, chatMessages: ChatMessage[]) => void
  handleRequestError: (chatMessages: ChatMessage[]) => void
}

export default function ChatInputCard(props: InputCardProps) {
  const { chat, chatMessages, messageWrappers, isLoading, handleRequestStart, handleRequestSuccess,
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
    const requestMessages = getRequestMessages(messageWrappers, requestingMessageWrapper)
    handleRequestStart(requestingMessageWrapper)

    api()
      .createChatCompletion({
        model: defaultModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const { nextChat, nextChatMessages } = handleResponse(chat, chatMessages, requestMessages,
          requestingMessageWrapper, response.data)
        handleRequestSuccess(nextChat, nextChatMessages)
      })
      .catch(() => {
        const nextChatMessages = handleResponseError(chatMessages, requestingMessageWrapper)
        handleRequestError(nextChatMessages)
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
