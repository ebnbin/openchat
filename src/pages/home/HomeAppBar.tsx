import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {BookmarksRounded, EditRounded, MenuRounded, SearchRounded} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../utils/types";
import {widePageWidth} from "../../utils/utils";
import {pageSaveList, pageNewChat, pageSearch} from "./HomePage";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChatIcon from "../../components/ChatIcon";

interface HomeAppBarProps {
  chats: Chat[],
  pageId: number,
  handleDrawerClick: () => void,
  handleChatSettingsClick: (pageId: number) => void,
}

export default function HomeAppBar(props: HomeAppBarProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const icon = () => {
    if (props.pageId === pageNewChat) {
      return undefined;
    }
    if (props.pageId === pageSearch) {
      return (
        <ListItemIcon>
          <SearchRounded
            sx={{
              marginLeft: "8px",
            }}
          />
        </ListItemIcon>
      );
    }
    if (props.pageId === pageSaveList) {
      return (
        <ListItemIcon>
          <BookmarksRounded
            sx={{
              marginLeft: "8px",
            }}
          />
        </ListItemIcon>
      );
    }
    const chat = props.chats.find((chat) => chat.id === props.pageId);
    if (chat === undefined) {
      return undefined;
    }
    return (
      <ListItemIcon>
        <ChatIcon
          iconText={chat.icon_text}
          iconTextSize={chat.icon_text_size}
          iconColor={chat.icon_color}
        />
      </ListItemIcon>
    );
  }

  const title = () => {
    if (props.pageId === pageNewChat) {
      return "OpenChat";
    }
    if (props.pageId === pageSearch) {
      return "Search conversations";
    }
    if (props.pageId === pageSaveList) {
      return "Save list";
    }
    const chat = props.chats.find((chat) => chat.id === props.pageId);
    if (chat === undefined) {
      return "OpenChat";
    }
    if (chat.title === "") {
      return "New chat";
    }
    return chat.title;
  }

  return (
    <AppBar
      position={"sticky"}
      color={"default"}
      sx={{
        height: "48px",
      }}
    >
      <Toolbar
        variant={"dense"}
      >
        {icon()}
        <Typography
          variant={"h6"}
          noWrap={true}
        >
          {title()}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
          }}
        />
        <IconButton
          edge={isWidePage ? "end" : undefined}
          color={"inherit"}
          onClick={() => props.handleChatSettingsClick(props.pageId)}
          sx={{
            display: props.pageId === pageSaveList || props.pageId === pageSearch ? "none" : undefined,
          }}
        >
          <EditRounded/>
        </IconButton>
        <IconButton
          edge={"end"}
          color={"inherit"}
          onClick={props.handleDrawerClick}
          sx={{
            display: isWidePage ? "none" : undefined,
          }}
        >
          <MenuRounded/>
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
