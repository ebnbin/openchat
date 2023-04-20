import Box from "@mui/material/Box";
import {Divider} from "@mui/material";
import {Chat} from "../../utils/types";
import React, {useEffect, useState} from "react";
import HomeDrawerContentChatList from "./HomeDrawerContentChatList";
import HomeDrawerContentHeader from "./HomeDrawerContentHeader";
import HomeDrawerContentFooter from "./HomeDrawerContentFooter";

function updateChatPinTimestamps(chats: Chat[]): Map<number, number> {
  return new Map(chats.map((chat) => [chat.id, chat.pin_timestamp]));
}

interface HomeDrawerContentProps {
  chats: Chat[];
  updateChats: (chatUpdater: (chatId: number) => Partial<Chat>) => void;
  pageId: number;
  handleChatItemClick: (chatId: number) => void;
  handleNewChatClick: () => void;
  handleSearchClick: () => void;
  handleSaveListClick: () => void;
  handleSettingsClick: () => void;
}

export default function HomeDrawerContent(props: HomeDrawerContentProps) {
  const [chatPinTimestamps, _setChatPinTimestamps] = useState<Map<number, number>>(new Map());
  const [pinMode, setPinMode] = useState(false);

  useEffect(() => {
    _setChatPinTimestamps(updateChatPinTimestamps(props.chats));
  }, [props.chats]);

  const handleChatItemClick = (chatId: number, pinned: boolean) => {
    if (pinMode) {
      const copyChatPinTimestamps = new Map(chatPinTimestamps);
      copyChatPinTimestamps.set(chatId, pinned ? 0 : Date.now());
      _setChatPinTimestamps(copyChatPinTimestamps);
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
          props.updateChats((chatId: number) => {
            return {
              pin_timestamp: chatPinTimestamps.get(chatId) ?? 0,
            };
          });
        }}
        handlePinModeCloseClick={() => {
          setPinMode(false);
          _setChatPinTimestamps(updateChatPinTimestamps(props.chats));
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
          chatPinTimestamps={chatPinTimestamps}
          pageId={props.pageId}
          handleChatItemClick={handleChatItemClick}
          pinMode={pinMode}
        />
      </Box>
      <HomeDrawerContentFooter
        pinMode={pinMode}
        handleSettingsClick={props.handleSettingsClick}
      />
    </Box>
  );
}
