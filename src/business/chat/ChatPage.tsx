import React, {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, Conversation} from "../../util/data";
import ChatConversationList from "./ChatConversationList";
import ChatInput from "./ChatInput";
import {defaultOpenAIModel, openAIApi} from "../../util/util";
import store from "../../util/store";
import {Button} from "@mui/material";
import Logo from "../../component/Logo";
import {EditRounded} from "@mui/icons-material";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";

export const contentWidth = 900

//*********************************************************************************************************************

export enum ConversationEntityType {
  Default,
  Context,
  Requesting,
}

export interface ConversationEntity {
  id: number;
  userMessage: string;
  assistantMessage: string;
  userMessageMarkdown: boolean,
  assistantMessageMarkdown: boolean,
  type: ConversationEntityType;
}

function initConversationEntities(chatConversations: Conversation[]): ConversationEntity[] {
  return chatConversations
    .map((chatConversation) => {
      return {
        id: chatConversation.id,
        userMessage: chatConversation.user_message,
        assistantMessage: chatConversation.assistant_message,
        userMessageMarkdown: true,
        assistantMessageMarkdown: true,
        type: ConversationEntityType.Default,
      } as ConversationEntity
    })
}

function updateContext(chat: Chat, conversationEntities: ConversationEntity[]): ConversationEntity[] {
  const result: ConversationEntity[] = []
  const maxContextTokens = defaultOpenAIModel.maxTokens * chat.context_threshold
  let usedTokens = 0
  if (chat.system_message !== '') {
    usedTokens += chat.system_message.length * chat.tokens_per_char +
      defaultOpenAIModel.extraCharsPerMessage
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
          chat.tokens_per_char + 2 * defaultOpenAIModel.extraCharsPerMessage
        usedTokens += tokens
        context = usedTokens <= maxContextTokens
      }
      let type = conversationEntity.type
      if (type !== ConversationEntityType.Requesting) {
        type = context ? ConversationEntityType.Context : ConversationEntityType.Default
      }
      const newConversationEntity = {
        ...conversationEntity,
        type: type,
      } as ConversationEntity
      result.unshift(newConversationEntity)
    })
  return result
}

function conversationEntitiesToChatConversations(conversationEntities: ConversationEntity[]): Conversation[] {
  return conversationEntities
    .map((conversationEntity) => {
      return {
        id: conversationEntity.id,
        user_message: conversationEntity.userMessage,
        assistant_message: conversationEntity.assistantMessage,
      } as Conversation
    })
}

function conversationEntityToChatConversation(conversationEntity: ConversationEntity): Conversation {
  return {
    id: conversationEntity.id,
    user_message: conversationEntity.userMessage,
    assistant_message: conversationEntity.assistantMessage,
  } as Conversation
}

//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  isNewChat: boolean,
  createChat: (chat: Chat) => void,
  updateChat: (chatId: number, chat: Partial<Chat>) => void,
  openNewChatSettings: (() => void) | null,
}

export default function ChatPage(props: ChatProps) {
  const { chat, isNewChat, createChat, updateChat, openNewChatSettings } = props

  const [noContextConversationEntities, setNoContextConversationEntities] =
    useState<ConversationEntity[]>([]);

  useEffect(() => {
    store.getConversationsAsync(chat.id)
      .then((chatConversations) => {
        setNoContextConversationEntities(initConversationEntities(chatConversations))
      });
  }, [chat.id]);

  const [conversationEntities, setConversationEntities] =
    useState<ConversationEntity[]>([])

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

  function newRequestingConversation(input: string): Conversation {
    const validInput = chat.user_message_template.includes('{{message}}')
      ? chat.user_message_template.replaceAll('{{message}}', input)
      : input
    return store.newConversation({
      user_message: validInput,
    })
  }

  function getRequestingConversationEntity(chat: Chat, conversation: Conversation): ConversationEntity {
    return {
      id: conversation.id,
      userMessage: conversation.user_message,
      assistantMessage: conversation.assistant_message,
      userMessageMarkdown: true,
      assistantMessageMarkdown: true,
      type: ConversationEntityType.Requesting,
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
      .filter((conversationEntity) => conversationEntity.type !== ConversationEntityType.Default)
      .forEach((conversationEntity) => {
        result.push(
          {
            role: ChatCompletionRequestMessageRoleEnum.User,
            content: conversationEntity.userMessage,
          } as ChatCompletionRequestMessage
        )
        if (conversationEntity.type !== ConversationEntityType.Requesting) {
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
      .reduce((acc, message) => acc + message.length + defaultOpenAIModel.extraCharsPerMessage, 0)
    const tokensPerChar = responseTotalTokens / charCount
    const tokens = chat.tokens + responseTotalTokens
    store.increaseUsageAsync({
      tokens: responseTotalTokens,
    })
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
      type: ConversationEntityType.Default,
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
      type: ConversationEntityType.Default,
    } as ConversationEntity
  }

  function handleResponseError(
    conversationEntities: ConversationEntity[],
  ): ConversationEntity[] {
    const lastConversationEntity = conversationEntities[conversationEntities.length - 1]
    const copy = [...conversationEntities]
    copy[conversationEntities.length - 1] = {
      ...lastConversationEntity,
      type: ConversationEntityType.Default,
    } as ConversationEntity
    return copy
  }

  function handleResponseErrorConversationEntity(
    lastConversationEntity: ConversationEntity,
  ) {
    return {
      ...lastConversationEntity,
      type: ConversationEntityType.Default,
    } as ConversationEntity
  }

  const handleDeleteConversationClick = (conversationEntity: ConversationEntity) => {
    const nextConversationEntities = conversationEntities.filter((entity) => entity.id !== conversationEntity.id)
    setNoContextConversationEntities(nextConversationEntities)
    store.deleteConversationAsync(chat.id, conversationEntity.id)
  }

  const handleRequest = (input: string) => {
    if (isNewChat) {
      createChat(chat)
    }

    const newConversation = newRequestingConversation(input)
    const requestingConversationEntity = getRequestingConversationEntity(chat, newConversation)
    const requestMessages = getRequestMessages(chat, conversationEntities, requestingConversationEntity)
    const nextConversationEntities = [...conversationEntities, requestingConversationEntity]
    // start
    setNoContextConversationEntities(nextConversationEntities)

    store.createConversationAsync(chat.id, newConversation)

    scrollToBottom()

    openAIApi()
      .createChatCompletion({
        model: defaultOpenAIModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const nextChat = handleResponse1(chat, requestMessages, response.data)
        updateChat(chat.id, {
          tokens_per_char: nextChat.tokens_per_char,
          tokens: nextChat.tokens,
        })
        const nextConversationEntities2 = handleResponse2(nextConversationEntities, response.data)
        setNoContextConversationEntities(nextConversationEntities2)

        const conversationEntity2 = handleResponse2ConversationEntity(requestingConversationEntity, response.data)
        store.updateConversationAsync(chat.id, newConversation.id, conversationEntityToChatConversation(conversationEntity2))
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
        <ChatConversationList
          conversationEntities={conversationEntities}
          updateConversationEntitiesNoStore={setConversationEntities}
          deleteConversationEntity={handleDeleteConversationClick}
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
          <Logo/>
          <Button
            variant={'outlined'}
            startIcon={<EditRounded/>}
            sx={{
              marginTop: '32px',
            }}
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
          <ChatInput
            isLoading={conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.Requesting}
            handleRequest={handleRequest}
          />
        </Box>
      </Box>
    </Box>
  )
}
