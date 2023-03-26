import React, {useEffect, useState} from "react";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import Box from "@mui/material/Box";
import {Chat, ChatConversation} from "../../util/data";
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

function initMessageWrappers(chat: Chat, chatConversations: ChatConversation[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  chatConversations
    .slice()
    .reverse()
    .forEach((chatConversation) => {
      const assistantMessageWrapper = {
        id: `${chatConversation.id}_assistant`,
        message: {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: chatConversation.assistant_message,
        } as ChatCompletionRequestMessage,
        context: false,
      } as MessageWrapper
      result.unshift(assistantMessageWrapper)
      const userMessageWrapper = {
        id: `${chatConversation.id}_user`,
        message: {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: chatConversation.user_message,
        } as ChatCompletionRequestMessage,
        context: false,
      } as MessageWrapper
      result.unshift(userMessageWrapper)
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

function updateContext(chat: Chat, messageWrappers: MessageWrapper[], requestingMessageWrapper: MessageWrapper | null): MessageWrapper[] {
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
      if (requestingMessageWrapper?.id === messageWrapper.id) {
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

function messageWrappersToChatConversations(messageWrappers: MessageWrapper[]): ChatConversation[] {
  const result: ChatConversation[] = []
  let currChatConversation = {
    id: '',
    user_message: '',
    assistant_message: '',
    finish_reason: null,
  } as ChatConversation
  messageWrappers
    .filter((messageWrapper) => messageWrapper.message.role !== 'system')
    .forEach((messageWrapper) => {
      if (messageWrapper.message.role === 'user') {
        currChatConversation = {
          id: messageWrapper.id,
          user_message: messageWrapper.message.content,
          assistant_message: '',
          finish_reason: null,
        } as ChatConversation
        result.push(currChatConversation)
      } else {
        result.pop()
        currChatConversation = {
          ...currChatConversation,
          assistant_message: messageWrapper.message.content,
          finish_reason: '',
        } as ChatConversation
        result.push(currChatConversation)
      }
    })
  return result
}

//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  updateChat: (chat: Chat) => void
}

export default function ChatPage(props: ChatProps) {
  const { chat, updateChat } = props

  const [requestingMessageWrapper, setRequestingMessageWrapper] = useState<MessageWrapper | null>(null)
  const isLoading = requestingMessageWrapper !== null

  const [noContextMessageWrappers, setNoContextMessageWrapper] =
    useState(initMessageWrappers(chat, store.getChatConversations(chat.id)))

  const [messageWrappers, _setMessageWrappers] = useState(updateContext(chat, noContextMessageWrappers, requestingMessageWrapper))

  useEffect(() => {
    _setMessageWrappers(updateContext(chat, noContextMessageWrappers, requestingMessageWrapper))
  }, [chat, noContextMessageWrappers, requestingMessageWrapper])

  useEffect(() => {
    store.updateChatConversations(chat.id, messageWrappersToChatConversations(noContextMessageWrappers));
  }, [chat.id, noContextMessageWrappers])

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
            handleRequestStart={(requestingMessageWrapper, messageWrappers) => {
              setRequestingMessageWrapper(requestingMessageWrapper)
              setNoContextMessageWrapper(messageWrappers)
            }}
            handleRequestSuccess={(chat, messageWrappers) => {
              setRequestingMessageWrapper(null)
              updateChat(chat)
              setNoContextMessageWrapper(messageWrappers)
            }}
            handleRequestError={() => {
              setRequestingMessageWrapper(null)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
