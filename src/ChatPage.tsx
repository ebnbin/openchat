import React, {ChangeEvent, useEffect, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum
} from "openai";
import Box from "@mui/material/Box";
import {
  Avatar, Button,
  Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, List,
  ListItem,
  ListItemAvatar,
  ListItemText, Slider,
  TextField, Typography, useTheme
} from "@mui/material";
import {ChatSettings, ChatConversation, Settings} from "./data";
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
  const maxContextTokens = chatSettings.maxTokens * chatSettings.contextThreshold
  let usedTokens = 0
  if (chatSettings.systemMessage !== '') {
    usedTokens += chatSettings.systemMessage.length * chatSettings.tokensPerChar + chatSettings.extraCharsPerMessage
  }
  chatConversations
    .slice()
    .reverse()
    .forEach((conversation) => {
      const tokens = (conversation.userMessage.length + conversation.assistantMessage.length +
        2 * chatSettings.extraCharsPerMessage) * chatSettings.tokensPerChar
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

interface ChatSettingsDialogProps {
  chatSettings: ChatSettings,
  setChatSettings: (chat: ChatSettings) => void
  deleteChat: (chatId: string) => void
  chatConversations: ChatConversation[]
  open: boolean
  handleClose: () => void
}

function ChatSettingsDialog(props: ChatSettingsDialogProps) {
  const { chatSettings, setChatSettings, deleteChat, chatConversations, open, handleClose } = props

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatSettings(
      {
        ...chatSettings,
        title: event.target.value,
      },
    )
  }

  const handleContextThresholdChange = (event: Event, newValue: number | number[]) => {
    setChatSettings(
      {
        ...chatSettings,
        contextThreshold: newValue as number,
      },
    )
  }

  const handleSystemMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChatSettings(
      {
        ...chatSettings,
        systemMessage: event.target.value,
      },
    )
  }

  const handleDeleteClick = () => {
    deleteChat(chatSettings.id)
    handleClose()
  }

  return (
    <Dialog
      fullWidth={true}
      scroll={'paper'}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Edit Chat
      </DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          padding: 0,
        }}
      >
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Typography
            variant={'subtitle1'}
            gutterBottom={true}
          >
            Title
          </Typography>
          <TextField
            variant={'standard'}
            fullWidth={true}
            type={'text'}
            placeholder={'New chat'}
            value={chatSettings.title}
            onChange={handleTitleChange}
          />
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Typography
            variant={'subtitle1'}
            gutterBottom={true}
          >
            Context Threshold
          </Typography>
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            gutterBottom={true}
          >
            Conversation histories that can be remembered as context for the next conversation
            <br />
            Current value: {(chatSettings.contextThreshold * 100).toFixed(0)}% of maximum tokens
            (about {(chatSettings.maxTokens * chatSettings.contextThreshold / 4 * 3).toFixed(0)} words)
          </Typography>
          <Box
            sx={{
              padding: '8px',
              paddingBottom: '0px',
            }}
          >
            <Slider
              min={0}
              max={0.95}
              step={0.05}
              marks={true}
              value={chatSettings.contextThreshold}
              onChange={handleContextThresholdChange}
            />
          </Box>
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Typography
            variant={'subtitle1'}
            gutterBottom={true}
          >
            System Message
          </Typography>
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            gutterBottom={true}
          >
            The system message helps set the behavior of the assistant
          </Typography>
          <TextField
            variant={'outlined'}
            fullWidth={true}
            type={'text'}
            multiline={true}
            maxRows={8}
            placeholder={'You are a helpful assistant.'}
            value={chatSettings.systemMessage}
            onChange={handleSystemMessageChange}
          />
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <DialogContentText>
            Model: {chatSettings.model} ({chatSettings.maxTokens} tokens)
            <br />
            Cumulative tokens used: {chatSettings.tokens}
            <br />
            Numbers of conversations: {chatConversations.length}
          </DialogContentText>
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Button
            variant={'contained'}
            color={'error'}
            fullWidth={true}
            onClick={handleDeleteClick}
          >
            Delete chat
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
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
  setChatConversations: (chatConversations: ChatConversation[]) => void,
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
  setChatConversations(nextChatConversations)
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessages
    .map((message) => message.content)
    .concat(responseMessage)
    .reduce((acc, message) => acc + message.length + chatSettings.extraCharsPerMessage, 0)
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
  deleteChat: (chatId: string) => void
  open: boolean
  handleClose: () => void
}

export function ChatPage(props: ChatProps) {
  const { settings, chatId, setChatSettings, deleteChat, open, handleClose } = props

  const chatSettings = settings.chats.find((chat) => chat.id === chatId)!!

  const [chatConversations, setChatConversations] = useState<ChatConversation[]>([])

  useEffect(() => {
    const storedChatConversations = localStorage.getItem(`chatConversation${chatId}`)
    if (storedChatConversations) {
      setChatConversations(JSON.parse(storedChatConversations))
    }
  }, [chatId])

  const setChatConversationsAndStore = (chatConversations: ChatConversation[]) => {
    setChatConversations(chatConversations)
    localStorage.setItem(`chatConversation${chatId}`, JSON.stringify(chatConversations))
  }

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
    afterResponse(chatSettings, setChatSettings, chatConversations, setChatConversationsAndStore, requestMessages, response!!.data)
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
      <ChatSettingsDialog
        chatSettings={chatSettings}
        setChatSettings={setChatSettings}
        deleteChat={deleteChat}
        chatConversations={chatConversations}
        open={open}
        handleClose={handleClose}
      />
    </Box>
  )
}
