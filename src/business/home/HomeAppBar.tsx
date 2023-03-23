import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {EditRounded, MenuRounded} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {AppData} from "../../data/data";

interface HomeAppBarProps {
  appData: AppData,
  selectedChatId: string,
  handleClickOpen: () => void,
  setMobileOpen: (mobileOpen: boolean) => void,
}

export default function HomeAppBar(props: HomeAppBarProps) {
  const { appData, selectedChatId, handleClickOpen, setMobileOpen } = props

  const isPageWide = useMediaQuery('(min-width:900px)')

  const handleDrawerOpen = () => {
    setMobileOpen(true);
  };

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
                  {selectedChatId !== '' ? appData.chats.find((chat) => chat.id === selectedChatId)!!.title : 'New chat'}
                </Typography>
                <Box
                  sx={{
                    height: '56px',
                    flexGrow: 1,
                  }}
                />
                <IconButton
                  edge="end"
                  onClick={selectedChatId !== '' ? handleClickOpen : undefined}
                  sx={{
                    display: selectedChatId !== '' ? 'inherit' : 'none',
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
