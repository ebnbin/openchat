import React, {ChangeEvent, useEffect, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum
} from "openai";
import Box from "@mui/material/Box";
import {
  Avatar, Card, CircularProgress, IconButton, List,
  ListItem,
  ListItemAvatar,
  ListItemText, TextField, useTheme
} from "@mui/material";
import {ChatSettings, ChatConversation, Settings, chatModels} from "./data";
import {CreateChatCompletionResponse} from "openai/api";
import {FaceRounded, PsychologyAltRounded, SendRounded} from "@mui/icons-material";
import {api} from "./util";

const contentWidth = 900

//*********************************************************************************************************************

interface MessageWrapper {
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chatSettings: ChatSettings, chatConversations: ChatConversation[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = chatModels.get(chatSettings.model)!!.maxTokens * chatSettings.contextThreshold
  let usedTokens = 0
  if (chatSettings.systemMessage !== '') {
    usedTokens += chatSettings.systemMessage.length * chatSettings.tokensPerChar +
      chatModels.get(chatSettings.model)!!.extraCharsPerMessage
  }
  chatConversations
    .slice()
    .reverse()
    .forEach((conversation) => {
      const tokens = (conversation.userMessage.length + conversation.assistantMessage.length +
        2 * chatModels.get(chatSettings.model)!!.extraCharsPerMessage) * chatSettings.tokensPerChar
      usedTokens += tokens
      const context = usedTokens <= maxContextTokens
      const assistantMessageWrapper = {
        message: {
          role: ChatCompletionRequestMessageRoleEnum.Assistant,
          content: conversation.assistantMessage,
        } as ChatCompletionRequestMessage,
        context: context,
      } as MessageWrapper
      result.unshift(assistantMessageWrapper)
      const userMessageWrapper = {
        message: {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: conversation.userMessage,
        } as ChatCompletionRequestMessage,
        context: context,
      } as MessageWrapper
      result.unshift(userMessageWrapper)
    })
  if (chatSettings.systemMessage !== '') {
    const systemMessageWrapper = {
      message: {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chatSettings.systemMessage,
      } as ChatCompletionRequestMessage,
      context: true,
    } as MessageWrapper
    result.unshift(systemMessageWrapper)
  }
  return result
}

//*********************************************************************************************************************

interface MessageItemProps {
  messageWrapper: MessageWrapper
}

function MessageItem(props: MessageItemProps) {
  const { messageWrapper } = props

  const theme = useTheme()

  function itemColor(): string | undefined {
    return messageWrapper.message.role === ChatCompletionRequestMessageRoleEnum.Assistant
      ? theme.palette.action.hover
      : undefined
  }

  function avatarColor(): string | undefined {
    if (messageWrapper.context) {
      switch (messageWrapper.message.role) {
        case ChatCompletionRequestMessageRoleEnum.User:
          return 'primary.main'
        case ChatCompletionRequestMessageRoleEnum.Assistant:
          return 'secondary.main'
      }
    }
    return undefined
  }

  function avatarIcon(): JSX.Element | undefined {
    switch (messageWrapper.message.role) {
      case ChatCompletionRequestMessageRoleEnum.User:
        return <FaceRounded />
      case ChatCompletionRequestMessageRoleEnum.Assistant:
        return <PsychologyAltRounded />
    }
    return undefined
  }

  return (
    <Box
      sx={{
        bgcolor: itemColor(),
      }}
    >
      <ListItem
        sx={{
          maxWidth: contentWidth,
          margin: '0 auto',
          alignItems: 'flex-start',
        }}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: avatarColor()
            }}
          >
            {avatarIcon()}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={messageWrapper.message.content}
        />
      </ListItem>
    </Box>
  )
}

//*********************************************************************************************************************

interface MessageListProps {
  messageWrappers: MessageWrapper[]
  requestingMessage?: MessageWrapper,
  isLoading: boolean
}

