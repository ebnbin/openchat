import Drawer from "@mui/material/Drawer";
import HomeDrawerContent from "./HomeDrawerContent";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../util/data";
import {widePageWidth} from "../../util/util";

const drawerWidth = 300;

interface HomeDrawerProps {
  chats: Chat[],
  selectedChatId: number,
  setSelectedChatId: (selectedChatId: number) => void,
  handleChatSettingsDialogOpen: () => void,
  setSettingsOpen: (settingsOpen: boolean) => void,
  mobileOpen: boolean,
  setMobileOpen: (mobileOpen: boolean) => void,
  handleNewChatClick: () => void,
  handleImageClick: () => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const { chats, selectedChatId, setSelectedChatId, handleChatSettingsDialogOpen, setSettingsOpen,
    mobileOpen, setMobileOpen, handleNewChatClick, handleImageClick } = props

  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const handleClickSettingsOpen = () => {
    setSettingsOpen(true);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  const handleItemClick = (chatId: number) => {
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
              selectedChatId={selectedChatId}
              handleChatSettingsDialogOpen={handleChatSettingsDialogOpen}
              handleItemClick={handleItemClick}
              handleClickSettingsOpen={handleClickSettingsOpen}
              handleNewChatClick={handleNewChatClick}
              handleImageClick={handleImageClick}
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
              selectedChatId={selectedChatId}
              handleChatSettingsDialogOpen={handleChatSettingsDialogOpen}
              handleItemClick={handleItemClick}
              handleClickSettingsOpen={handleClickSettingsOpen}
              handleNewChatClick={handleNewChatClick}
              handleImageClick={handleImageClick}
            />
          </Drawer>
        )
      }
    </>
  )
}
