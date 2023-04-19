import Box from "@mui/material/Box";
import {Divider} from "@mui/material";
import {Chat} from "../../utils/types";
import React, {useState} from "react";
import store from "../../utils/store";
import HomeDrawerContentChatList from "./HomeDrawerContentChatList";
import HomeDrawerContentHeader from "./HomeDrawerContentHeader";
import HomeDrawerContentFooter from "./HomeDrawerContentFooter";

interface HomeDrawerContentProps {
  chats: Chat[];
  pageId: number,
  handleChatItemClick: (chatId: number) => void,
  handleNewChatClick: () => void,
  handleSearchClick: () => void,
  handleSaveListClick: () => void,
  handleSettingsClick: () => void,
}

export default function HomeDrawerContent(props: HomeDrawerContentProps) {
  const [pinChats, _setPinChats] = useState<number[]>(store.pinChats.get());
  const [pinMode, setPinMode] = useState(false);

  const handleChatItemClick = (chatId: number, pinned: boolean) => {
    if (pinMode) {
      if (pinned) {
        _setPinChats((prev) => {
          return prev.filter((id) => id !== chatId);
        });
      } else {
        _setPinChats((prev) => {
          return [...prev, chatId];
        });
      }
    } else {
      props.handleChatItemClick(chatId);
    }
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <HomeDrawerContentHeader
        pageId={props.pageId}
        pinMode={pinMode}
        handleNewChatClick={props.handleNewChatClick}
        handleSearchClick={props.handleSearchClick}
        handleSaveListClick={props.handleSaveListClick}
        handlePinModeClick={() => {
          setPinMode(true);
        }}
        handlePinModeSaveClick={() => {
          setPinMode(false);
          store.pinChats.set(pinChats);
        }}
        handlePinModeCloseClick={() => {
          setPinMode(false);
          _setPinChats(store.pinChats.get());
        }}
      />
      <Divider/>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        <HomeDrawerContentChatList
          chats={props.chats}
          pinChats={pinChats}
          pageId={props.pageId}
          handleChatItemClick={handleChatItemClick}
          pinMode={pinMode}
        />
      </Box>
      <Divider/>
      <HomeDrawerContentFooter
        pinMode={pinMode}
        handleSettingsClick={props.handleSettingsClick}
      />
    </Box>
  );
}
