import {Button, Divider, useMediaQuery} from "@mui/material";
import List from "@mui/material/List";
import {Chat} from "../../util/data";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import {EditRounded, SettingsRounded} from "@mui/icons-material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Box from "@mui/material/Box";
import * as React from "react";

interface HomeDrawerContentProps {
  chats: Chat[],
  createChat: () => Chat,
  selectedChatId: string,
  setSelectedChatId: (selectedChatId: string) => void,
  handleClickOpen: () => void,
  handleItemClick: (chatId: string) => void,
  handleClickSettingsOpen: () => void,
}

export default function HomeDrawerContent(props: HomeDrawerContentProps) {
  const { chats, createChat, selectedChatId, setSelectedChatId, handleClickOpen, handleItemClick,
    handleClickSettingsOpen } = props

  const isPageWide = useMediaQuery('(min-width:900px)')

  const handleNewChatClick = () => {
    const chat = createChat();
    setSelectedChatId(chat.id);
  }

  return (
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
        {chats.slice().reverse().map((chatItem: Chat, index) => (
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
              onClick={() => handleItemClick(chatItem.id)}
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
  )
}
