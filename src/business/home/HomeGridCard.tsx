import {Popover, useMediaQuery, useTheme} from "@mui/material";
import React from "react";
import {Chat} from "../../util/data";
import HomeDrawerContent2 from "./HomeDrawerContent2";
import {widePageWidth} from "../../util/util";

interface HomeGridCardProps {
  chats: Chat[];
  anchorEl: HTMLButtonElement | null;
  open: boolean;
  handleClose: () => void;
  selectedContentId: number,
  setSelectedContentId: (selectedContentId: number) => void,
  handleNewChatClick: () => void,
  handleLikesClick: () => void,
  handleNewChatSettingsDialogOpen: () => void,
  handleSettingsDialogOpen: () => void,
  updateChatPinTimestamps: (pinTimestamps: Record<number, number>) => void,
}

export default function HomeGridCard(props: HomeGridCardProps) {
  const theme = useTheme();

  const handlePopoverClose = () => {
    // cancelPinTimestamps();
    props.handleClose();
  }

  const isWidePage = useMediaQuery(`(min-width:${widePageWidth}px)`)

  return (
    <Popover
      open={props.open && !isWidePage}
      anchorEl={props.anchorEl}
      onClose={handlePopoverClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <HomeDrawerContent2
        chats={props.chats}
        handleClose={props.handleClose}
        selectedContentId={props.selectedContentId}
        setSelectedContentId={props.setSelectedContentId}
        handleNewChatClick={props.handleNewChatClick}
        handleLikesClick={props.handleLikesClick}
        handleNewChatSettingsDialogOpen={props.handleSettingsDialogOpen}
        handleSettingsDialogOpen={props.handleSettingsDialogOpen}
        updateChatPinTimestamps={props.updateChatPinTimestamps}
        isPopover={true}
      />
    </Popover>
  );
}
