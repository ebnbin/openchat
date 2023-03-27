import {Chat} from "../../util/data";
import React, {ChangeEvent} from "react";
import {
  Button,
  Dialog, DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slider,
  TextField,
  Typography
} from "@mui/material";
import Box from "@mui/material/Box";
import {defaultGPTModel} from "../../util/util";
import store from "../../util/store";

interface ChatSettingsDialogProps {
  chat: Chat,
  updateChat: (chat: Chat) => void
  deleteChat: (chatId: string) => void
  open: boolean
  handleClose: () => void
}

export function ChatSettingsDialog(props: ChatSettingsDialogProps) {
  const { chat, updateChat, deleteChat, open, handleClose } = props

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateChat(
      {
        ...chat,
        title: event.target.value,
      },
    )
  }

  const handleContextThresholdChange = (event: Event, newValue: number | number[]) => {
    updateChat(
      {
        ...chat,
        context_threshold: newValue as number,
      },
    )
  }

  const handleSystemMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateChat(
      {
        ...chat,
        system_message: event.target.value,
      },
    )
  }

  const handleUserMessageTemplateChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateChat(
      {
        ...chat,
        user_message_template: event.target.value,
      },
    )
  }

  const handleDeleteClick = () => {
    deleteChat(chat.id)
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
        Chat Settings
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
            value={chat.title}
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
            Current value: {(chat.context_threshold * 100).toFixed(0)}% of maximum tokens
            (about {(defaultGPTModel.maxTokens * chat.context_threshold / 4 * 3).toFixed(0)} words)
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
              value={chat.context_threshold}
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
            value={chat.system_message}
            onChange={handleSystemMessageChange}
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
            User message template
          </Typography>
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            gutterBottom={true}
          >
            {'Template for each user message. ${message} represents the input message. ${message} must exist'}
          </Typography>
          <TextField
            variant={'outlined'}
            fullWidth={true}
            type={'text'}
            multiline={true}
            maxRows={8}
            placeholder={'```javascript\n${message}\n```'}
            value={chat.user_message_template}
            onChange={handleUserMessageTemplateChange}
          />
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <DialogContentText>
            Model: {defaultGPTModel.model} ({defaultGPTModel.maxTokens} tokens)
            <br />
            Cumulative tokens used: {chat.tokens}
            <br />
            Conversations count: {store.getChatConversations(chat.id).length}
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
