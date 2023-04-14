import {Button, Divider, IconButton, Popover, Typography, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import {Chat} from "../../util/data";
import ChatIcon from "../../component/ChatIcon";
import {AddRounded, FavoriteRounded, SettingsRounded} from "@mui/icons-material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import {contentLikes} from "./HomePage";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunkedArr: T[][] = [];
  while (arr.length) {
    chunkedArr.push(arr.splice(0, size));
  }
  return chunkedArr;
}

interface HomeGridCardProps {
  chats: Chat[];
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  handleClose: () => void;
  selectedContentId: number,
  setSelectedContentId: (selectedContentId: number) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
  handleSettingsDialogOpen: () => void,
}

export default function HomeGridCard(props: HomeGridCardProps) {
  const theme = useTheme();

  const getChats = () => {
    return [...props.chats].sort((a, b) => {
      return b.update_timestamp - a.update_timestamp;
    });
  }

  console.log(props.chats.length)
  const chatGrid = chunkArray(getChats(), 3);
  console.log(chatGrid)

  const handleChatItemClick = (chatId: number) => {
    props.setSelectedContentId(chatId);
    props.handleClose();
  }

  return (
    <Popover
      open={props.open}
      anchorEl={props.anchorEl}
      onClose={props.handleClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Box
        sx={{
          maxHeight: '398px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 0,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <Button
              variant={'outlined'}
              size={'small'}
              onClick={() => {
                props.handleNewChatClick();
                props.handleClose();
              }}
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
            <IconButton
              onClick={() => {
                props.handleSettingsDialogOpen();
                props.handleClose();
              }}
              sx={{
                width: '48px',
              }}
            >
              <SettingsRounded/>
            </IconButton>
          </Box>
          <Divider/>
        </Box>
        <List
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            padding: '0px',
            minWidth: '300px',
          }}
        >
          {chatGrid.map((row, index) => (
            <Box
              key={index}
              sx={{
                width: '300px',
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              {row.map((chat, index) => (
                <ListItemButton
                  key={index}
                  onClick={() => handleChatItemClick(chat.id)}
                  selected={chat.id === props.selectedContentId}
                  sx={{
                    color: theme.palette.text.primary,
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100px',
                    maxWidth: '100px',
                    height: '100px',
                    padding: '12px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textTransform: 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <ChatIcon
                      iconText={chat.icon_text}
                      iconTextSize={chat.icon_text_size}
                      iconColor={chat.icon_color}
                    />
                  </Box>
                  <Box
                    sx={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '4px',
                    }}
                  >
                    <Typography
                      variant={'caption'}
                      align={'center'}
                      sx={{
                        width: '100%',
                        overflow: 'hidden',
                        maxLines: 2,
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                        fontWeight: props.selectedContentId === chat.id ? 'bold' : 'normal',
                      }}
                    >
                      {chat.title}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </Box>
          ))}
          <Divider/>
          <ListItem
            key={contentLikes}
            disablePadding={true}
          >
            <ListItemButton
              onClick={() => {
                props.handleLikesClick();
                props.handleClose();
              }}
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
            >
              <ListItemButton
                onClick={() => handleChatItemClick(chat.id)}
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
      </Box>
    </Popover>
  );
}
