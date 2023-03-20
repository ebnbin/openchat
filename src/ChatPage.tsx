import React, {ChangeEvent, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  OpenAIApi
} from "openai";
import Box from "@mui/material/Box";
import {
  Avatar, Button,
  Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, Divider,
  IconButton, List,
  ListItem,
  ListItemAvatar,
  ListItemText, Slider,
  TextField, Typography, useTheme
} from "@mui/material";
import {Chat, ChatConversation} from "./data";
import {CreateChatCompletionResponse} from "openai/api";
import {FaceRounded, PsychologyAltRounded, SendRounded} from "@mui/icons-material";

//*********************************************************************************************************************

interface MessageWrapper {
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chat: Chat): MessageWrapper[] {
  const result: MessageWrapper[] = []
  const maxContextTokens = chat.maxTokens * chat.contextThreshold
  let usedTokens = 0
  if (chat.systemMessage !== '') {
    usedTokens += chat.systemMessage.length * chat.tokensPerChar + chat.extraCharsPerMessage
  }
  chat.conversations
    .slice()
    .reverse()
    .forEach((conversation) => {
      const tokens = (conversation.userMessage.length + conversation.assistantMessage.length +
        2 * chat.extraCharsPerMessage) * chat.tokensPerChar
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
  if (chat.systemMessage !== '') {
    const systemMessageWrapper = {
      message: {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chat.systemMessage,
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
    <ListItem
      sx={{
        alignItems: 'flex-start',
        bgcolor: itemColor(),
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
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
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
          value={input}
          autoFocus={true}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
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

interface DetailDialogProps {
  chat: Chat,
  setChat: (chat: Chat) => void
  open: boolean
  handleClose: () => void
}

function DetailDialog(props: DetailDialogProps) {
  const { chat, setChat, open, handleClose } = props

  const [title, setTitle] = useState(chat.title)
  const [contextThreshold, setContextThreshold] = useState(chat.contextThreshold)
  const [systemMessage, setSystemMessage] = useState(chat.systemMessage)

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }

  const handleSystemMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSystemMessage(event.target.value)
  }

  const handleSaveClick = () => {
    setChat(
      {
        ...chat,
        title: title,
        contextThreshold: contextThreshold,
        systemMessage: systemMessage,
      },
    )
    handleClose()
  }

  const handleCancelClick = () => {
    setTitle(chat.title)
    setContextThreshold(chat.contextThreshold)
    setSystemMessage(chat.systemMessage)
    handleClose()
  }

  return (
    <Dialog
      fullWidth={true}
      scroll={'paper'}
      open={open}
      onClose={handleCancelClick}
    >
      <DialogContent
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
            value={title}
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
            Current value: {(contextThreshold * 100).toFixed(0)}% of maximum tokens (about {(chat.maxTokens * contextThreshold / 4 * 3).toFixed(0)} words)
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
              value={contextThreshold}
              onChange={(event, newValue) => {
                setContextThreshold(newValue as number)
              }}
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
            value={systemMessage}
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
            Model: {chat.model} ({chat.maxTokens} tokens)
            <br />
            Cumulative tokens used: {chat.tokens}
            <br />
            Numbers of conversations: {chat.conversations.length}
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
          >
            Delete chat
          </Button>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button
          onClick={handleCancelClick}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSaveClick}
        >
          Save
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
  chat: Chat,
  setChat: (chat: Chat) => void,
  requestMessages: ChatCompletionRequestMessage[],
  response: CreateChatCompletionResponse,
) {
  const responseMessage = response.choices[0].message!!.content
  const conversations = [
    ...chat.conversations,
    {
      timestamp: response.created,
      userMessage: requestMessages[requestMessages.length - 1].content,
      assistantMessage: responseMessage,
    } as ChatConversation,
  ]
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestMessages
    .map((message) => message.content)
    .concat(responseMessage)
    .reduce((acc, message) => acc + message.length + chat.extraCharsPerMessage, 0)
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chat.tokens + responseTotalTokens
  const incomplete = response.choices[0].finish_reason === 'length'
  const nextChat = {
    ...chat,
    conversations: conversations,
    tokensPerChar: tokensPerChar,
    tokens: tokens,
    incomplete: incomplete,
  } as Chat
  setChat(nextChat)
}

interface ChatProps {
  api: OpenAIApi,
  chat: Chat
  setChat: (chat: Chat) => void
  open: boolean
  handleClose: () => void
}

export function ChatPage(props: ChatProps) {
  const { api, chat, setChat, open, handleClose } = props

  const messageWrappers = chatToMessageWrappers(chat)

  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [requestingMessage, setRequestingMessage] = useState<MessageWrapper>()

  const request = async () => {
    setIsLoading(true)
    const requestMessages = beforeRequest(messageWrappers, input, setRequestingMessage)
    setInput('')

    const response = await api
      .createChatCompletion({
        model: chat.model,
        messages: requestMessages,
      })
      .catch(() => {
        setRequestingMessage(undefined)
        setIsLoading(false)
      })

    setRequestingMessage(undefined)
    afterResponse(chat, setChat, requestMessages, response!!.data)
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
        <Box
          sx={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          <MessageList
            messageWrappers={messageWrappers}
            requestingMessage={requestingMessage}
            isLoading={isLoading}
          />
        </Box>
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
            maxWidth: '900px',
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
      <DetailDialog
        chat={chat}
        setChat={setChat}
        open={open}
        handleClose={handleClose}
      />
    </Box>
  )
}
