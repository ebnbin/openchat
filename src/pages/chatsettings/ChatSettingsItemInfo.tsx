import {Chat} from "../../utils/types";
import SettingsItem from "../../components/SettingsItem";
import React from "react";
import {defaultOpenAIModel} from "../../utils/utils";

interface ChatSettingsItemInfoProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemInfo(props: ChatSettingsItemInfoProps) {
  let description = `OpenAI model: ${defaultOpenAIModel.model} (${defaultOpenAIModel.maxTokens} tokens)`;
  if (props.chat.conversation_count !== 0 || props.chat.token_count !== 0) {
    description += `\nUsage: ${props.chat.conversation_count} conversations; ${props.chat.token_count} tokens`
  }

  return (
    <SettingsItem
      title={"Chat info"}
      description={description}
    >
    </SettingsItem>
  );
}
