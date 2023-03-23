import Drawer from "@mui/material/Drawer";
import HomeDrawerContent from "./HomeDrawerContent";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {AppData} from "../../data/data";
import {drawerWidth} from "./HomePage";

interface HomeDrawerProps {
  appData: AppData,
  setAppData: (appData: AppData) => void,
  selectedChatId: string,
  setSelectedChatId: (selectedChatId: string) => void,
  handleClickOpen: () => void,
  setSettingsOpen: (settingsOpen: boolean) => void,
  mobileOpen: boolean,
  setMobileOpen: (mobileOpen: boolean) => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const { appData, setAppData, selectedChatId, setSelectedChatId, handleClickOpen, setSettingsOpen, mobileOpen, setMobileOpen } = props

  const isPageWide = useMediaQuery('(min-width:900px)')

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
        !isPageWide && (
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
              appData={appData}
              setAppData={setAppData}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              handleClickOpen={handleClickOpen}
              handleItemClick={handleItemClick}
              handleClickSettingsOpen={handleClickSettingsOpen}
            />
          </Drawer>
        )
      }
      {
        isPageWide && (
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
              appData={appData}
              setAppData={setAppData}
              selectedChatId={selectedChatId}
              setSelectedChatId={setSelectedChatId}
              handleClickOpen={handleClickOpen}
              handleItemClick={handleItemClick}
              handleClickSettingsOpen={handleClickSettingsOpen}
            />
          </Drawer>
        )
      }
    </>
  )
}