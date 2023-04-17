import Box from "@mui/material/Box";
import {Chip, Divider, IconButton, Typography, useTheme} from "@mui/material";
import {
  AddRounded, BookmarksRounded, CloseRounded,
  DashboardCustomizeRounded, DoneRounded,
  SettingsRounded
} from "@mui/icons-material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ChatIcon from "../../components/ChatIcon";
import ListItem from "@mui/material/ListItem";
import {contentLikes} from "./HomePage";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Chat} from "../../utils/types";
import React, {useEffect, useState} from "react";
import store from "../../utils/store";

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunkedArr: T[][] = [];
  while (arr.length) {
    chunkedArr.push(arr.splice(0, size));
  }
  return chunkedArr;
}

interface HomeDrawerContent2Props {
  chats: Chat[];
  handleClose: () => void;
  selectedContentId: number,
  setSelectedContentId: (selectedContentId: number) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
  handleSettingsDialogOpen: () => void,
  isPopover: boolean,
}

export default function HomeDrawerContent2(props: HomeDrawerContent2Props) {
  const theme = useTheme();

  const [updatingPins, setUpdatingPins] = useState(false);

  const [pinChats, _setPinChats] = useState<number[]>([]);

  useEffect(() => {
    _setPinChats(store.pinChats.get());
  }, []);

  const pinnedChats = () => {
    const chats = ([...pinChats]
      .map((chatId) => {
        return props.chats.find((chat) => chat.id === chatId);
      })
      .filter((chat) => chat !== undefined)) as Chat[]
    return chunkArray(chats, 3)
  }

  const unpinnedChats = () => {
    return [...props.chats]
      .filter((chat) => !pinChats.includes(chat.id))
      .sort((a, b) => {
        return b.update_timestamp - a.update_timestamp;
      });
  }

  const handlePinedItemClick = (chatId: number) => {
    if (updatingPins) {
      _setPinChats((prev) => {
        return prev.filter((id) => id !== chatId);
      });
      return;
    }
    props.setSelectedContentId(chatId);
    handlePopoverClose();
  }

  const handleUnpinedItemClick = (chatId: number) => {
    if (updatingPins) {
      _setPinChats((prev) => {
        return [...prev, chatId];
      });
      return;
    }
    props.setSelectedContentId(chatId);
    handlePopoverClose();
  }

  const handlePopoverClose = () => {
    cancelPinTimestamps();
    props.handleClose();
  }

  const savePinTimestamps = () => {
    setUpdatingPins(false);
    store.pinChats.set(pinChats);
  }

  const cancelPinTimestamps = () => {
    setUpdatingPins(false);
    _setPinChats(store.pinChats.get());
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
          display: updatingPins ? 'none' : 'flex',
          flexDirection: 'column',
          flexGrow: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            height: '56px',
            paddingX: '4px',
          }}
        >
          <Chip
            variant={'outlined'}
            color={'primary'}
            label={'New chat'}
            icon={<AddRounded/>}
            onClick={() => {
              props.handleNewChatClick();
              handlePopoverClose();
            }}
            sx={{
              fontSize: theme.typography.body2.fontSize,
              marginX: '16px',
              flexGrow: 1,
            }}
          />
          <IconButton
            onClick={() => {
              props.handleLikesClick();
              handlePopoverClose();
            }}
            color={props.selectedContentId === contentLikes ? 'primary' : 'default'}
            sx={{
              width: '48px',
              height: '48px',
            }}
          >
            <BookmarksRounded/>
          </IconButton>
          <IconButton
            onClick={() => setUpdatingPins(true)}
            sx={{
              width: '48px',
              height: '48px',
            }}
          >
            <DashboardCustomizeRounded/>
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          display: updatingPins ? 'flex' : 'none',
          flexDirection: 'row',
          height: '56px',
          paddingX: '4px',
        }}
      >
        <Typography
          textAlign={'center'}
          variant={'body2'}
          color={theme.palette.primary.main}
          sx={{
            flexGrow: 1,
          }}
        >
          {'Customize your pins'}
        </Typography>
        <IconButton
          onClick={cancelPinTimestamps}
          sx={{
            width: '48px',
            height: '48px',
            padding: '0px',
            marginX: '0px',
          }}
        >
          <CloseRounded/>
        </IconButton>
        <IconButton
          onClick={savePinTimestamps}
          sx={{
            width: '48px',
            height: '48px',
            padding: '0px',
            marginX: '0px',
          }}
        >
          <DoneRounded/>
        </IconButton>
      </Box>
      <Divider/>
      <List
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          padding: '0px',
          // minWidth: '300px',
          // '&::-webkit-scrollbar': {
          //   display: 'none',
          // },
        }}
      >
        {pinnedChats().map((row, index) => (
          <Box
            key={index}
            sx={{
              // width: '300px',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            {row.map((chat, index) => (
              <ListItemButton
                key={index}
                onClick={() => handlePinedItemClick(chat.id)}
                selected={chat.id === props.selectedContentId}
                sx={{
                  color: theme.palette.text.primary,
                  display: 'flex',
                  flexDirection: 'column',
                  flexGrow: 1,
                  maxWidth: '100px',
                  height: '100px',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textTransform: 'none',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: '80px',
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
                      width: '80px',
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
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        textOverflow: 'ellipsis',
                        lineHeight: 1.2,
                        fontWeight: props.selectedContentId === chat.id ? 'bold' : 'normal',
                      }}
                    >
                      {chat.title === '' ? 'New chat' : chat.title}
                    </Typography>
                  </Box>
                </Box>
              </ListItemButton>
            ))}
            {
              row.length < 3 ? (
                <ListItemButton
                  disabled={true}
                  sx={{
                    color: theme.palette.text.primary,
                    display: 'flex',
                    flexDirection: 'column',
                    flexGrow: 3 - row.length,
                    maxWidth: '100px',
                    height: '100px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textTransform: 'none',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        width: '80px',
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                    </Box>
                    <Box
                      sx={{
                        width: '80px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: '4px',
                      }}
                    >
                    </Box>
                  </Box>
                </ListItemButton>
              ) : undefined
            }
          </Box>
        ))}
        <Divider
          sx={{
            display: pinnedChats().length === 0 ? 'none' : 'block',
          }}
        />
        {unpinnedChats().map((chat: Chat) => (
          <ListItem
            key={chat.id}
            disablePadding={true}
            sx={{
              // minWidth: '300px',
            }}
          >
            <ListItemButton
              onClick={() => handleUnpinedItemClick(chat.id)}
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
          display: updatingPins ? 'none' : 'flex',
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
