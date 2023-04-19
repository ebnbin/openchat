import {Chat} from "../../utils/types";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ChatIcon from "../../components/ChatIcon";
import {Divider, Typography, useTheme} from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import React from "react";
import {chunk} from "../../utils/utils";

interface ChatItemProps {
  chat: Chat,
  selected: boolean,
  handleChatItemClick: (chatId: number, pinned: boolean) => void,
  pinMode: boolean,
}

function ChatGridItem(props: ChatItemProps) {
  const theme = useTheme();

  return (
    <ListItemButton
      key={props.chat.id}
      onClick={() => props.handleChatItemClick(props.chat.id, true)}
      selected={props.selected}
      sx={{
        color: props.pinMode ? theme.palette.text.disabled : undefined,
        display: "flex",
        flexDirection: "column",
        height: "100px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ChatIcon
        iconText={props.chat.icon_text}
        iconTextSize={props.chat.icon_text_size}
        iconColor={props.chat.icon_color}
      />
      <Box
        sx={{
          width: "80px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "4px",
        }}
      >
        <Typography
          variant={"caption"}
          align={"center"}
          sx={{
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 2,
            lineHeight: 1.2,
            fontWeight: props.selected ? "bold" : "normal",
          }}
        >
          {props.chat.title === "" ? "New chat" : props.chat.title}
        </Typography>
      </Box>
    </ListItemButton>
  );
}

function ChatListItem(props: ChatItemProps) {
  const theme = useTheme();

  return (
    <ListItemButton
      key={props.chat.id}
      onClick={() => props.handleChatItemClick(props.chat.id, false)}
      selected={props.selected}
      sx={{
        color: props.pinMode ? theme.palette.text.disabled : undefined,
      }}
    >
      <ListItemIcon>
        <ChatIcon
          iconText={props.chat.icon_text}
          iconTextSize={props.chat.icon_text_size}
          iconColor={props.chat.icon_color}
        />
      </ListItemIcon>
      <ListItemText
        primary={props.chat.title === "" ? "New chat" : props.chat.title}
        primaryTypographyProps={{
          noWrap: true,
          fontWeight: props.selected ? "bold" : undefined,
        }}
      />
    </ListItemButton>
  );
}

//*********************************************************************************************************************

interface HomeDrawerContentChatListProps {
  chats: Chat[],
  pinChats: number[],
  pageId: number,
  handleChatItemClick: (chatId: number, pinned: boolean) => void,
  pinMode: boolean,
}

export default function HomeDrawerContentChatList(props: HomeDrawerContentChatListProps) {
  const pinnedChats = chunk(
    [...props.pinChats]
      .map((chatId) => props.chats.find((chat) => chat.id === chatId))
      .filter((chat) => chat !== undefined) as Chat[],
    3,
  );
  const unpinnedChats = [...props.chats]
    .filter((chat) => !props.pinChats.includes(chat.id))
    .sort((a, b) => b.update_timestamp - a.update_timestamp);

  return (
    <List
      sx={{
        padding: "0px",
      }}
    >
      {pinnedChats.map((row, rowIndex) => (
        <Box
          key={`${rowIndex}`}
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          {(row.length === 3 ? row : [...row, ...Array(3 - row.length).fill("")]).map((chat, index) => (
            <Box
              key={chat === "" ? `${rowIndex}-${index}` : chat.id}
              sx={{
                flexGrow: 1,
                width: "0px",
              }}
            >
              {chat === "" ? undefined : (
                <ChatGridItem
                  chat={chat}
                  selected={chat.id === props.pageId}
                  handleChatItemClick={props.handleChatItemClick}
                  pinMode={props.pinMode}
                />
              )}
            </Box>
          ))}
        </Box>
      ))}
      <Divider
        key={"divider"}
        sx={{
          display: pinnedChats.length !== 0 && unpinnedChats.length !== 0 ? undefined : "none",
        }}
      />
      {unpinnedChats.map((chat: Chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          selected={chat.id === props.pageId}
          handleChatItemClick={props.handleChatItemClick}
          pinMode={props.pinMode}
        />
      ))}
    </List>
  );
}
