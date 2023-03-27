import React, {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, ChatConversation} from "../../util/data";
import ChatMessageList from "./ChatMessageList";
import ChatInputCard from "./ChatInputCard";
import {defaultGPTModel} from "../../util/util";
import store from "../../util/store";
import {Button} from "@mui/material";
import LogoImage from "../logo/LogoImage";
import {EditRounded} from "@mui/icons-material";

export const contentWidth = 900

//*********************************************************************************************************************

export enum ConversationEntityType {
  DEFAULT,
  CONTEXT,
  REQUESTING,
}

export interface ConversationEntity {
  id: string;
  userMessage: string;
  assistantMessage: string;
  finishReason: string | null;
  userMessageRaw: boolean,
  assistantMessageRaw: boolean,
  type: ConversationEntityType;
}

function initConversationEntities(chatConversations: ChatConversation[]): ConversationEntity[] {
  return chatConversations
    .map((chatConversation) => {
      return {
        id: chatConversation.id,
        userMessage: chatConversation.user_message,
        assistantMessage: chatConversation.assistant_message,
        finishReason: chatConversation.finish_reason === null ? '' : chatConversation.finish_reason,
        userMessageRaw: false,
        assistantMessageRaw: false,
        type: ConversationEntityType.DEFAULT,
      } as ConversationEntity
    })
}

function updateContext(chat: Chat, conversationEntities: ConversationEntity[]): ConversationEntity[] {
  const result: ConversationEntity[] = []
  const maxContextTokens = defaultGPTModel.maxTokens * chat.context_threshold
  let usedTokens = 0
  if (chat.system_message !== '') {
    usedTokens += chat.system_message.length * chat.tokens_per_char +
      defaultGPTModel.extraCharsPerMessage
  }
  conversationEntities
    .slice()
    .reverse()
    .forEach((conversationEntity) => {
      let context: boolean
      if (usedTokens > maxContextTokens) {
        context = false
      } else {
        const tokens = (conversationEntity.userMessage.length + conversationEntity.assistantMessage.length) *
          chat.tokens_per_char + 2 * defaultGPTModel.extraCharsPerMessage
        usedTokens += tokens
        context = usedTokens <= maxContextTokens
      }
      let type = conversationEntity.type
      if (type !== ConversationEntityType.REQUESTING) {
        type = context ? ConversationEntityType.CONTEXT : ConversationEntityType.DEFAULT
      }
      const newConversationEntity = {
        ...conversationEntity,
        type: type,
      } as ConversationEntity
      result.unshift(newConversationEntity)
    })
  return result
}

function conversationEntitiesToChatConversations(conversationEntities: ConversationEntity[]): ChatConversation[] {
  return conversationEntities
    .map((conversationEntity) => {
      return {
        id: conversationEntity.id,
        user_message: conversationEntity.userMessage,
        assistant_message: conversationEntity.assistantMessage,
        finish_reason: conversationEntity.finishReason,
      } as ChatConversation
    })
}

//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  isNewChat: boolean,
  createOrUpdateChat: (chat: Chat, isNewChat: boolean) => void,
  openNewChatSettings: (() => void) | null,
}

export default function ChatPage(props: ChatProps) {
  const { chat, isNewChat, createOrUpdateChat, openNewChatSettings } = props

  const [noContextConversationEntities, setNoContextConversationEntities] =
    useState(initConversationEntities(store.getChatConversations(chat.id)));
  const [conversationEntities, setConversationEntities] =
    useState(updateContext(chat, noContextConversationEntities))

  useEffect(() => {
    setConversationEntities(updateContext(chat, noContextConversationEntities))
  }, [chat, noContextConversationEntities])

  useEffect(() => {
    if (!isNewChat) {
      store.updateChatConversations(chat.id, conversationEntitiesToChatConversations(noContextConversationEntities));
    }
  }, [isNewChat, chat.id, noContextConversationEntities])

  const listRef = useRef<HTMLUListElement>(null)

  const scrollToBottom = () => {
    const listNode = listRef.current
    if (listNode) {
      listNode.scrollTop = listNode.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

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
        ref={listRef}
        sx={{
          width: '100%',
          flexGrow: 1,
          padding: '0px',
          paddingBottom: '128px',
          overflow: 'auto',
          display: isNewChat ? 'none' : 'block',
        }}
      >
        <ChatMessageList
          conversationEntities={conversationEntities}
          setConversationEntities={setConversationEntities}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: !isNewChat ? 'none' : 'flex',
          paddingBottom: '72px',
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <LogoImage/>
          <Button
            variant={'outlined'}
            startIcon={<EditRounded/>}
            onClick={() => {
              if (openNewChatSettings !== null) {
                openNewChatSettings()
              }
            }}
          >
            New chat settings
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
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
            conversationEntities={conversationEntities}
            handleCreateChat={isNewChat ? ((chat) => createOrUpdateChat(chat, true)) : null}
            handleRequestStart={(conversationEntities) => {
              setNoContextConversationEntities(conversationEntities)
              scrollToBottom()
            }}
            handleRequestSuccess={(chat, conversationEntities) => {
              createOrUpdateChat(chat, false)
              setNoContextConversationEntities(conversationEntities)
            }}
            handleRequestError={(conversationEntities) => {
              setNoContextConversationEntities(conversationEntities)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
