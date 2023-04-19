import {Chat} from "../../utils/types";
import {Chip} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";
import {DeleteRounded} from "@mui/icons-material";

interface ChatSettingsItemDeleteChatProps {
  chat: Chat;
  deleteChat: () => void;
}

export default function ChatSettingsItemDeleteChat(props: ChatSettingsItemDeleteChatProps) {
  return (
    <SettingsItem>
      <Chip
        variant={"outlined"}
        color={"error"}
        label={"Delete chat"}
        icon={<DeleteRounded/>}
        onClick={props.deleteChat}
      />
    </SettingsItem>
  );
}
