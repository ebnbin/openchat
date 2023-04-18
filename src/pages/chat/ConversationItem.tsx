import MessageItem from "../conversation/MessageItem";
import {Box, Button, Card, Typography, useMediaQuery, useTheme} from "@mui/material";
import {
  BookmarkAddedRounded,
  BookmarkBorderRounded,
  DeleteRounded
} from "@mui/icons-material";
import React, {RefObject} from "react";
import {Conversation} from "../../utils/types";
import {maxContentWidth, narrowPageWidth} from "../../utils/utils";

export interface ConversationEntity {
  conversation: Conversation,
  context: boolean,
  isRequesting: boolean,
}

interface ConversationItemProps {
  conversationEntity: ConversationEntity;
  updateConversationEntityLike: (conversationEntity: ConversationEntity) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
  controller: RefObject<AbortController | null>;
}

export default function ConversationItem(props: ConversationItemProps) {
  const theme = useTheme();

  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const handleLikeClick = () => {
    props.updateConversationEntityLike({
      ...props.conversationEntity,
      conversation: {
        ...props.conversationEntity.conversation,
        save_timestamp: props.conversationEntity.conversation.save_timestamp === 0 ? Date.now() : 0,
      } as Conversation,
    });
  }

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "0px",
        marginBottom: "1px",
      }}
    >
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={true}
      />
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={false}
        controller={props.conversationEntity.isRequesting ? props.controller : undefined}
      />
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
            {`${new Date(props.conversationEntity.conversation.id).toLocaleString()}`}
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
            startIcon={props.conversationEntity.conversation.save_timestamp === 0 ? <BookmarkBorderRounded /> : <BookmarkAddedRounded />}
            onClick={handleLikeClick}
            sx={{
              textTransform: "none",
              visibility: !props.conversationEntity.isRequesting ? "visible" : "hidden",
            }}
          >
            {props.conversationEntity.conversation.save_timestamp === 0 ? "Save" : "Saved"}
          </Button>
          <Button
            variant={"text"}
            size={"small"}
            color={"error"}
            startIcon={<DeleteRounded />}
            onClick={() => props.deleteConversationEntity(props.conversationEntity)}
            sx={{
              textTransform: "none",
              visibility: !props.conversationEntity.isRequesting ? "visible" : "hidden",
            }}
          >
            {"Delete"}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
