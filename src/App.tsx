import React, {useEffect, useState} from 'react';
import ResponsiveDrawer, {Page} from "./ResponsiveDrawer";
import {ListModels} from "./ListModels";
import {CreateCompletion} from "./CreateCompletion";
import {ApiKey} from "./ApiKey";
import {CreateChatCompletion} from "./CreateChatCompletion";
import {createTheme, ThemeProvider} from "@mui/material";

function App() {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const pageList: Page[] = [
    {
      key: 'ApiKey',
      title: 'API key',
      element: (
        <ApiKey
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
        <CreateCompletion
          apiKey={apiKey}
        />
      ),
    },
    {
      key: 'CreateChatCompletion',
      title: 'Create chat completion',
      element: (
        <CreateChatCompletion
          apiKey={apiKey}
        />
      ),
    },
  ]

  const theme = createTheme({
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
