import {Chat} from "../../utils/types";
import {Chip} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import {DeleteRounded} from "@mui/icons-material";
import ConfirmDialog from "../../components/ConfirmDialog";

interface ChatSettingsItemDeleteChatProps {
  chat: Chat;
  deleteChat: () => void;
}

export default function ChatSettingsItemDeleteChat(props: ChatSettingsItemDeleteChatProps) {
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  return (
    <SettingsItem>
      <Chip
        variant={"outlined"}
        color={"error"}
        label={"Delete chat"}
        icon={<DeleteRounded/>}
        onClick={() => setConfirmDialogOpen(true)}
      />
      <ConfirmDialog
        open={confirmDialogOpen}
        handleClose={() => setConfirmDialogOpen(false)}
        message={"Are your sure you want to delete this chat?"}
        handleConfirmClick={props.deleteChat}
      />
    </SettingsItem>
  );
}
