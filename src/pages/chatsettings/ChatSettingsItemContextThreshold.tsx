import {Chat} from "../../utils/types";
import {Slider} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";
import {defaultOpenAIModel} from "../../utils/utils";

interface ChatSettingsItemContextThresholdProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemContextThreshold(props: ChatSettingsItemContextThresholdProps) {
  const tokenPercent = (props.chat.context_threshold * 100).toFixed(0);
  const words = (defaultOpenAIModel.maxTokens * props.chat.context_threshold / 4 * 3).toFixed(0);

  return (
    <SettingsItem
      title={"Message context"}
      description={`Include a maximum of ${tokenPercent}% tokens (approximately ${words} English words).`}
    >
      <Slider
        min={0}
        max={0.9}
        step={0.1}
        marks={true}
        value={props.chat.context_threshold}
        onChange={(event, newValue) => props.updateChat({context_threshold: newValue as number})}
      />
    </SettingsItem>
  );
}
