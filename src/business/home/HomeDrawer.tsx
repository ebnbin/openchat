import Drawer from "@mui/material/Drawer";
import HomeDrawerContent from "./HomeDrawerContent";
import * as React from "react";
import {Chat, Settings} from "../../util/data";

const drawerWidth = 300;

interface HomeDrawerProps {
  settings: Settings,
  chats: Chat[],
  selectedChatId: number,
  setSelectedChatId: (selectedChatId: number) => void,
  handleChatSettingsDialogOpen: () => void,
  setSettingsOpen: (settingsOpen: boolean) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const { chats, selectedChatId, setSelectedChatId, handleChatSettingsDialogOpen, setSettingsOpen,
    handleNewChatClick
  } = props

  const handleClickSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleItemClick = (chatId: number) => {
    setSelectedChatId(chatId)
  }

  return (
    <Drawer
      variant={'permanent'}
      open={true}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
      }}
    >
      <HomeDrawerContent
        settings={props.settings}
        chats={chats}
        selectedContentId={selectedChatId}
        handleChatSettingsDialogOpen={handleChatSettingsDialogOpen}
        handleChatItemClick={handleItemClick}
        handleSettingsDialogOpen={handleClickSettingsOpen}
        handleNewChatClick={handleNewChatClick}
        handleLikesClick={props.handleLikesClick}
        handleNewChatSettingsDialogOpen={props.handleNewChatSettingsDialogOpen}
      />
    </Drawer>
  )
}
