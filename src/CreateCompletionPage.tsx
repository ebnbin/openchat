import React, {ChangeEvent, useState} from "react";
import {Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {JsonLog} from "./JsonLog";
import {Settings} from "./data";
import {api} from "./util";

interface CreateCompletionProps {
  settings: Settings;
}

// https://platform.openai.com/docs/api-reference/completions/create
export function CreateCompletionPage({ settings }: CreateCompletionProps) {
  const modelList: string[] = [
    'text-davinci-003',
    'text-davinci-002',
    'text-curie-001',
    'text-babbage-001',
    'text-ada-001',
    'davinci',
    'curie',
    'babbage',
    'ada',
  ]

  const [model, setModel] = useState(modelList[0]);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [responseData, setResponseData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handleModelChange = (event: SelectChangeEvent) => {
    setModel(event.target.value)
  }

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  };

  const request = async () => {
    setResponse('[Loading]')
    setResponseData(undefined)
    setIsLoading(true)

    const response = await api(settings.openai_api_key)
      .createCompletion({
        model: model,
        prompt: prompt,
      }).catch((error: any) => {
        setResponse(`[${error}]`)
        setResponseData(error)
        setIsLoading(false)
      });

    setResponse(response!!.data.choices[0].text!!)
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
        label={"prompt"}
        value={prompt}
        onChange={handlePromptChange}
      />
      <Button
        variant={"contained"}
        disabled={settings.openai_api_key.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </Button>
      <div>
        {response}
      </div>
      <JsonLog
        object={responseData}
      />
    </div>
  )
}
