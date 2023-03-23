import React, {ChangeEvent, useState} from "react";
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  ChatCompletionResponseMessageRoleEnum
} from "openai";
import {Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {JsonLog} from "./JsonLog";
import {AppData} from "../data/data";
import {api} from "../util/util";

interface CreateCompletionProps {
  settings: AppData;
}

// https://platform.openai.com/docs/api-reference/chat/create
export function CreateChatCompletionPage({ settings }: CreateCompletionProps) {
  const modelList: string[] = [
    'gpt-4',
    'gpt-4-0314',
    'gpt-4-32k',
    'gpt-4-32k-0314',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-0301',
  ]

  const [model, setModel] = useState(modelList[0]);
  const [message, setMessage] = useState<ChatCompletionRequestMessage>();
  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([]);
  const [responseData, setResponseData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = (event: SelectChangeEvent) => {
    setModel(event.target.value)
  }

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const message: ChatCompletionRequestMessage = {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: event.target.value,
    }
    setMessage(message)
  };

  const request = async () => {
    if (!message) {
      return
    }

    const currentMessages = [...messages, message]
    setMessages(currentMessages)
    setMessage(undefined)

    setResponseData(undefined)
    setIsLoading(true)

    const response = await api(settings.openai_api_key)
      .createChatCompletion({
        model: model,
        messages: currentMessages,
      }).catch((error: any) => {
        setResponseData(error)
        setIsLoading(false)
      });

    let role: ChatCompletionRequestMessageRoleEnum = ChatCompletionRequestMessageRoleEnum.Assistant
    switch (response!!.data.choices[0].message!!.role) {
      case ChatCompletionResponseMessageRoleEnum.System:
        role = ChatCompletionRequestMessageRoleEnum.System;
        break;
      case ChatCompletionResponseMessageRoleEnum.User:
        role = ChatCompletionRequestMessageRoleEnum.User;
        break;
      case ChatCompletionResponseMessageRoleEnum.Assistant:
        role = ChatCompletionRequestMessageRoleEnum.Assistant;
        break;
      default:
        break;
    }
    const newMessage: ChatCompletionRequestMessage = {
      role: role,
      content: response!!.data.choices[0].message!!.content,
    }

    setMessages([...currentMessages, newMessage])
    setResponseData(response)
    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth>
        <InputLabel>{'Model'}</InputLabel>
        <Select
          value={model}
          label={"Model"}
          onChange={handleModelChange}
        >
          {
            modelList.map((model) => {
              return <MenuItem value={model}>{model}</MenuItem>
            })
          }
        </Select>
      </FormControl>
      <TextField
        label={"message"}
        value={message ? message.content : ''}
        onChange={handleMessageChange}
      />
      <Button
        variant={"contained"}
        disabled={settings.openai_api_key.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </Button>
      <ul>
        {messages.map((message: ChatCompletionRequestMessage) => {
          return <li>{`[${message.role}] ${message.content}`}</li>
        })}
      </ul>
      <JsonLog
        object={responseData}
      />
    </div>
  )
}
