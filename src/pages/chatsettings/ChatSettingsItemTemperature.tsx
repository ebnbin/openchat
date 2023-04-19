import {Chat} from "../../utils/types";
import {Slider} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React from "react";

interface ChatSettingsItemTemperatureProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemTemperature(props: ChatSettingsItemTemperatureProps) {
  return (
    <SettingsItem
      title={"Temperature"}
      description={`Higher values will make the output more random, while lower values will make it more focused and deterministic.`}
    >
      <Slider
        min={0}
        max={2}
        step={0.5}
        marks={true}
        value={props.chat.temperature}
        onChange={(event, newValue) => props.updateChat({temperature: newValue as number})}
      />
    </SettingsItem>
  );
}
