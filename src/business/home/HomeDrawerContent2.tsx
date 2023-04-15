import Box from "@mui/material/Box";
import {Chip, Divider, IconButton, Typography, useTheme} from "@mui/material";
import {
  AddRounded, CloseRounded,
  DashboardCustomizeRounded, DoneRounded,
  FavoriteRounded,
  SettingsRounded
} from "@mui/icons-material";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ChatIcon from "../../component/ChatIcon";
import ListItem from "@mui/material/ListItem";
import {contentLikes} from "./HomePage";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Chat} from "../../util/data";
import React, {useEffect, useState} from "react";

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
  updateChatPinTimestamps: (pinTimestamps: Record<number, number>) => void,
  isPopover: boolean,
}

export default function HomeDrawerContent2(props: HomeDrawerContent2Props) {
  const theme = useTheme();

  function initChatPinTimestamps(): Record<number, number> {
    return props.chats.reduce((acc, chat) => {
      acc[chat.id] = chat.pin_timestamp;
      return acc;
    }, {} as Record<number, number>)
  }

  const [updatingPins, setUpdatingPins] = useState(false);

  const [chatPinTimestamps, setChatPinTimestamps] = useState<Record<number, number>>({});

  useEffect(() => {
    setChatPinTimestamps(initChatPinTimestamps());
  }, [props.chats]);

  const pinnedChats = () => {
    const chats = [...props.chats]
      .filter((chat) => chatPinTimestamps[chat.id] > 0)
      .sort((a, b) => {
        return chatPinTimestamps[a.id] - chatPinTimestamps[b.id];
      });
    return chunkArray(chats, 3)
  }

  const unpinnedChats = () => {
    return [...props.chats]
      .filter((chat) => chatPinTimestamps[chat.id] === 0 || chatPinTimestamps[chat.id] === undefined)
      .sort((a, b) => {
        return b.update_timestamp - a.update_timestamp;
      });
  }

  const handlePinedItemClick = (chatId: number) => {
    if (updatingPins) {
      setChatPinTimestamps((prev) => {
        return {
          ...prev,
          [chatId]: 0,
        }
      });
      return;
    }
    props.setSelectedContentId(chatId);
    handlePopoverClose();
  }

  const handleUnpinedItemClick = (chatId: number) => {
    if (updatingPins) {
      setChatPinTimestamps((prev) => {
        return {
          ...prev,
          [chatId]: Date.now(),
        }
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
    props.updateChatPinTimestamps(chatPinTimestamps);
  }

  const cancelPinTimestamps = () => {
    setUpdatingPins(false);
    setChatPinTimestamps(initChatPinTimestamps());
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
            height: '48px',
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
          height: '48px',
          alignItems: 'center',
          display: updatingPins ? 'flex' : 'none',
          flexDirection: 'row',
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
                        overflow: 'hidden',
                        maxLines: 2,
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
        <ListItem
          key={contentLikes}
          disablePadding={true}
          sx={{
            display: updatingPins ? 'none' : 'flex',
            // minWidth: '300px',
          }}
        >
          <ListItemButton
            onClick={() => {
              props.handleLikesClick();
              handlePopoverClose();
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
