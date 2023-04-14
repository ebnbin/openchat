import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import {AppsRounded, EditRounded, FavoriteRounded, MenuRounded} from "@mui/icons-material";
import Typography from "@mui/material/Typography";
import * as React from "react";
import {useMediaQuery} from "@mui/material";
import {Chat} from "../../util/data";
import {widePageWidth} from "../../util/util";
import {contentLikes, contentNewChat} from "./HomePage";
import ListItemIcon from "@mui/material/ListItemIcon";
import ChatIcon from "../../component/ChatIcon";
import {useState} from "react";
import HomeGridCard from "./HomeGridCard";

interface HomeAppBarProps {
  chats: Chat[],
  contentId: number,
  handleChatSettingsDialogOpen: () => void,
  setDrawerOpen: (drawerOpen: boolean) => void,
  selectedContentId: number,
  setSelectedContentId: (selectedContentId: number) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
  handleSettingsDialogOpen: () => void,
}

export default function HomeAppBar(props: HomeAppBarProps) {
  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  const icon = () => {
    if (props.contentId === contentNewChat) {
      return undefined;
    }
    if (props.contentId === contentLikes) {
      return (
        <ListItemIcon>
          <FavoriteRounded
            sx={{
              marginLeft: '8px',
            }}
          />
        </ListItemIcon>
      );
    }
    const chat = props.chats.find((chat) => chat.id === props.contentId)!!;
    return (
      <ListItemIcon>
        <ChatIcon
          iconText={chat.icon_text}
          iconTextSize={chat.icon_text_size}
          iconColor={chat.icon_color}
        />
      </ListItemIcon>
    )
  }

  const title = () => {
    if (props.contentId === contentNewChat) {
      return 'OpenChat';
    }
    if (props.contentId === contentLikes) {
      return 'Likes';
    }
    const chat = props.chats.find((chat) => chat.id === props.contentId)!!;
    if (chat.title === '') {
      return 'New chat';
    }
    return chat.title;
  }

  const chatSettingsVisibility = () => {
    if (props.contentId === contentLikes) {
      return 'hidden';
    }
    return undefined;
  }

  const handleChatSettingsOnClick = () => {
    if (props.contentId === contentNewChat || props.contentId === contentLikes) {
      return undefined;
    }
    return props.handleChatSettingsDialogOpen();
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
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
          {icon()}
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
            color={'inherit'}
            onClick={props.selectedContentId === contentNewChat ? props.handleNewChatSettingsDialogOpen : handleChatSettingsOnClick}
            sx={{
              visibility: chatSettingsVisibility(),
            }}
          >
            <EditRounded/>
          </IconButton>
          <IconButton
            color={'inherit'}
            onClick={() => props.setDrawerOpen(true)}
          >
            <MenuRounded/>
          </IconButton>
          <IconButton
            edge={'end'}
            color={'inherit'}
            onClick={handleClick}
          >
            <AppsRounded/>
          </IconButton>
        </Toolbar>
      </AppBar>
      <HomeGridCard
        chats={props.chats}
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        selectedContentId={props.selectedContentId}
        setSelectedContentId={props.setSelectedContentId}
        handleNewChatClick={props.handleNewChatClick}
        handleLikesClick={props.handleLikesClick}
        handleNewChatSettingsDialogOpen={props.handleNewChatSettingsDialogOpen}
        handleSettingsDialogOpen={props.handleSettingsDialogOpen}
      />
    </Box>
  );
}
