import Drawer from "@mui/material/Drawer";
import * as React from "react";
import {Chat} from "../../utils/types";
import HomeDrawerContent from "./HomeDrawerContent";
import {useMediaQuery} from "@mui/material";
import {widePageWidth} from "../../utils/utils";

const drawerWidth = 300;

interface HomeDrawerProps {
  chats: Chat[],
  pageId: number,
  drawerOpen: boolean,
  handleDrawerClose: () => void,
  handleChatItemClick: (chatId: number) => void,
  handleNewChatClick: () => void,
  handleSaveListClick: () => void,
  handleSettingsClick: () => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  return isWidePage ? (
    <Drawer
      variant={"permanent"}
      anchor={"right"}
      open={true}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth },
      }}
    >
      <HomeDrawerContent
        chats={props.chats}
        pageId={props.pageId}
        handleChatItemClick={props.handleChatItemClick}
        handleNewChatClick={props.handleNewChatClick}
        handleSaveListClick={props.handleSaveListClick}
        handleSettingsClick={props.handleSettingsClick}
      />
    </Drawer>
  ) : (
    <Drawer
      variant={"temporary"}
      anchor={"right"}
      open={props.drawerOpen}
      onClose={props.handleDrawerClose}
      ModalProps={{
        keepMounted: false,
      }}
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth },
      }}
    >
      <HomeDrawerContent
        chats={props.chats}
        pageId={props.pageId}
        handleChatItemClick={props.handleChatItemClick}
        handleNewChatClick={props.handleNewChatClick}
        handleSaveListClick={props.handleSaveListClick}
        handleSettingsClick={props.handleSettingsClick}
      />
    </Drawer>
  );
}
