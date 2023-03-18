import React, {useEffect, useState} from 'react';
import ResponsiveDrawer, {Page} from "./ResponsiveDrawer";
import {ListModels} from "./ListModels";
import {CreateCompletionPage} from "./CreateCompletionPage";
import {ApiKeyPage} from "./ApiKeyPage";
import {CreateChatCompletionPage} from "./CreateChatCompletionPage";
import {createTheme, ThemeProvider} from "@mui/material";
import {ChatPage} from "./ChatPage";
import {Chat} from "./data";

function App() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [apiKey]);

  const [chat, setChat] = useState<Chat>(
    {
      model: 'gpt-3.5-turbo',
      maxTokens: 4096,
      historyThreshold: 0.7,
      systemContent: '',
      conversationList: [],
      tokensPerChar: 0,
      extraCharsPerMessage: 0,
    } as Chat
  )

  const pageList: Page[] = [
    {
      key: 'ApiKey',
      title: 'API key',
      element: (
        <ApiKeyPage
          apiKey={apiKey}
          setApiKey={setApiKey}
        />
      ) },
    {
      key: 'ListModels',
      title: 'List models',
      element: (
        <ListModels
          apiKey={apiKey}
        />
      ),
    },
    {
      key: 'CreateCompletion',
      title: 'Create completion',
      element: (
        <CreateCompletionPage
          apiKey={apiKey}
        />
      ),
    },
    {
      key: 'CreateChatCompletion',
      title: 'Create chat completion',
      element: (
        <CreateChatCompletionPage
          apiKey={apiKey}
        />
      ),
    },
    {
      key: 'Chat',
      title: 'Chat',
      element: (
        <ChatPage
          apiKey={apiKey}
          chat={chat}
          setChat={setChat}
        />
      ),
    },
  ]

  const theme = createTheme({
    palette: {
      mode: 'light',
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
  })

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveDrawer
        pageList={pageList}
      />
    </ThemeProvider>
  );
}

export default App;
