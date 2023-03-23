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
  TextField, useTheme
} from "@mui/material";
import {Chat, AppData, chatModels, defaultModel, ChatMessage} from "./data";
import {CreateChatCompletionResponse} from "openai/api";
import {FaceRounded, PsychologyAltRounded, SendRounded} from "@mui/icons-material";
import {api} from "./util";
import {MessageContent} from "./MessageContent";

const contentWidth = 900

//*********************************************************************************************************************

interface MessageWrapper {
  id: string
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chatSettings: Chat, chatMessages: ChatMessage[]): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = defaultModel.maxTokens * chatSettings.context_threshold
  let usedTokens = 0
  if (chatSettings.system_message !== '') {
    usedTokens += chatSettings.system_message.length * chatSettings.tokens_per_char +
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
        const tokens = (chatMessage.content.length + defaultModel.extraCharsPerMessage) * chatSettings.tokens_per_char
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
  if (chatSettings.system_message !== '') {
    const systemMessageWrapper = {
      id: chatSettings.id,
      message: {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chatSettings.system_message,
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
        <ListItemAvatar
          sx={{
            display: 'flex',
            height: '56px',
            flexShrink: 0,
            placeItems: 'center',
          }}
        >
          <Avatar
            sx={{
              bgcolor: avatarColor()
            }}
          >
            {avatarIcon()}
          </Avatar>
        </ListItemAvatar>
        <Box
          sx={{
            flexGrow: 1,
            width: '0px',
          }}
        >
          <MessageContent
            content={messageWrapper.message.content}
          />
        </Box>
      </ListItem>
    </Box>
  )
}

//*********************************************************************************************************************

interface MessageListProps {
  messageWrappers: MessageWrapper[]
  requestingMessage?: MessageWrapper
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
                key={messageWrapper.id}
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
  chatSettings: Chat,
  setChat: (chat: Chat) => void,
  chatMessages: ChatMessage[],
  setChatMessages: (id: string, chatMessages: ChatMessage[]) => void,
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
  setChatMessages(chatSettings.id === '' ? id : chatSettings.id, nextChatMessages)
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessageWrappers
    .map((messageWrapper) => messageWrapper.message.content)
    .concat(responseMessage.content)
    .reduce((acc, message) => acc + message.length + defaultModel.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chatSettings.tokens + responseTotalTokens
  // const conversations = chatSettings.conversations + 1
  // const incomplete = response.choices[0].finish_reason === 'length'
  const nextChat = {
    ...chatSettings,
    id: chatSettings.id === '' ? id : chatSettings.id,
    tokens_per_char: tokensPerChar,
    tokens: tokens,
  } as Chat
  setChat(nextChat)
}

interface ChatProps {
  settings: AppData,
  chatId: string
  setChatSettings: (chat: Chat) => void
}

export function ChatPage(props: ChatProps) {
  const { settings, chatId, setChatSettings } = props

  const chatSettings = chatId === '' ? ({
    id: '',
    title: '',
    context_threshold: 0.7,
    system_message: '',
    tokens_per_char: 0,
    tokens: 0,
  } as Chat) : settings.chats.find((chat) => chat.id === chatId)!!

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const setChatMessagesAndStore = (chatId: string, chatMessages: ChatMessage[]) => {
    setChatMessages(chatMessages)
    localStorage.setItem(`chat_${chatId}`, JSON.stringify(chatMessages))
  }

  useEffect(() => {
    const storedChatMessages = localStorage.getItem(`chat_${chatId}`)
    if (storedChatMessages) {
      setChatMessages(JSON.parse(storedChatMessages))
    }
  }, [chatId])

  const messageWrappers = chatToMessageWrappers(chatSettings, chatMessages)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestingMessage, setRequestingMessage] = useState<MessageWrapper>()

  const request = async () => {
    setIsLoading(true)
    const requestMessageWrappers = beforeRequest(messageWrappers, input, setRequestingMessage)
    setInput('')

    const response = await api(settings.openai_api_key)
      .createChatCompletion({
        model: defaultModel.model,
        messages: requestMessageWrappers.map((messageWrapper) => messageWrapper.message),
      })
      .catch(() => {
        setRequestingMessage(undefined)
        setIsLoading(false)
      })

    setRequestingMessage(undefined)
    afterResponse(chatSettings, setChatSettings, chatMessages, setChatMessagesAndStore, requestMessageWrappers,
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
