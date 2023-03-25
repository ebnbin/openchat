import React, {useEffect, useState} from "react";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import Box from "@mui/material/Box";
import {ChatData, ChatMessageData} from "../../util/data";
import ChatMessageList from "./ChatMessageList";
import ChatInputCard from "./ChatInputCard";
import {defaultGPTModel} from "../../util/util";

export const contentWidth = 900

//*********************************************************************************************************************

export interface MessageWrapper {
  id: string
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chat: ChatData, chatMessages: ChatMessageData[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = defaultGPTModel.maxTokens * chat.context_threshold
  let usedTokens = 0
  if (chat.system_message !== '') {
    usedTokens += chat.system_message.length * chat.tokens_per_char +
      defaultGPTModel.extraCharsPerMessage
  }
  chatMessages
    .slice()
    .reverse()
    .forEach((chatMessage) => {
      let context: boolean
      if (usedTokens > maxContextTokens) {
        context = false
      } else {
        const tokens = (chatMessage.content.length + defaultGPTModel.extraCharsPerMessage) * chat.tokens_per_char
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

interface ChatProps {
  chat: ChatData,
  setChat: (chat: ChatData) => void
}

export default function ChatPage(props: ChatProps) {
  const { chat, setChat } = props

  const [chatMessages, setChatMessages] = useState<ChatMessageData[]>([])

  const setChatMessagesAndStore = (chatMessages: ChatMessageData[]) => {
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

  const [requestingMessageWrapper, setRequestingMessageWrapper] = useState<MessageWrapper | null>(null)
  const isLoading = requestingMessageWrapper !== null

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
          requestingMessageWrapper={requestingMessageWrapper}
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
            chat={chat}
            chatMessages={chatMessages}
            messageWrappers={messageWrappers}
            isLoading={isLoading}
            handleRequestStart={(requestingMessageWrapper) => {
              setRequestingMessageWrapper(requestingMessageWrapper)
            }}
            handleRequestSuccess={(chat, chatMessages) => {
              setRequestingMessageWrapper(null)
              setChat(chat)
              setChatMessagesAndStore(chatMessages)
            }}
            handleRequestError={(chatMessages) => {
              setRequestingMessageWrapper(null)
              setChatMessagesAndStore(chatMessages)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