function MessageList(props: MessageListProps) {
  const { messageWrappers, requestingMessage, isLoading } = props

  const validMessageWrappers = requestingMessage ? [...messageWrappers, requestingMessage] : messageWrappers
  return (
    <List>
      {
        validMessageWrappers
          .filter((messageWrapper) => messageWrapper.message.role !== ChatCompletionRequestMessageRoleEnum.System)
          .map((messageWrapper) => (
              <MessageItem
                messageWrapper={messageWrapper}
              />
            )
          )
      }
      { isLoading ? (
        <ListItem
          sx={{
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </ListItem>
      ) : undefined }
    </List>
  )
}

//*********************************************************************************************************************

interface InputCardProps {
  input: string
  setInput: (input: string) => void
  isRequesting: boolean
  request: () => void
}

function InputCard(props: InputCardProps) {
  const { input, setInput, isRequesting, request } = props

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
          disabled={input === '' || isRequesting}
          onClick={request}
        >
          <SendRounded />
        </IconButton>
      </Box>
    </Card>
  )
}

//*********************************************************************************************************************

function beforeRequest(
  messageWrappers: MessageWrapper[],
  input: string,
  setRequestingMessage: (messageWrapper: MessageWrapper) => void,
): ChatCompletionRequestMessage[] {
  const requestingMessage = {
    message: {
      content: input,
      role: ChatCompletionRequestMessageRoleEnum.User,
    } as ChatCompletionRequestMessage,
    context: true,
  } as MessageWrapper
  setRequestingMessage(requestingMessage)
  return [...messageWrappers, requestingMessage]
    .filter((message) => message.context)
    .map((message) => message.message)
}

function afterResponse(
  chatSettings: ChatSettings,
  setChat: (chat: ChatSettings) => void,
  chatConversations: ChatConversation[],
  setChatConversations: (chatId: string, chatConversations: ChatConversation[]) => void,
  requestMessages: ChatCompletionRequestMessage[],
  response: CreateChatCompletionResponse,
) {
  const responseMessage = response.choices[0].message!!.content
  const nextChatConversations = [
    ...chatConversations,
    {
      timestamp: Math.round(response.created * 1000),
      userMessage: requestMessages[requestMessages.length - 1].content,
      assistantMessage: responseMessage,
    } as ChatConversation,
  ]
  setChatConversations(chatSettings.id, nextChatConversations)
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessages
    .map((message) => message.content)
    .concat(responseMessage)
    .reduce((acc, message) => acc + message.length + chatModels.get(chatSettings.model)!!.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chatSettings.tokens + responseTotalTokens
  const incomplete = response.choices[0].finish_reason === 'length'
  const nextChat = {
    ...chatSettings,
    tokensPerChar: tokensPerChar,
    tokens: tokens,
    incomplete: incomplete,
  } as ChatSettings
  setChat(nextChat)
}

interface ChatProps {
  settings: Settings,
  chatId: string
  setChatSettings: (chat: ChatSettings) => void
  chatConversations: ChatConversation[]
  setChatConversations: (chatId: string, chatConversations: ChatConversation[]) => void
}

export function ChatPage(props: ChatProps) {
  const { settings, chatId, setChatSettings, chatConversations, setChatConversations } = props

  const chatSettings = settings.chats.find((chat) => chat.id === chatId)!!

  useEffect(() => {
    const storedChatConversations = localStorage.getItem(`chatConversation${chatId}`)
    if (storedChatConversations) {
      setChatConversations(chatId, JSON.parse(storedChatConversations))
    }
  }, [setChatConversations, chatId])

  const messageWrappers = chatToMessageWrappers(chatSettings, chatConversations)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestingMessage, setRequestingMessage] = useState<MessageWrapper>()

  const request = async () => {
    setIsLoading(true)
    const requestMessages = beforeRequest(messageWrappers, input, setRequestingMessage)
    setInput('')

    const response = await api(settings.apiKey)
      .createChatCompletion({
        model: chatSettings.model,
        messages: requestMessages,
      })
      .catch(() => {
        setRequestingMessage(undefined)
        setIsLoading(false)
      })

    setRequestingMessage(undefined)
    afterResponse(chatSettings, setChatSettings, chatConversations, setChatConversations, requestMessages,
      response!!.data)
    setIsLoading(false)
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
        <MessageList
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
          <InputCard
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
