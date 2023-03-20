import React, {ChangeEvent, useState} from "react";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum, Configuration, OpenAIApi} from "openai";
import Box from "@mui/material/Box";
import {
  Avatar, Button,
  Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField
} from "@mui/material";
import SendIcon from "@mui/icons-material/SendRounded";
import DownloadingIcon from "@mui/icons-material/DownloadingRounded";
import ManageAccountsIcon from "@mui/icons-material/ManageAccountsRounded";
import FaceIcon from "@mui/icons-material/FaceRounded";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAltRounded";
import {Chat, ChatConversation} from "./data";
import {CreateChatCompletionResponse} from "openai/api";

interface ChatProps {
  apiKey: string
  chat: Chat
  setChat: (chat: Chat) => void
  open: boolean
  handleClickOpen: () => void
  handleClose: () => void
}

class Message {
  constructor(public message: ChatCompletionRequestMessage, public history: boolean) {
  }
}

function chatToMessageList(chat: Chat): Message[] {
  const historyTokens = chat.maxTokens * chat.contextThreshold
  let usedTokens = chat.systemMessage === '' ? 0 : (chat.systemMessage.length * chat.tokensPerChar + chat.extraCharsPerMessage)
  const result: Message[] = []
  chat.conversations.slice().reverse().forEach((conversation) => {
    const tokens = (conversation.assistantMessage.length + conversation.userMessage.length) * chat.tokensPerChar + 2 * chat.extraCharsPerMessage
    usedTokens += tokens
    const history = usedTokens <= historyTokens
    const assistantMessage = new Message(
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: conversation.assistantMessage,
      } as ChatCompletionRequestMessage,
      history,
    )
    result.unshift(assistantMessage)
    const userMessage = new Message(
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: conversation.userMessage,
      } as ChatCompletionRequestMessage,
      history,
    )
    result.unshift(userMessage)
  })
  return result
}

function onResponse(chat: Chat, requestMessageList: ChatCompletionRequestMessage[], response: CreateChatCompletionResponse): Chat {
  const conversationList = [
    ...chat.conversations,
    {
      userMessage: requestMessageList[requestMessageList.length - 1].content,
      assistantMessage: response.choices[0].message!!.content,
      incomplete: response.choices[0].finish_reason === 'length',
      timestamp: response.created,
    } as ChatConversation
  ]
  const requestContentList = requestMessageList.map((message) => message.content)
  const charCount = requestContentList.reduce((acc, cur) => acc + cur.length, 0)
  const messageCount = requestMessageList.length
  const tokenPerChar = Math.max(1, response.usage!!.completion_tokens - 1) / (response.choices[0].message!!.content.length)
  const extraCharsPerMessage = (response.usage!!.prompt_tokens / tokenPerChar - charCount) / messageCount
  return {
    ...chat,
    conversations: conversationList,
    tokensPerChar: tokenPerChar,
    extraCharsPerMessage: extraCharsPerMessage,
  } as Chat
}

function getRequestMessage(chat: Chat, messageList: Message[]): ChatCompletionRequestMessage[] {
  const result = messageList
    .filter((message) => message.history)
    .map((message) => message.message)
  if (chat.systemMessage !== '') {
    const systemMessage = {
      role: ChatCompletionRequestMessageRoleEnum.System,
      content: chat.systemMessage,
    } as ChatCompletionRequestMessage
    result.unshift(systemMessage)
  }
  return result
}

