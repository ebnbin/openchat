import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {EditRounded, MenuRounded} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../util/data";

interface HomeAppBarProps {
  chats: Chat[],
  selectedChatId: number,
  handleChatSettingsDialogOpen: () => void,
  setMobileOpen: (mobileOpen: boolean) => void,
}

export default function HomeAppBar(props: HomeAppBarProps) {
  const { chats, selectedChatId, handleChatSettingsDialogOpen, setMobileOpen } = props

  const isPageWide = useMediaQuery('(min-width:900px)')

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

  const title = () => {
    if (selectedChatId === 0) {
      return 'OpenChat'
    }
    if (selectedChatId === -1) {
      return 'Image'
    }
    const chat = chats.find((chat) => chat.id === selectedChatId)!!
    if (chat.title === '') {
      return 'New chat'
    }
    return chat.title
  }

  return (
    <>
      {
        !isPageWide && (
          <Box
            sx={{
              height: '56px',
              flexShrink: 0,
            }}
          >
            <AppBar
              color={'default'}
            >
              <Toolbar
                variant={'dense'}
                sx={{
                  alignItems: 'center'
                }}
              >
                <IconButton
                  edge="start"
                  onClick={handleDrawerOpen}
                  sx={{ mr: 2 }}
                >
                  <MenuRounded/>
                </IconButton>
                <Typography variant="h6" noWrap component="div">
                  {title()}
                </Typography>
                <Box
                  sx={{
                    height: '56px',
                    flexGrow: 1,
                  }}
                />
                <IconButton
                  edge="end"
                  onClick={(selectedChatId !== 0 && selectedChatId !== -1) ? handleChatSettingsDialogOpen : undefined}
                  sx={{
                    display: (selectedChatId !== 0 && selectedChatId !== -1) ? 'inherit' : 'none',
                  }}
                >
                  <EditRounded />
                </IconButton>
              </Toolbar>
            </AppBar>
          </Box>
        )
      }
    </>
  )
}
