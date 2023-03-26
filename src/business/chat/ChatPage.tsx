import React, {useEffect, useState} from "react";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import Box from "@mui/material/Box";
import {Chat, ChatMessage} from "../../util/data";
import ChatMessageList from "./ChatMessageList";
import ChatInputCard from "./ChatInputCard";
import {defaultGPTModel} from "../../util/util";
import store from "../../util/store";

export const contentWidth = 900

//*********************************************************************************************************************

export interface MessageWrapper {
  id: string
  message: ChatCompletionRequestMessage
  context: boolean
}

function initMessageWrappers(chat: Chat, chatMessages: ChatMessage[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  chatMessages
    .slice()
    .reverse()
    .forEach((chatMessage) => {
      const messageWrapper = {
        id: chatMessage.id,
        message: {
          role: chatMessage.role,
          content: chatMessage.content,
        } as ChatCompletionRequestMessage,
        context: false,
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
      context: false,
    } as MessageWrapper
    result.unshift(systemMessageWrapper)
  }
  return result
}

function updateContext(chat: Chat, messageWrappers: MessageWrapper[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = defaultGPTModel.maxTokens * chat.context_threshold
  let usedTokens = 0
  if (chat.system_message !== '') {
    usedTokens += chat.system_message.length * chat.tokens_per_char +
      defaultGPTModel.extraCharsPerMessage
  }
  messageWrappers
    .slice()
    .reverse()
    .forEach((messageWrapper) => {
      let context: boolean
      if (usedTokens > maxContextTokens) {
        context = false
      } else {
        const tokens = (messageWrapper.message.content.length + defaultGPTModel.extraCharsPerMessage) * chat.tokens_per_char
        usedTokens += tokens
        context = usedTokens <= maxContextTokens
      }
      if (messageWrapper.message.role === 'system') {
        context = true
      }
      const nextMessageWrapper = {
        ...messageWrapper,
        context: context,
      } as MessageWrapper
      result.unshift(nextMessageWrapper)
    })
  return result
}

function messageWrappersToChatMessages(messageWrappers: MessageWrapper[]): ChatMessage[] {
  return messageWrappers
    .filter((messageWrapper) => messageWrapper.message.role !== 'system')
    .map((messageWrapper) => {
      return {
        id: messageWrapper.id,
        role: messageWrapper.message.role,
        content: messageWrapper.message.content,
      } as ChatMessage
    })
}

//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  updateChat: (chat: Chat) => void
}

export default function ChatPage(props: ChatProps) {
  const { chat, updateChat } = props

  const [noContextMessageWrappers, setNoContextMessageWrapper] =
    useState(initMessageWrappers(chat, store.getChatMessages(chat.id)))

  const [messageWrappers, _setMessageWrappers] = useState(updateContext(chat, noContextMessageWrappers))

  useEffect(() => {
    _setMessageWrappers(updateContext(chat, noContextMessageWrappers))
  }, [chat, noContextMessageWrappers])

  useEffect(() => {
    store.updateChatMessages(chat.id, messageWrappersToChatMessages(noContextMessageWrappers));
  }, [chat.id, noContextMessageWrappers])

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
            messageWrappers={messageWrappers}
            isLoading={isLoading}
            handleRequestStart={(requestingMessageWrapper) => {
              setRequestingMessageWrapper(requestingMessageWrapper)
            }}
            handleRequestSuccess={(chat, messageWrappers) => {
              setRequestingMessageWrapper(null)
              updateChat(chat)
              setNoContextMessageWrapper(messageWrappers)
            }}
            handleRequestError={(messageWrappers) => {
              setRequestingMessageWrapper(null)
              setNoContextMessageWrapper(messageWrappers)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
