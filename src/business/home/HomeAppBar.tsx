import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {EditRounded, MenuRounded} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../util/data";
import {widePageWidth} from "../../util/util";
import {contentNewChat} from "./HomePage";

interface HomeAppBarProps {
  chats: Chat[],
  contentId: string,
  handleChatSettingsDialogOpen: () => void,
  setDrawerOpen: (drawerOpen: boolean) => void,
}

export default function HomeAppBar(props: HomeAppBarProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const title = () => {
    if (props.contentId === contentNewChat) {
      return 'OpenChat';
    }
    const chat = props.chats.find((chat) => chat.id === props.contentId)!!;
    if (chat.title === '') {
      return 'New chat';
    }
    return chat.title;
  }

  const chatSettingsVisibility = () => {
    if (props.contentId === contentNewChat) {
      return 'hidden';
    }
    return undefined;
  }

  const handleChatSettingsOnClick = () => {
    if (props.contentId === contentNewChat) {
      return undefined;
    }
    return props.handleChatSettingsDialogOpen();
  }

  return isWidePage ? null : (
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
        >
          <IconButton
            edge={'start'}
            color={'inherit'}
            onClick={() => props.setDrawerOpen(true)}
            sx={{
              marginRight: '8px',
            }}
          >
            <MenuRounded/>
          </IconButton>
          <Typography
            variant={'h6'}
            noWrap={true}
          >
            {title()}
          </Typography>
          <Box
            sx={{
              height: '56px',
              flexGrow: 1,
            }}
          />
          <IconButton
            edge={'end'}
            color={'inherit'}
            onClick={handleChatSettingsOnClick}
            sx={{
              visibility: chatSettingsVisibility(),
            }}
          >
            <EditRounded/>
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
