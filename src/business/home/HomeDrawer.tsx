import Drawer from "@mui/material/Drawer";
import HomeDrawerContent from "./HomeDrawerContent";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../util/data";
import {widePageWidth} from "../../util/util";

const drawerWidth = 300;

interface HomeDrawerProps {
  chats: Chat[],
  selectedChatId: string,
  setSelectedChatId: (selectedChatId: string) => void,
  handleChatSettingsDialogOpen: () => void,
  setSettingsOpen: (settingsOpen: boolean) => void,
  mobileOpen: boolean,
  setMobileOpen: (mobileOpen: boolean) => void,
  handleNewChatClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const { chats, selectedChatId, setSelectedChatId, handleChatSettingsDialogOpen, setSettingsOpen,
    mobileOpen, setMobileOpen, handleNewChatClick
  } = props

  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const handleClickSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleItemClick = (chatId: string) => {
    setSelectedChatId(chatId)
    setMobileOpen(false)
  }

  return (
    <>
      {
        !isWidePage && (
          <Drawer
            variant={'temporary'}
            open={mobileOpen}
            onClose={handleDrawerClose}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            <HomeDrawerContent
              chats={chats}
              selectedContentId={selectedChatId}
              handleChatSettingsDialogOpen={handleChatSettingsDialogOpen}
              handleChatItemClick={handleItemClick}
              handleSettingsDialogOpen={handleClickSettingsOpen}
              handleNewChatClick={handleNewChatClick}
              handleNewChatSettingsDialogOpen={props.handleNewChatSettingsDialogOpen}
            />
          </Drawer>
        )
      }
      {
        isWidePage && (
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
              chats={chats}
              selectedContentId={selectedChatId}
              handleChatSettingsDialogOpen={handleChatSettingsDialogOpen}
              handleChatItemClick={handleItemClick}
              handleSettingsDialogOpen={handleClickSettingsOpen}
              handleNewChatClick={handleNewChatClick}
              handleNewChatSettingsDialogOpen={props.handleNewChatSettingsDialogOpen}
            />
          </Drawer>
        )
      }
    </>
  )
}
