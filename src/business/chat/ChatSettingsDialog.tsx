import {Chat} from "../../util/data";
import React, {ChangeEvent, useEffect, useState} from "react";
import {
  Button, Dialog, DialogActions,
  DialogContent,
  DialogTitle, Slider,
  TextField
} from "@mui/material";
import {defaultOpenAIModel} from "../../util/util";
import SettingsItem from "../../component/SettingsItem";
import {DeleteRounded} from "@mui/icons-material";

interface ChatSettingsDialogProps {
  chat: Chat;
  isNew: boolean;
  updateChat?: (chatId: number, chat: Partial<Chat>) => void;
  deleteChat?: (chat: Chat) => void;
  createChat?: (chat: Chat) => void;
  dialogOpen: boolean;
  handleDialogClose: () => void;
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
    if (props.isNew) {
      return;
    }
    props.deleteChat!!(chat)
    props.handleDialogClose()
  }

  const handleCancelClick = () => {
    setChat(props.chat);
    props.handleDialogClose();
  }

  const handleSaveClick = () => {
    if (props.isNew) {
      props.createChat!!(chat);
    } else {
      props.updateChat!!(chat.id, {
        title: chat.title,
        context_threshold: chat.context_threshold,
        system_message: chat.system_message,
        user_message_template: chat.user_message_template,
      });
    }
    props.handleDialogClose();
  }

  const [chatInfo, setChatInfo] = useState('')

  useEffect(() => {
    let info = `Model: ${defaultOpenAIModel.model} (${defaultOpenAIModel.maxTokens} tokens)`;
    if (props.isNew) {
      setChatInfo(info);
      return;
    }
    info += `\nCumulative tokens used: ${props.chat.tokens}\nConversations count: ${props.chat.conversations.length}`
    setChatInfo(info);
  }, [props.chat.id, props.chat.tokens, props.isNew, props.dialogOpen, props.chat.conversations.length]);

  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={handleCancelClick}
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
          description={chatInfo}
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
          onClick={handleCancelClick}
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
