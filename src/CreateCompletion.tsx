import React, {ChangeEvent, useState} from "react";
import {Configuration, OpenAIApi} from "openai";
import {Button, TextField} from "@mui/material";

interface CreateCompletionProps {
  apiKey: string;
}

// https://platform.openai.com/docs/api-reference/completions/create
export function CreateCompletion({ apiKey }: CreateCompletionProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  };

  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const request = async () => {
    setResponse('[Loading]')
    setIsLoading(true)

    const response = await openai
      .createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
      }).catch((error: any) => {
        setResponse(`[${error}]`)
        setIsLoading(false)
      });

    setResponse(response.data.choices[0].text)
    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
      <div>
        {response}
      </div>
    </div>
  )
}
