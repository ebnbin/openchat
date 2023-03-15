import React, {ChangeEvent, useState} from 'react';
import {Configuration, Model, OpenAIApi} from "openai";
import {Button, Divider, TextField} from "@mui/material";

interface ApiKeyProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

function ApiKey({ apiKey, setApiKey }: ApiKeyProps) {
  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>
        API key
      </h2>
      <TextField
        label={"OPENAI_API_KEY"}
        value={apiKey}
        onChange={handleApiKeyChange}
      />
    </div>
  );
}

function Json({ value }: { value: any }) {
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {JSON.stringify(value, null, 2)}
    </div>
  )
}

interface ListModelsProps {
  apiKey: string;
}

// https://platform.openai.com/docs/api-reference/models/list
function ListModels({ apiKey }: ListModelsProps) {
  const [response, setResponse] = useState<JSX.Element[]>();
  const [isLoading, setIsLoading] = useState(false);

  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const request = async () => {
    setIsLoading(true)

    const response = await openai
      .listModels()
      .catch(() => {
        setIsLoading(false)
      });
    const listItems = response.data.data.map((item: Model) =>
      <li key={item.id}>
        <Json value={item} />
      </li>
    );
    setResponse(listItems)

    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h2>
        List models
      </h2>
      <Button
        variant={"contained"}
        disabled={apiKey.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </Button>
      <ol>
        {response}
      </ol>
    </div>
  );
}

interface CreateCompletionProps {
  apiKey: string;
}

// https://platform.openai.com/docs/api-reference/completions/create
function CreateCompletion({ apiKey }: CreateCompletionProps) {
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
      <h2>
        Create completion
      </h2>
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

function App() {
  const [apiKey, setApiKey] = useState('');

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', padding: '8px' }}
    >
      <ApiKey
        apiKey={apiKey}
        setApiKey={setApiKey}
      />
      <Divider />
      <ListModels
        apiKey={apiKey}
      />
      <Divider />
      <CreateCompletion
        apiKey={apiKey}
      />
    </div>
  );
}

export default App;
