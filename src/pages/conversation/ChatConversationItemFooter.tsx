import {Box, Button, Typography, useMediaQuery, useTheme} from "@mui/material";
import {dateTimeString, maxContentWidth, narrowPageWidth} from "../../utils/utils";
import {BookmarkAddedRounded, BookmarkBorderRounded, DeleteRounded} from "@mui/icons-material";
import React from "react";
import {ConversationEntity} from "../chat/ConversationItem";

interface ChatConversationItemFooterProps {
  conversationEntity: ConversationEntity;
  handleSaveClick: () => void;
  handleDeleteClick: () => void;
}

export default function ChatConversationItemFooter(props: ChatConversationItemFooterProps) {
  const theme = useTheme();

  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  return (
    <Box
      sx={{
        bgcolor: theme.palette.action.hover,
      }}
    >
      <Box
        sx={{
          height: "44px",
          maxWidth: maxContentWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          paddingX: isNarrowPage ? "16px" : "32px",
          paddingBottom: "12px",
          alignItems: "center",
        }}
      >
        <Typography
          variant={"caption"}
          color={theme.palette.text.disabled}
        >
          {dateTimeString(props.conversationEntity.conversation.id)}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
          }}
        />
        <Button
          variant={"text"}
          size={"small"}
          color={"info"}
          startIcon={props.conversationEntity.conversation.save_timestamp === 0 ? <BookmarkBorderRounded/> : <BookmarkAddedRounded/>}
          onClick={props.handleSaveClick}
          sx={{
            textTransform: "none",
            display: props.conversationEntity.isRequesting ? "none" : undefined,
          }}
        >
          {props.conversationEntity.conversation.save_timestamp === 0 ? "Save" : "Saved"}
        </Button>
        <Button
          variant={"text"}
          size={"small"}
          color={"error"}
          startIcon={<DeleteRounded/>}
          onClick={props.handleDeleteClick}
          sx={{
            textTransform: "none",
            display: props.conversationEntity.isRequesting ? "none" : undefined,
          }}
        >
          {"Delete"}
        </Button>
      </Box>
    </Box>
  );
}
