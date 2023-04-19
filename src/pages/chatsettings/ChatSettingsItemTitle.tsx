import {Chat} from "../../utils/types";
import {TextField} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";

interface ChatSettingsItemTitleProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemTitle(props: ChatSettingsItemTitleProps) {
  return (
    <SettingsItem
      title={"Title"}
    >
      <TextField
        variant={"outlined"}
        size={"small"}
        fullWidth={true}
        placeholder={"New chat"}
        value={props.chat.title}
        onChange={(event) => props.updateChat({title: event.target.value})}
      />
    </SettingsItem>
  );
}
