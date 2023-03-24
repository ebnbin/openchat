import React, {useEffect, useState} from "react";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import Box from "@mui/material/Box";
import {Chat, ChatMessage, defaultModel} from "../../data/data";
import {CreateChatCompletionResponse} from "openai/api";
import {api} from "../../util/util";
import ChatMessageList from "./ChatMessageList";
import ChatInputCard from "./ChatInputCard";

export const contentWidth = 900

//*********************************************************************************************************************

export interface MessageWrapper {
  id: string
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chat: Chat, chatMessages: ChatMessage[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = defaultModel.maxTokens * chat.context_threshold
  let usedTokens = 0
  if (chat.system_message !== '') {
    usedTokens += chat.system_message.length * chat.tokens_per_char +
      defaultModel.extraCharsPerMessage
  }
  chatMessages
    .slice()
    .reverse()
    .forEach((chatMessage) => {
      let context: boolean
      if (usedTokens > maxContextTokens) {
        context = false
      } else {
        const tokens = (chatMessage.content.length + defaultModel.extraCharsPerMessage) * chat.tokens_per_char
        usedTokens += tokens
        context = usedTokens <= maxContextTokens
      }
      const messageWrapper = {
        id: chatMessage.id,
        message: {
          role: chatMessage.role,
          content: chatMessage.content,
        } as ChatCompletionRequestMessage,
        context: context,
      } as MessageWrapper
      result.unshift(messageWrapper)
    })
  if (chat.system_message !== '') {
    const systemMessageWrapper = {
      id: chat.id,
      message: {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chat.system_message,
      } as ChatCompletionRequestMessage,
      context: true,
    } as MessageWrapper
    result.unshift(systemMessageWrapper)
  }
  return result
}

//*********************************************************************************************************************

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

interface ChatProps {
  apiKey: string,
  chat: Chat,
  setChat: (chat: Chat) => void
}

export default function ChatPage(props: ChatProps) {
  const { apiKey, chat, setChat } = props

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const setChatMessagesAndStore = (chatMessages: ChatMessage[]) => {
    setChatMessages(chatMessages)
    localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chatMessages))
  }

  useEffect(() => {
    const storedChatMessages = localStorage.getItem(`chat_${chat.id}`)
    if (storedChatMessages) {
      setChatMessages(JSON.parse(storedChatMessages))
    }
  }, [chat.id])

  const messageWrappers = chatToMessageWrappers(chat, chatMessages)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestingMessage, setRequestingMessage] = useState<MessageWrapper>()

  const request = () => {
    setIsLoading(true)
    const requestingMessageWrapper = getRequestingMessageWrapper(input)
    setRequestingMessage(requestingMessageWrapper)
    setInput('')
    const requestMessages = getRequestMessages(messageWrappers, requestingMessageWrapper)

    api(apiKey)
      .createChatCompletion({
        model: defaultModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const { nextChat, nextChatMessages } = handleResponse(chat, chatMessages, requestMessages,
          requestingMessageWrapper, response.data)
        setRequestingMessage(undefined)
        setChat(nextChat)
        setChatMessagesAndStore(nextChatMessages)
        setIsLoading(false)
      })
      .catch(() => {
        const nextChatMessages = handleResponseError(chatMessages, requestingMessageWrapper)
        setRequestingMessage(undefined)
        setChatMessagesAndStore(nextChatMessages)
        setIsLoading(false)
      })
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          padding: '0px',
          paddingBottom: '128px',
          overflow: 'auto',
        }}
      >
        <ChatMessageList
          messageWrappers={messageWrappers}
          requestingMessage={requestingMessage}
          isLoading={isLoading}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          flexShrink: 0,
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: contentWidth,
            margin: '0 auto',
          }}
        >
          <ChatInputCard
            input={input}
            setInput={setInput}
            isRequesting={isLoading}
            request={request}
          />
        </Box>
      </Box>
    </Box>
  )
}
