import {Button, Divider, useMediaQuery} from "@mui/material";
import List from "@mui/material/List";
import {Chat, Settings} from "../../util/data";
import ListItem from "@mui/material/ListItem";
import IconButton from "@mui/material/IconButton";
import {
  AddRounded,
  EditRounded, FavoriteRounded,
  SettingsRounded
} from "@mui/icons-material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Box from "@mui/material/Box";
import * as React from "react";
import {widePageWidth} from "../../util/util";
import {contentLikes, contentNewChat} from "./HomePage";
import ChatIcon from "../../component/ChatIcon";

interface HomeDrawerContentProps {
  settings: Settings,
  chats: Chat[],
  selectedContentId: string,
  handleChatSettingsDialogOpen: () => void,
  handleChatItemClick: (chatId: string) => void,
  handleSettingsDialogOpen: () => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
}

export default function HomeDrawerContent(props: HomeDrawerContentProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const getChats = () => {
    return [...props.chats].sort((a, b) => {
      return b.update_timestamp - a.update_timestamp;
    });
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Button
          variant={'outlined'}
          onClick={props.handleNewChatClick}
          sx={{
            margin: '8px',
            flexGrow: 1,
          }}
        >
          <AddRounded
            sx={{
              marginRight: '8px',
            }}
          />
          {'New chat'}
        </Button>
        <Button
          variant={'outlined'}
          onClick={props.handleNewChatSettingsDialogOpen}
          sx={{
            display: props.selectedContentId === contentNewChat ? undefined : 'none',
            margin: '8px',
            marginLeft: '0px',
            flexShrink: 0,
          }}
        >
          <EditRounded/>
        </Button>
      </Box>
      <Divider/>
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
        }}
      >
        <ListItem
          key={contentLikes}
          disablePadding={true}
        >
          <ListItemButton
            onClick={props.handleLikesClick}
            selected={props.selectedContentId === contentLikes}
          >
            <ListItemIcon>
              <FavoriteRounded
                sx={{
                  marginLeft: '8px',
                }}
              />
            </ListItemIcon>
            <ListItemText
              primary={'Likes'}
              primaryTypographyProps={{
                noWrap: props.selectedContentId !== contentLikes,
                fontWeight: props.selectedContentId === contentLikes ? 'bold' : undefined,
              }}
            />
          </ListItemButton>
        </ListItem>
        {getChats().map((chat: Chat) => (
          <ListItem
            key={chat.id}
            disablePadding={true}
            secondaryAction={
              <IconButton
                edge={'end'}
                onClick={props.handleChatSettingsDialogOpen}
                sx={{
                  visibility: isWidePage && props.selectedContentId === chat.id ? undefined : 'hidden',
                }}
              >
                <EditRounded/>
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => props.handleChatItemClick(chat.id)}
              selected={props.selectedContentId === chat.id}
            >
              <ListItemIcon>
                <ChatIcon
                  iconText={chat.icon_text}
                  iconTextSize={chat.icon_text_size}
                  iconColor={chat.icon_color}
                />
              </ListItemIcon>
              <ListItemText
                primary={chat.title === '' ? 'New chat' : chat.title}
                primaryTypographyProps={{
                  noWrap: props.selectedContentId !== chat.id,
                  fontWeight: props.selectedContentId === chat.id ? 'bold' : undefined,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider/>
      <ListItem
        disablePadding={true}
        sx={{
          flexShrink: 0,
        }}
      >
        <ListItemButton
          onClick={props.handleSettingsDialogOpen}
        >
          <ListItemIcon>
            <SettingsRounded
              sx={{
                marginLeft: '8px',
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={'Settings'}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  )
}
