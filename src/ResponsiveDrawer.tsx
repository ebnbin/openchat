import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {useEffect, useState} from "react";
import {Button, Divider, useMediaQuery} from "@mui/material";
import {EditRounded, MenuRounded, SettingsRounded} from "@mui/icons-material";
import {Chat, Settings} from "./data";
import {ListModels} from "./ListModels";
import {CreateCompletionPage} from "./CreateCompletionPage";
import {CreateChatCompletionPage} from "./CreateChatCompletionPage";
import {ChatPage} from "./ChatPage";
import {SettingsDialog} from "./SettingsDialog";

const drawerWidth = 300;

export class Page {
  constructor(public key: string, public title: string, public element: JSX.Element, public handleClickOpen?: () => void) {
  }
}

interface Props {
  pageList: Page[];
}

export default function ResponsiveDrawer(props: Props) {
  const [settings, setSettings] = useState<Settings>(
    {
      apiKey: '',
      chatList: [],
    } as Settings
  )

  useEffect(() => {
    const storedSettings = localStorage.getItem('settings')
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings))
    }
  }, [])

  const setSettingsAndStore = (settings: Settings) => {
    setSettings(settings)
    localStorage.setItem('settings', JSON.stringify(settings))
  }

  const [chat, setChat] = useState<Chat>(
    {
      id: '',
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

  const setChatAndStore = (chat: Chat) => {
    setChat(chat)
    localStorage.setItem(`chat_${chat.id}`, JSON.stringify(chat))
  }

  useEffect(() => {
    const storedChat = localStorage.getItem('chat')
    if (storedChat) {
      setChat(JSON.parse(storedChat))
    }
  }, [])

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

  const pageList: Page[] = [
    {
      key: 'ListModels',
      title: 'List models',
      element: (
        <ListModels
          settings={settings}
        />
      ),
    },
    {
      key: 'CreateCompletion',
      title: 'Create completion',
      element: (
        <CreateCompletionPage
          settings={settings}
        />
      ),
    },
    {
      key: 'CreateChatCompletion',
      title: 'Create chat completion',
      element: (
        <CreateChatCompletionPage
          settings={settings}
        />
      ),
    },
    {
      key: 'Chat',
      title: 'Chat',
      element: (
        <ChatPage
          settings={settings}
          setSettings={setSettingsAndStore}
          chat={chat}
          setChat={setChatAndStore}
          open={open}
          handleClose={handleClose}
        />
      ),
      handleClickOpen: handleClickOpen,
    },
  ]

  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedPage, setSelectedPage] = useState<number>(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (page: number) => {
    setSelectedPage(page)
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
        {pageList.map((page: Page, index) => (
          <ListItem
            key={page.key}
            disablePadding={true}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={pageList[index].handleClickOpen}
                sx={{display: isPageWide && pageList[index].handleClickOpen && selectedPage === index ? 'flex' : 'none', alignItems: 'center'}}
              >
                <EditRounded />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => handleItemClick(index)}
              selected={selectedPage === index}
            >
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={page.title} />
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
                    {selectedPage ? pageList[selectedPage].title : 'Responsive drawer'}
                  </Typography>
                  <Box
                    sx={{
                      height: '56px',
                      flexGrow: 1,
                    }}
                  />
                  <IconButton
                    edge="end"
                    onClick={pageList[selectedPage].handleClickOpen}
                    sx={{
                      display: pageList[selectedPage].handleClickOpen ? 'inherit' : 'none',
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
          {pageList[selectedPage].element}
        </Box>
      </Box>
      <SettingsDialog
        settings={settings}
        setSettings={setSettingsAndStore}
        open={settingsOpen}
        handleClose={handleSettingsClose}
      />
    </Box>
  );
}
