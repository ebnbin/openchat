import Drawer from "@mui/material/Drawer";
import * as React from "react";
import {Chat} from "../../utils/types";
import HomeDrawerContent2 from "./HomeDrawerContent2";
import {Card, useMediaQuery} from "@mui/material";
import {widePageWidth} from "../../utils/utils";

export const drawerWidth = 300;

interface HomeDrawerProps {
  chats: Chat[],
  selectedChatId: number,
  setSelectedChatId: (selectedChatId: number) => void,
  handleChatSettingsDialogOpen: () => void,
  setSettingsOpen: (settingsOpen: boolean) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
  mobileOpen: boolean,
  setMobileOpen: (mobileOpen: boolean) => void,
}

export default function HomeDrawer(props: HomeDrawerProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const handleDrawerClose = () => {
    props.setMobileOpen(false);
  };

  const handleItemClick = (chatId: number) => {
    props.setSelectedChatId(chatId)
    props.setMobileOpen(false)
  }

  return (
    <>
      {
        !isWidePage && (
          <Drawer
            variant={"temporary"}
            open={props.mobileOpen}
            onClose={handleDrawerClose}
            anchor={"right"}
            ModalProps={{
              keepMounted: false, // Better open performance on mobile.
            }}
            sx={{
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
          >
            <HomeDrawerContent2
              chats={props.chats}
              handleClose={() => {}}
              selectedContentId={props.selectedChatId}
              setSelectedContentId={handleItemClick}
              handleNewChatClick={props.handleNewChatClick}
              handleLikesClick={props.handleLikesClick}
              handleSettingsDialogOpen={() => props.setSettingsOpen(true)}
              isPopover={false}
            />
          </Drawer>
        )
      }
      {
        isWidePage && (
          <Drawer
            anchor={"right"}
            variant={"permanent"}
            open={true}
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
            }}
          >
            <Card
              elevation={1}
              sx={{
                width: "100%",
                height: "100%",
                borderRadius: "0px",
              }}
            >
              <HomeDrawerContent2
                chats={props.chats}
                handleClose={() => {}}
                selectedContentId={props.selectedChatId}
                setSelectedContentId={handleItemClick}
                handleNewChatClick={props.handleNewChatClick}
                handleLikesClick={props.handleLikesClick}
                handleSettingsDialogOpen={() => props.setSettingsOpen(true)}
                isPopover={false}
              />
            </Card>
          </Drawer>
        )
      }
    </>
  )
}
