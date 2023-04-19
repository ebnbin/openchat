import {Chat} from "../../utils/types";
import {TextField} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";

interface ChatSettingsItemSystemMessageProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemSystemMessage(props: ChatSettingsItemSystemMessageProps) {
  return (
    <SettingsItem
      title={"System prompt"}
      description={"The system prompt helps set the behavior of the ChatGPT."}
    >
      <TextField
        variant={"outlined"}
        size={"small"}
        fullWidth={true}
        multiline={true}
        maxRows={8}
        placeholder={"You are a helpful assistant."}
        value={props.chat.system_message}
        onChange={(event) => props.updateChat({system_message: event.target.value})}
      />
    </SettingsItem>
  );
}
