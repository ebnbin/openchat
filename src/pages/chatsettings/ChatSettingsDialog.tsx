import {Chat} from "../../utils/types";
import React, {useEffect, useState} from "react";
import {
  Button, Dialog, DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import ChatSettingsItemTitle from "./ChatSettingsItemTitle";
import ChatSettingsItemIcon from "./ChatSettingsItemIcon";
import ChatSettingsItemContextThreshold from "./ChatSettingsItemContextThreshold";
import ChatSettingsItemSystemMessage from "./ChatSettingsItemSystemMessage";
import ChatSettingsItemUserMessageTemplate from "./ChatSettingsItemUserMessageTemplate";
import ChatSettingsItemInfo from "./ChatSettingsItemInfo";
import ChatSettingsItemDeleteChat from "./ChatSettingsItemDeleteChat";
import ChatSettingsItemTemperature from "./ChatSettingsItemTemperature";

interface ChatSettingsDialogProps {
  chat: Chat;
  isNew: boolean;
  updateChat?: (chatId: number, chat: Partial<Chat>) => void;
  deleteChat?: (chat: Chat) => void;
  createChat?: (chat: Chat) => void; // New chat
  dialogOpen: boolean;
  handleDialogClose: () => void;
}

export function ChatSettingsDialog(props: ChatSettingsDialogProps) {
  const [chat, _setChat] = useState(props.chat);

  useEffect(() => {
    if (props.dialogOpen) {
      _setChat(props.chat);
    }
  }, [props.chat, props.dialogOpen]);

  const updateChat = (chatPartial: Partial<Chat>) => {
    _setChat({...chat, ...chatPartial});
  }

  const handleDeleteChatClick = () => {
    if (props.isNew || props.deleteChat === undefined) {
      return
    }
    props.deleteChat(chat);
    props.handleDialogClose();
  }

  const handleCancelClick = () => {
    props.handleDialogClose();
  }

  const handleSaveClick = () => {
    if (props.isNew && props.createChat !== undefined) {
      props.createChat(chat);
    } else if (props.updateChat !== undefined) {
      props.updateChat(chat.id, {
        title: chat.title,
        icon_text: chat.icon_text,
        icon_text_size: chat.icon_text_size,
        icon_color: chat.icon_color,
        system_message: chat.system_message,
        user_message_template: chat.user_message_template,
        temperature: chat.temperature,
        context_threshold: chat.context_threshold,
      } as Partial<Chat>);
    }
    props.handleDialogClose();
  }

  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={handleCancelClick}
    >
      <DialogTitle>
        {props.isNew ? "New Chat Settings" : "Chat Settings"}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <ChatSettingsItemTitle
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemIcon
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemSystemMessage
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemUserMessageTemplate
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemTemperature
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemContextThreshold
          chat={chat}
          updateChat={updateChat}
        />
        <ChatSettingsItemInfo
          chat={chat}
          updateChat={updateChat}
        />
        {props.isNew ? undefined : (
          <ChatSettingsItemDeleteChat
            chat={chat}
            deleteChat={handleDeleteChatClick}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleCancelClick}
        >
          {"Cancel"}
        </Button>
        <Button
          onClick={handleSaveClick}
        >
          {"Save"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
