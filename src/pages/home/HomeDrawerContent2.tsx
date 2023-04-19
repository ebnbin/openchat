import Box from "@mui/material/Box";
import {Chip, Divider, IconButton, Typography, useTheme} from "@mui/material";
import {
  AddRounded, BookmarksRounded, CloseRounded,
  DashboardCustomizeRounded, DoneRounded,
  SettingsRounded
} from "@mui/icons-material";
import ListItemButton from "@mui/material/ListItemButton";
import ListItem from "@mui/material/ListItem";
import {pageSaveList} from "./HomePage";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Chat} from "../../utils/types";
import React, {useEffect, useState} from "react";
import store from "../../utils/store";
import HomeDrawerContentChatList from "./HomeDrawerContentChatList";

interface HomeDrawerContent2Props {
  chats: Chat[];
  handleClose: () => void;
  selectedContentId: number,
  setSelectedContentId: (selectedContentId: number) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: updatingPins ? "none" : "flex",
          flexDirection: "column",
          flexGrow: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            height: "48px",
            paddingX: "4px",
          }}
        >
          <Chip
            variant={"outlined"}
            color={"primary"}
            label={"New chat"}
            icon={<AddRounded/>}
            onClick={() => {
              props.handleNewChatClick();
              handlePopoverClose();
            }}
            sx={{
              fontSize: theme.typography.body2.fontSize,
              marginX: "16px",
              flexGrow: 1,
            }}
          />
          <IconButton
            onClick={() => {
              props.handleLikesClick();
              handlePopoverClose();
            }}
            color={props.selectedContentId === pageSaveList ? "primary" : "default"}
            sx={{
              width: "48px",
              height: "48px",
            }}
          >
            <BookmarksRounded/>
          </IconButton>
          <IconButton
            onClick={() => setUpdatingPins(true)}
            sx={{
              width: "48px",
              height: "48px",
            }}
          >
            <DashboardCustomizeRounded/>
          </IconButton>
        </Box>
      </Box>
      <Box
        sx={{
          alignItems: "center",
          display: updatingPins ? "flex" : "none",
          flexDirection: "row",
          height: "48px",
          paddingX: "4px",
        }}
      >
        <Typography
          textAlign={"center"}
          variant={"body2"}
          color={theme.palette.primary.main}
          sx={{
            flexGrow: 1,
          }}
        >
          {"Customize your pins"}
        </Typography>
        <IconButton
          onClick={cancelPinTimestamps}
          sx={{
            width: "48px",
            height: "48px",
            padding: "0px",
            marginX: "0px",
          }}
        >
          <CloseRounded/>
        </IconButton>
        <IconButton
          onClick={savePinTimestamps}
          sx={{
            width: "48px",
            height: "48px",
            padding: "0px",
            marginX: "0px",
          }}
        >
          <DoneRounded/>
        </IconButton>
      </Box>
      <Divider/>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        <HomeDrawerContentChatList
          chats={props.chats}
          pinChats={pinChats}
          pageId={props.selectedContentId}
          handleItemClick={(chatId, pinned) => {
            if (pinned) {
              handlePinedItemClick(chatId);
            } else {
              handleUnpinedItemClick(chatId);
            }
          }}
          pinMode={updatingPins}
        />
      </Box>
      <Divider/>
      <ListItem
        disablePadding={true}
        sx={{
          display: updatingPins ? "none" : "flex",
          flexShrink: 0,
        }}
      >
        <ListItemButton
          onClick={props.handleSettingsDialogOpen}
        >
          <ListItemIcon>
            <SettingsRounded
              sx={{
                marginLeft: "8px",
              }}
            />
          </ListItemIcon>
          <ListItemText
            primary={"Settings"}
          />
        </ListItemButton>
      </ListItem>
    </Box>
  )
}
