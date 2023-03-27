import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";
import {api, defaultGPTModel} from "../../util/util";
import {Chat} from "../../util/data";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";
import {ConversationEntity, ConversationEntityType} from "./ChatPage";

function getRequestingConversationEntity(input: string): ConversationEntity {
  return {
    id: `${new Date().getTime()}`,
    userMessage: input,
    assistantMessage: '',
    finishReason: null,
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
    finishReason: response.choices[0].finish_reason,
    type: ConversationEntityType.DEFAULT,
  } as ConversationEntity
  return copy
}

function handleResponseError(
  conversationEntities: ConversationEntity[],
): ConversationEntity[] {
  const lastConversationEntity = conversationEntities[conversationEntities.length - 1]
  const copy = [...conversationEntities]
  copy[conversationEntities.length - 1] = {
    ...lastConversationEntity,
    finishReason: '',
    type: ConversationEntityType.DEFAULT,
  } as ConversationEntity
  return copy
}

interface InputCardProps {
  chat: Chat,
  conversationEntities: ConversationEntity[],
  handleCreateChat: ((chat: Chat) => void) | null,
  handleRequestStart: (conversationEntities: ConversationEntity[]) => void
  handleRequestSuccess: (chat: Chat, conversationEntities: ((prev: ConversationEntity[]) => ConversationEntity[])) => void
  handleRequestError: (conversationEntities: ((prev: ConversationEntity[]) => ConversationEntity[])) => void
}

export default function ChatInputCard(props: InputCardProps) {
  const { chat, conversationEntities, handleCreateChat, handleRequestStart, handleRequestSuccess,
    handleRequestError } = props

  const isLoading = conversationEntities.length > 0 &&
    conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.REQUESTING

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.metaKey) {
      event.preventDefault()
      if (input !== '') {
        request()
      }
    }
  }

  const [input, setInput] = useState('')

  const request = () => {
    if (handleCreateChat != null) {
      handleCreateChat(chat)
    }

    const requestingConversationEntity = getRequestingConversationEntity(input)
    setInput('')
    const requestMessages = getRequestMessages(chat, conversationEntities, requestingConversationEntity)
    const nextConversationEntities = [...conversationEntities, requestingConversationEntity]
    handleRequestStart(nextConversationEntities)

    api()
      .createChatCompletion({
        model: defaultGPTModel.model,
        messages: requestMessages,
      })
      .then(response => {
        const nextChat = handleResponse1(chat, requestMessages, response.data) // TODO
        handleRequestSuccess(nextChat, (prev) => handleResponse2(prev, response.data))
      })
      .catch(() => {
        handleRequestError((prev) => handleResponseError(prev))
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
