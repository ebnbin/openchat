import React, {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, ChatConversation, Usage} from "../../util/data";
import ChatMessageList from "./ChatMessageList";
import ChatInputCard from "./ChatInputCard";
import {api, defaultGPTModel} from "../../util/util";
import store from "../../util/store";
import {Button} from "@mui/material";
import LogoImage from "../logo/LogoImage";
import {EditRounded} from "@mui/icons-material";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";

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
      } as ChatConversation
    })
}

function conversationEntityToChatConversation(conversationEntity: ConversationEntity): ChatConversation {
  return {
    id: conversationEntity.id,
    user_message: conversationEntity.userMessage,
    assistant_message: conversationEntity.assistantMessage,
  } as ChatConversation
}

//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  isNewChat: boolean,
  createChat: (chat: Chat) => void,
  updateChat: (chat: Chat) => void,
  openNewChatSettings: (() => void) | null,
}

export default function ChatPage(props: ChatProps) {
  const { chat, isNewChat, createChat, updateChat, openNewChatSettings } = props

  const [noContextConversationEntities, setNoContextConversationEntities] =
    useState(initConversationEntities(store.getChatConversations2(chat)));
  const [conversationEntities, setConversationEntities] =
    useState(updateContext(chat, noContextConversationEntities))

  useEffect(() => {
    setConversationEntities(updateContext(chat, noContextConversationEntities))
  }, [chat, noContextConversationEntities])

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

  //*******************************************************************************************************************

  function getRequestingConversationEntity(chat: Chat, input: string): ConversationEntity {
    const validInput = chat.user_message_template.includes('${message}')
      ? chat.user_message_template.replaceAll('${message}', input)
      : input
    return {
      id: `${new Date().getTime()}`,
      userMessage: validInput,
      assistantMessage: '',
      userMessageRaw: false,
      assistantMessageRaw: false,
      type: ConversationEntityType.REQUESTING,
    } as ConversationEntity
  }

  function getRequestMessages(
    chat: Chat,
    conversationEntities: ConversationEntity[],
    requestingConversationEntity: ConversationEntity,
  ): ChatCompletionRequestMessage[] {
    const result: ChatCompletionRequestMessage[] = []
    if (chat.system_message !== '') {
      result.push(
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: chat.system_message,
        } as ChatCompletionRequestMessage
      )
    }
    [...conversationEntities, requestingConversationEntity]
      .filter((conversationEntity) => conversationEntity.type !== ConversationEntityType.DEFAULT)
      .forEach((conversationEntity) => {
        result.push(
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: conversationEntity.userMessage,
          } as ChatCompletionRequestMessage
        )
        if (conversationEntity.type !== ConversationEntityType.REQUESTING) {
          result.push(
            {
              role: ChatCompletionRequestMessageRoleEnum.Assistant,
              content: conversationEntity.assistantMessage,
            } as ChatCompletionRequestMessage
          )
        }
      })
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
    store.updateUsage({
      tokens: responseTotalTokens,
      image_256: 0,
      image_512: 0,
      image_1024: 0,
    } as Usage)
    return {
      ...chat,
      tokens_per_char: tokensPerChar,
      tokens: tokens,
    } as Chat
  }

  function handleResponse2(
    conversationEntities: ConversationEntity[],
    response: CreateChatCompletionResponse,
  ): ConversationEntity[] {
    const responseMessage = response.choices[0].message!!
    const lastConversationEntity = conversationEntities[conversationEntities.length - 1]
    const copy = [...conversationEntities]
    copy[conversationEntities.length - 1] = {
      ...lastConversationEntity,
      assistantMessage: responseMessage.content,
      type: ConversationEntityType.DEFAULT,
    } as ConversationEntity
    return copy
  }

  function handleResponse2ConversationEntity(
    lastConversationEntity: ConversationEntity,
    response: CreateChatCompletionResponse,
  ): ConversationEntity {
    const responseMessage = response.choices[0].message!!
    return {
      ...lastConversationEntity,
      assistantMessage: responseMessage.content,
      type: ConversationEntityType.DEFAULT,
    } as ConversationEntity
  }

  function handleResponseError(
    conversationEntities: ConversationEntity[],
  ): ConversationEntity[] {
    const lastConversationEntity = conversationEntities[conversationEntities.length - 1]
    const copy = [...conversationEntities]
    copy[conversationEntities.length - 1] = {
      ...lastConversationEntity,
      type: ConversationEntityType.DEFAULT,
    } as ConversationEntity
    return copy
  }

  function handleResponseErrorConversationEntity(
    lastConversationEntity: ConversationEntity,
  ) {
    return {
      ...lastConversationEntity,
      type: ConversationEntityType.DEFAULT,
    } as ConversationEntity
  }

  const handleRequest = (input: string) => {
    if (isNewChat) {
      createChat(chat)
    }

    const requestingConversationEntity = getRequestingConversationEntity(chat, input)
    const requestMessages = getRequestMessages(chat, conversationEntities, requestingConversationEntity)
    const nextConversationEntities = [...conversationEntities, requestingConversationEntity]
    // start
    setNoContextConversationEntities(nextConversationEntities)

    const newConversation = conversationEntityToChatConversation(requestingConversationEntity)
    store.createConversation(chat.id, newConversation)

    scrollToBottom()

    api()
      .createChatCompletion({
        model: defaultGPTModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const nextChat = handleResponse1(chat, requestMessages, response.data)
        updateChat(nextChat)
        const nextConversationEntities2 = handleResponse2(nextConversationEntities, response.data)
        setNoContextConversationEntities(nextConversationEntities2)

        const conversationEntity2 = handleResponse2ConversationEntity(requestingConversationEntity, response.data)
        store.updateConversation(conversationEntityToChatConversation(conversationEntity2))
      })
      .catch(() => {
        const nextConversationEntities2 = handleResponseError(nextConversationEntities)
        setNoContextConversationEntities(nextConversationEntities2)

        // const conversationEntity2 = handleResponseErrorConversationEntity(requestingConversationEntity)
        // store.updateConversation(conversationEntityToChatConversation(conversationEntity2))
      })
  }

  //*******************************************************************************************************************

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
            isLoading={conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.REQUESTING}
            handleRequest={handleRequest}
          />
        </Box>
      </Box>
    </Box>
  )
}
