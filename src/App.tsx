import React, {useEffect, useState} from 'react';
import ResponsiveDrawer, {Page} from "./ResponsiveDrawer";
import {ListModels} from "./ListModels";
import {CreateCompletionPage} from "./CreateCompletionPage";
import {ApiKeyPage} from "./ApiKeyPage";
import {CreateChatCompletionPage} from "./CreateChatCompletionPage";
import {createTheme, ThemeProvider} from "@mui/material";
import {ChatPage} from "./ChatPage";
import {Chat} from "./data";
import {Configuration, OpenAIApi} from "openai";

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
      title: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 4096,
      extraCharsPerMessage: 16,
      contextThreshold: 0.3,
      systemMessage: '',
      conversations: [],
      tokensPerChar: 0,
      tokens: 0,
      incomplete: false,
    } as Chat
  )

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const { Configuration, OpenAIApi } = require("openai");
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

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
          api={openai}
          chat={chat}
          setChat={setChat}
          open={open}
          handleClose={handleClose}
        />
      ),
      handleClickOpen: handleClickOpen,
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
