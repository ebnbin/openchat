import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from "react";
import {Button, createTheme, Divider, ThemeProvider, useMediaQuery} from "@mui/material";
import {EditRounded, MenuRounded, SettingsRounded} from "@mui/icons-material";
import {Chat, AppData} from "./data";
import {ChatPage} from "./ChatPage";
import {SettingsDialog} from "./SettingsDialog";
import CssBaseline from "@mui/material/CssBaseline";
import {ChatSettingsDialog} from "./ChatSettingsDialog";
import {useIsDarkMode} from "./util";

const drawerWidth = 300;

export function HomePage() {
  const isDarkMode = useIsDarkMode()

  const [settings, setSettings] = useState<AppData>(
    {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData
  )

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
    },
  })

  useEffect(() => {
    const storedSettings = localStorage.getItem('app_data')
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  const setSettingsAndStore = (settings: AppData) => {
    setSettings(settings)
    localStorage.setItem('app_data', JSON.stringify(settings))
  }

  const setChatSettings = (chat: Chat) => {
    const copyChats = settings.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chat.id)
    if (index === -1) {
      setSettingsAndStore(
        {
          ...settings,
          chats: [...copyChats, chat],
        } as AppData,
      )
      setSelectedChatId(chat.id)
    } else {
      copyChats[index] = chat
      setSettingsAndStore(
        {
          ...settings,
          chats: copyChats,
        } as AppData,
      )
    }
  }

  const deleteChat = (chatId: string) => {
    setSelectedChatId(undefined)
    const copyChats = settings.chats.slice()
    const index = copyChats.findIndex((foundChat) => foundChat.id === chatId)
    copyChats.splice(index, 1)
    setSettingsAndStore(
      {
        ...settings,
        chats: copyChats,
      } as AppData,
    )
    localStorage.removeItem(`chat_${chatId}`)
  }

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const handleClickSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  const handleNewChatClick = () => {
    const id = `${new Date().getTime()}`
    setSettingsAndStore(
      {
        ...settings,
        chats: [
          ...settings.chats,
          {
            id: id,
            title: '',
            context_threshold: 0.7,
            system_message: '',
            tokens_per_char: 0,
            tokens: 0,
          } as Chat
        ],
      } as AppData
    )
    setSelectedChatId(id)
  }

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedChatId, setSelectedChatId] = useState<string>();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (chat: Chat) => {
    setSelectedChatId(chat.id)
    setMobileOpen(false)
  }

  const isPageWide = useMediaQuery('(min-width:900px)')

  const drawer = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Button
        variant={'outlined'}
        onClick={handleNewChatClick}
        sx={{
          margin: '8px',
          flexShrink: 0,
        }}
      >
        New chat
      </Button>
      <Divider />
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        {settings.chats.slice().reverse().map((chatItem: Chat, index) => (
          <ListItem
            key={chatItem.id}
            disablePadding={true}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={handleClickOpen} // TODO
                sx={{display: isPageWide && selectedChatId === chatItem.id ? 'flex' : 'none', alignItems: 'center'}} // TODO
              >
                <EditRounded />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => handleItemClick(chatItem)}
              selected={selectedChatId === chatItem.id}
            >
              <ListItemText primary={chatItem.title === '' ? 'untitled' : chatItem.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <ListItem
        disablePadding={true}
        sx={{
          flexShrink: 0,
        }}
      >
        <ListItemButton
          onClick={handleClickSettingsOpen}
        >
          <ListItemIcon>
            <SettingsRounded/>
          </ListItemIcon>
          <ListItemText
            primary={'Settings'}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {
          !isPageWide && (
            <Drawer
              variant={'temporary'}
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
          )
        }
        {
          isPageWide && (
            <Drawer
              variant={'permanent'}
              open={true}
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
              }}
            >
              {drawer}
            </Drawer>
          )
        }
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {
            !isPageWide && (
              <Box
                sx={{
                  height: '56px',
                  flexShrink: 0,
                }}
              >
                <AppBar
                  color={'default'}
                >
                  <Toolbar
                    variant={'dense'}
                    sx={{
                      alignItems: 'center'
                    }}
                  >
                    <IconButton
                      edge="start"
                      onClick={handleDrawerToggle}
                      sx={{ mr: 2 }}
                    >
                      <MenuRounded/>
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                      {selectedChatId ? settings.chats.find((chat) => chat.id === selectedChatId)!!.title : 'New chat'}
                    </Typography>
                    <Box
                      sx={{
                        height: '56px',
                        flexGrow: 1,
                      }}
                    />
                    <IconButton
                      edge="end"
                      onClick={selectedChatId ? handleClickOpen : undefined}
                      sx={{
                        display: selectedChatId ? 'inherit' : 'none',
                      }}
                    >
                      <EditRounded />
                    </IconButton>
                  </Toolbar>
                </AppBar>
              </Box>
            )
          }
          <Box
            style={{
              width: '100%',
              flexGrow: 1,
              overflow: 'auto',
            }}
          >
            {selectedChatId !== undefined ? (
              <ChatPage
                key={`ChatPage${selectedChatId}`}
                settings={settings}
                chatId={selectedChatId}
                setChatSettings={setChatSettings}
              />
            ) : (
              <></>
            )}
          </Box>
        </Box>
      </Box>
      {selectedChatId !== undefined ? (
        <ChatSettingsDialog
          settings={settings}
          chatId={selectedChatId}
          setChatSettings={setChatSettings}
          deleteChat={deleteChat}
          open={open}
          handleClose={handleClose}
        />
      ) : <></>}
      <SettingsDialog
        settings={settings}
        setSettings={setSettingsAndStore}
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </ThemeProvider>
  );
}