export function ChatPage(props: ChatProps) {
  const { apiKey, chat, setChat, open, handleClickOpen, handleClose } = props

  const [messageList, setMessageList] = useState<Message[]>(chatToMessageList(chat))
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [log, setLog] = useState('')

  const isInputEmpty = input === ''

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  };

  const request = async () => {
    if (isInputEmpty) {
      return
    }

    const { Configuration, OpenAIApi } = require("openai");
    const configuration = new Configuration({
      apiKey: apiKey,
    });
    const openai = new OpenAIApi(configuration);

    const inputMessage = new Message(
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: input,
      } as ChatCompletionRequestMessage,
      true,
    )
    const nextMessageList = [
      ...messageList,
      inputMessage,
    ]

    setMessageList(nextMessageList)
    setInput('')

    setIsLoading(true)

    const requestMessageList = getRequestMessage(chat, nextMessageList)

    const response = await openai
      .createChatCompletion({
        model: chat.model,
        messages: requestMessageList,
      })
      .catch(() => {
        setIsLoading(false)
      })

    const responseData: CreateChatCompletionResponse = response.data
    const nextChat = onResponse(chat, requestMessageList, responseData)
    setChat(nextChat)
    const newMessageList = chatToMessageList(nextChat)
    setMessageList(newMessageList)

    setLog(`total_tokens=${response.data.usage.total_tokens}`)

    setIsLoading(false)
  }

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      width={'100%'}
      height={'100%'}
      position={'relative'}
    >
      <Box
        flexShrink={0}>
        log={log}
      </Box>
      <Box
        width={'100%'}
        flexGrow={1}
        overflow={'auto'}
        padding={'0px'}
        paddingBottom={'72px'}
      >
        <Box
          maxWidth={960}
          margin={'0 auto'}
        >
          <MessageList
            messages={messageList}
          />
        </Box>
      </Box>
      <Box
        width={'100%'}
        flexShrink={0}
        position={'absolute'}
        bottom={0}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 960,
            margin: '0 auto',
            padding: '16px',
            paddingTop: '8px',
            borderRadius: 0,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
          elevation={8}
        >
          <Box
            display={'flex'}
            flexDirection={'row'}
            width={'100%'}
            alignItems={'flex-end'}
          >
            <TextField
              variant={'standard'}
              fullWidth={true}
              multiline={true}
              maxRows={8}
              label={'Message'}
              sx={{
                flexGrow: 1,
              }}
              value={input}
              onChange={handleInputChange}
            />
            <IconButton
              sx={{
                display: isLoading ? 'none' : 'inline',
              }}
              onClick={request}
            >
              <SendIcon/>
            </IconButton>
            <IconButton
              sx={{
                display: isLoading ? 'inline' : 'none',
              }}
            >
              <DownloadingIcon/>
            </IconButton>
          </Box>
        </Card>
      </Box>
      <InfoDialog apiKey={apiKey} chat={chat} setChat={setChat} open={open} handleClickOpen={handleClickOpen} handleClose={handleClose}/>
    </Box>
  )
}

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <List>
      {
        messages.map((message) => {
          let icon;
          switch (message.message.role) {
            case ChatCompletionRequestMessageRoleEnum.User:
              icon = <FaceIcon/>
              break
            case ChatCompletionRequestMessageRoleEnum.Assistant:
              icon = <PsychologyAltIcon/>
              break
            default:
              icon = <ManageAccountsIcon/>
              break
          }
          return (
            <Box>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.history ? 'primary.main' : undefined }}>
                    {icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.message.content}
                />
              </ListItem>
              <Divider variant="inset" />
            </Box>
          )
        })
      }
    </List>
  );
}

function InfoDialog(props: ChatProps) {
  const { apiKey, chat, setChat, open, handleClickOpen, handleClose } = props

  const [systemMessage, setSystemMessage] = useState(chat.systemMessage)

  const saveOnClick = () => {
    handleClose()
    setChat(
      {
        ...chat,
        systemMessage: systemMessage,
      }
    )
  }

  const cancelOnClick = () => {
    handleClose()
    setSystemMessage(chat.systemMessage)
  }

  const handleSystemMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSystemMessage(event.target.value)
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
    >
      <DialogTitle id="alert-dialog-title">
        {"Chat Info"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Chat info description
        </DialogContentText>
        <TextField
          autoFocus
          margin="normal"
          id="name"
          label="System message"
          type="text"
          fullWidth
          variant="outlined"
          multiline={true}
          maxRows={8}
          value={systemMessage}
          onChange={handleSystemMessageChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={cancelOnClick}>Cancel</Button>
        <Button onClick={saveOnClick} autoFocus>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
