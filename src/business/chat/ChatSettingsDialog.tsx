import {Chat} from "../../util/data";
import React, {ChangeEvent, useState} from "react";
import {
  Button, Dialog, DialogActions,
  DialogContent,
  DialogTitle, Slider,
  TextField
} from "@mui/material";
import {defaultOpenAIModel} from "../../util/util";
import store from "../../util/store";
import SettingsItem from "./SettingsItem";
import {DeleteRounded} from "@mui/icons-material";

interface ChatSettingsDialogProps {
  chat: Chat,
  updateChat: (chatId: number, chat: Partial<Chat>) => void
  deleteChat: (chatId: number) => void
  isNew: boolean,
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function ChatSettingsDialog(props: ChatSettingsDialogProps) {
  const [chat, setChat] = useState(props.chat)

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChat({
      ...chat,
      title: event.target.value,
    })
  }

  const handleContextThresholdChange = (event: Event, newValue: number | number[]) => {
    setChat({
      ...chat,
      context_threshold: newValue as number,
    })
  }

  const handleSystemMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChat({
      ...chat,
      system_message: event.target.value,
    })
  }

  const handleUserMessageTemplateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setChat({
      ...chat,
      user_message_template: event.target.value,
    })
  }

  const handleDeleteClick = () => {
    props.deleteChat(chat.id)
    props.handleDialogClose()
  }

  const handleSaveClick = () => {
    props.updateChat(chat.id, {
      title: chat.title,
      context_threshold: chat.context_threshold,
      system_message: chat.system_message,
      user_message_template: chat.user_message_template,
    })
    props.handleDialogClose()
  }

  const chatInfo = (): string => {
    let info = `Model: ${defaultOpenAIModel.model} (${defaultOpenAIModel.maxTokens} tokens)`;
    if (!props.isNew) {
      info += `\nCumulative tokens used: ${chat.tokens}\nConversations count: ${store.getConversations(chat).length}`
    }
    return info;
  }

  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={props.handleDialogClose}
    >
      <DialogTitle>
        {props.isNew ? 'New Chat Settings' : 'Chat Settings'}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <SettingsItem
          title={'Title'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            placeholder={'New chat'}
            value={chat.title}
            onChange={handleTitleChange}
          />
        </SettingsItem>
        <SettingsItem
          title={'Context threshold'}
          description={`Conversation histories that can be remembered as context for the next conversation\nCurrent value: ${(chat.context_threshold * 100).toFixed(0)}% of maximum tokens (about ${(defaultOpenAIModel.maxTokens * chat.context_threshold / 4 * 3).toFixed(0)} words)`}
        >
          <Slider
            min={0}
            max={0.9}
            step={0.1}
            marks={true}
            value={chat.context_threshold}
            onChange={handleContextThresholdChange}
          />
        </SettingsItem>
        <SettingsItem
          title={'System prompt'}
          description={'The system prompt helps set the behavior of the assistant'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            multiline={true}
            maxRows={8}
            placeholder={'You are a helpful assistant.'}
            value={chat.system_message}
            onChange={handleSystemMessageChange}
          />
        </SettingsItem>
        <SettingsItem
          title={'User message template'}
          description={'Template for each user message. {{message}} represents the input message'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            multiline={true}
            maxRows={8}
            placeholder={'```javascript\n{{message}}\n```'}
            value={chat.user_message_template}
            onChange={handleUserMessageTemplateChange}
          />
        </SettingsItem>
        <SettingsItem
          description={chatInfo()}
        />
        {props.isNew ? undefined : (
          <SettingsItem>
            <Button
              variant={'outlined'}
              size={'small'}
              color={'error'}
              fullWidth={true}
              startIcon={<DeleteRounded />}
              onClick={handleDeleteClick}
            >
              Delete chat
            </Button>
          </SettingsItem>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleDialogClose}
        >
          {'Cancel'}
        </Button>
        <Button
          onClick={handleSaveClick}
        >
          {'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
