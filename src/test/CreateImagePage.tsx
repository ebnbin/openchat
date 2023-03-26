import React, {ChangeEvent, useState} from "react";
import {Button, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField} from "@mui/material";
import {JsonLog} from "./JsonLog";
import {api} from "../util/util";
import {CreateImageRequestSizeEnum} from "openai";

interface CreateImagePageProps {
  apiKey: string
}

// https://platform.openai.com/docs/api-reference/images/create
export function CreateImagePage({ apiKey }: CreateImagePageProps) {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<string>('256x256');
  const [response, setResponse] = useState('');
  const [responseData, setResponseData] = useState<any>();
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  };

  const handleSizeChange = (event: SelectChangeEvent) => {
    const size = sizes.find((s) => s === event.target.value)
    if (size) {
      setSize(size)
    }
  }

  const request = () => {
    setResponse('[Loading]')
    setResponseData(undefined)
    setIsLoading(true)

    api(apiKey)
      .createImage({
        prompt: prompt,
        size: size as CreateImageRequestSizeEnum | undefined,
      })
      .then(response => {
        setResponse(response.data.data[0].url!!)
        setResponseData(response)
        setIsLoading(false)
      })
      .catch(error => {
        setResponse('')
        setResponseData(error)
        setIsLoading(false)
      })
  }

  const sizes = [
    '256x256',
    '512x512',
    '1024x1024',
  ]

  const imageSize = () => {
    switch (size) {
      case '256x256':
        return '256px'
      case '512x512':
        return '512px'
      case '1024x1024':
        return '1024px'
    }
    return 'auto'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <FormControl fullWidth>
        <InputLabel>{'Size'}</InputLabel>
        <Select
          value={size}
          label={"Size"}
          onChange={handleSizeChange}
        >
          {
            sizes.map((size) => {
              return <MenuItem value={size}>{`${size}`}</MenuItem>
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
        disabled={apiKey.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </Button>
      <img src={response} alt={'response'} style={{
        width: imageSize(),
        height: imageSize(),
      }} />
      <JsonLog
        object={responseData}
      />
    </div>
  )
}
