import {Chat} from "../../utils/types";
import {TextField} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";

interface ChatSettingsItemUserMessageTemplateProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemUserMessageTemplate(props: ChatSettingsItemUserMessageTemplateProps) {
  return (
    <SettingsItem
      title={"User message template"}
      description={
        <>
          Template for each user message. <span style={{fontWeight: "bold"}}>{"{{input}}"}</span> represents your input.
        </>
      }
    >
      <TextField
        variant={"outlined"}
        size={"small"}
        fullWidth={true}
        multiline={true}
        maxRows={8}
        placeholder={"```javascript\n{{input}}\n```"}
        value={props.chat.user_message_template}
        onChange={(event) => props.updateChat({user_message_template: event.target.value})}
        sx={{
          marginTop: "8px",
        }}
      />
    </SettingsItem>
  );
}
