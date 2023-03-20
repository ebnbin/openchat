import React, {ChangeEvent, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi
} from "openai";
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

//*********************************************************************************************************************

interface MessageWrapper {
  message: ChatCompletionRequestMessage
  context: boolean
}

function chatToMessageWrappers(chat: Chat): MessageWrapper[] {
  const result: MessageWrapper[] = []
  if (chat.requestingUserMessage !== '') {
    const userMessageWrapper = {
      message: {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: chat.requestingUserMessage,
      } as ChatCompletionRequestMessage,
      context: true,
    } as MessageWrapper
    result.unshift(userMessageWrapper)
  }
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

function beforeRequest(
  chat: Chat,
  inputMessage: string,
): Chat {
  return {
    ...chat,
    requestingUserMessage: inputMessage,
  }
}

function afterResponse(
  chat: Chat,
  requestMessages: ChatCompletionRequestMessage[],
  response: CreateChatCompletionResponse,
): Chat {
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
  return {
    ...chat,
    conversations: conversations,
    tokensPerChar: tokensPerChar,
    tokens: tokens,
    incomplete: incomplete,
  } as Chat
}

//*********************************************************************************************************************

interface ChatProps {
  apiKey: string
  chat: Chat
  setChat: (chat: Chat) => void
  open: boolean
  handleClickOpen: () => void
  handleClose: () => void
}

export function ChatPage(props: ChatProps) {
  const { apiKey, chat, setChat, open, handleClickOpen, handleClose } = props

  const [messageList, setMessageList] = useState<MessageWrapper[]>(chatToMessageWrappers(chat))
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

    const chat1 = beforeRequest(chat, input)
    setChat(chat1)
    const messageList1 = chatToMessageWrappers(chat1)
    setMessageList(messageList1)
    setInput('')

    setIsLoading(true)

    const requestMessageList = messageList1
      .filter((message) => message.context)
      .map((message) => message.message)

    const response = await openai
      .createChatCompletion({
        model: chat.model,
        messages: requestMessageList,
      })
      .catch(() => {
        setIsLoading(false)
      })

    const responseData: CreateChatCompletionResponse = response.data
    const nextChat = afterResponse(chat, requestMessageList, responseData)
    setChat(nextChat)
    const newMessageList = chatToMessageWrappers(nextChat)
    setMessageList(newMessageList)

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

function MessageList({ messages }: { messages: MessageWrapper[] }) {
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
                  <Avatar sx={{ bgcolor: message.context ? 'primary.main' : undefined }}>
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
