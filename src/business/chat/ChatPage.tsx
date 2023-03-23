import React, {useEffect, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum
} from "openai";
import Box from "@mui/material/Box";
import {Chat, AppData, defaultModel, ChatMessage} from "../../data/data";
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

function beforeRequest(
  messageWrappers: MessageWrapper[],
  input: string,
  setRequestingMessage: (messageWrapper: MessageWrapper) => void,
): MessageWrapper[] {
  const requestingMessage = {
    id: `${new Date().getTime()}`,
    message: {
      content: input,
      role: ChatCompletionRequestMessageRoleEnum.User,
    } as ChatCompletionRequestMessage,
    context: true,
  } as MessageWrapper
  setRequestingMessage(requestingMessage)
  return [...messageWrappers, requestingMessage]
    .filter((message) => message.context)
}

function afterResponse(
  chat: Chat,
  setChat: (chat: Chat) => void,
  chatMessages: ChatMessage[],
  setChatMessages: (chatMessages: ChatMessage[]) => void,
  requestMessageWrappers: MessageWrapper[],
  response: CreateChatCompletionResponse,
) {
  const id = `${new Date().getTime()}`
  const responseMessage = response.choices[0].message!!
  const requestMessageWrapper = requestMessageWrappers[requestMessageWrappers.length - 1]
  const nextChatMessages = [
    ...chatMessages,
    {
      id: requestMessageWrapper.id,
      role: requestMessageWrapper.message.role,
      content: requestMessageWrapper.message.content,
    } as ChatMessage,
    {
      id: id,
      role: responseMessage.role,
      content: responseMessage.content,
    } as ChatMessage,
  ]
  setChatMessages(nextChatMessages)
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessageWrappers
    .map((messageWrapper) => messageWrapper.message.content)
    .concat(responseMessage.content)
    .reduce((acc, message) => acc + message.length + defaultModel.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chat.tokens + responseTotalTokens
  const nextChat = {
    ...chat,
    tokens_per_char: tokensPerChar,
    tokens: tokens,
  } as Chat
  setChat(nextChat)
}

function afterResponseError(
  chatMessages: ChatMessage[],
  setChatMessages: (chatMessages: ChatMessage[]) => void,
  requestMessageWrappers: MessageWrapper[],
) {
  const requestMessageWrapper = requestMessageWrappers[requestMessageWrappers.length - 1]
  const nextChatMessages = [
    ...chatMessages,
    {
      id: requestMessageWrapper.id,
      role: requestMessageWrapper.message.role,
      content: requestMessageWrapper.message.content,
    } as ChatMessage,
  ]
  setChatMessages(nextChatMessages)
}

interface ChatProps {
  appData: AppData,
  chatId: string
  setChat: (chat: Chat) => void
}

export default function ChatPage(props: ChatProps) {
  const { appData, chatId, setChat } = props

  const chat = appData.chats.find((chat) => chat.id === chatId)!!

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const setChatMessagesAndStore = (chatMessages: ChatMessage[]) => {
    setChatMessages(chatMessages)
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatMessages))
  }

  useEffect(() => {
    const storedChatMessages = localStorage.getItem(`chat_${chatId}`)
    if (storedChatMessages) {
      setChatMessages(JSON.parse(storedChatMessages))
    }
  }, [chatId])

  const messageWrappers = chatToMessageWrappers(chat, chatMessages)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestingMessage, setRequestingMessage] = useState<MessageWrapper>()

  const request = () => {
    setIsLoading(true)
    const requestMessageWrappers = beforeRequest(messageWrappers, input, setRequestingMessage)
    setInput('')

    api(appData.openai_api_key)
      .createChatCompletion({
        model: defaultModel.model,
        messages: requestMessageWrappers.map((messageWrapper) => messageWrapper.message),
      })
      .then(response => {
        setRequestingMessage(undefined)
        afterResponse(chat, setChat, chatMessages, setChatMessagesAndStore, requestMessageWrappers,
          response.data)
        setIsLoading(false)
      })
      .catch(() => {
        setRequestingMessage(undefined)
        afterResponseError(chatMessages, setChatMessagesAndStore, requestMessageWrappers)
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
