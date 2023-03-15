import React, {ChangeEvent, useState} from 'react';

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
      <input
        placeholder={"OPENAI_API_KEY"}
        value={apiKey}
        onChange={handleApiKeyChange}
      />
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

    const response = await openai.createCompletion({
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
      <input
        placeholder={"prompt"}
        value={prompt}
        onChange={handlePromptChange}
      />
      <button
        disabled={apiKey.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </button>
      <text>
        {response}
      </text>
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
      <CreateCompletion
        apiKey={apiKey}
      />
    </div>
  );
}

export default App;
