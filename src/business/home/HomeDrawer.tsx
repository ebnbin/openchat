import Drawer from "@mui/material/Drawer";
import * as React from "react";
import {Chat, Settings} from "../../util/data";
import HomeDrawerContent2 from "./HomeDrawerContent2";

export const drawerWidth = 301;

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
  updateChatPinTimestamps: (pinTimestamps: Record<number, number>) => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
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
      <HomeDrawerContent2
        chats={props.chats}
        handleClose={() => {}}
        selectedContentId={props.selectedChatId}
        setSelectedContentId={props.setSelectedChatId}
        handleNewChatClick={props.handleNewChatClick}
        handleLikesClick={props.handleLikesClick}
        handleNewChatSettingsDialogOpen={props.handleNewChatSettingsDialogOpen}
        handleSettingsDialogOpen={() => props.setSettingsOpen(true)}
        updateChatPinTimestamps={props.updateChatPinTimestamps}
        isPopover={false}
      />
    </Drawer>
  )
}
