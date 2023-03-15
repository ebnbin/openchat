import React, {ChangeEvent, useState} from 'react';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApiKeyChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value)
  };

  const handlePromptChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPrompt(event.target.value)
  };

  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  // https://platform.openai.com/docs/api-reference/completions/create
  const requestCompletions = async () => {
    setResponse('[Loading]')
    setIsLoading(true)

    const completions = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
    }).catch((error: any) => {
      setResponse(`[${error}]`)
      setIsLoading(false)
    });

    setResponse(completions.data.choices[0].text)
    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <input
        placeholder={"OPENAI_API_KEY"}
        value={apiKey}
        onChange={handleApiKeyChange}
      />
      <text>
        completions
      </text>
      <input
        placeholder={"prompt"}
        value={prompt}
        onChange={handlePromptChange}
      />
      <button
        disabled={apiKey.length === 0 || isLoading}
        onClick={requestCompletions}
      >
        {"Request"}
      </button>
      <text>
        {response}
      </text>
    </div>
  );
}

export default App;
