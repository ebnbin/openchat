import {Avatar, Button, Chip, CircularProgress, Typography, useMediaQuery, useTheme} from "@mui/material";
import {
  ContentCopyRounded,
  FaceRounded
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React, {RefObject, useState} from "react";
import {contentWidth} from "../chat/ChatPage";
import ChatMarkdownMessage from "../../components/Markdown";
import {copy} from "../../utils/utils";
import chatGPTLogo from "../../assets/chatgpt_logo.png";
import {ConversationEntity} from "../chat/ConversationList";

interface ConversationMessageItemProps {
  conversationEntity: ConversationEntity,
  isUser: boolean,
  controller?: RefObject<AbortController | null>;
}

export default function ConversationMessageItem(props: ConversationMessageItemProps) {
  const { conversationEntity, isUser } = props;

  const [markdown, setMarkdown] = useState(true);

  const message = isUser ? conversationEntity.conversation.user_message : conversationEntity.conversation.assistant_message;
  const finishReason = isUser ? "stop" : conversationEntity.conversation.finish_reason;
  const context = props.conversationEntity.context
  const isLoading = !isUser && conversationEntity.isRequesting;

  const theme = useTheme();

  const handleCopyClick = (text: string) => {
    copy(text);
  }

  const isNotSmallPage = useMediaQuery(`(min-width:600px)`)

  const finishReasonChips = () => {
    if (finishReason === "stop") {
      return undefined
    }
    if (finishReason === "length") {
      return (
        <Chip
          label={"Incomplete model output due to max_tokens parameter or token limit"}
        />
      )
    }
    if (finishReason === "content_filter") {
      return (
        <Chip
          label={"Omitted content due to a flag from our content filters"}
        />
      )
    }
    if (finishReason === "") {
      return (
        <Chip
          label={"API response still in progress or incomplete"}
        />
      )
    }
    return (
      <Chip
        label={"Request abort or error"}
      />
    )
  }

  return (
    <Box
      sx={{
        bgcolor: isUser ? undefined : theme.palette.action.hover,
      }}
    >
      <Box
        sx={{
          maxWidth: contentWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          paddingX: isNotSmallPage ? "32px" : "16px",
        }}
      >
        <Box
          sx={{
            height: "44px",
            display: "flex",
            flexDirection: "row",
            placeItems: "center",
            paddingTop: "12px",
          }}
        >
          <Avatar
            variant={isUser ? "circular" : "rounded"}
            onClick={isLoading ? undefined : () => setMarkdown(!markdown)}
            sx={{
              width: "24px",
              height: "24px",
              marginRight: "8px",
              bgcolor: context ? (isUser ? theme.palette.primary.main : "#74aa9c") : theme.palette.action.disabled,
            }}
          >
            {isUser ? <FaceRounded/> : (
              <img
                src={chatGPTLogo}
                width={"24px"}
                height={"24px"}
              />
            )}
          </Avatar>
          <Typography
            variant={"caption"}
            color={context ? theme.palette.text.primary : theme.palette.text.disabled}
            sx={{
              fontWeight: "bold",
            }}
          >
            {isUser ? "You" : "ChatGPT"}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
            }}
          />
          {isLoading || message === "" ? undefined : (
            <Button
              variant={"text"}
              size={"small"}
              color={"info"}
              startIcon={<ContentCopyRounded />}
              onClick={() => handleCopyClick(message)}
              sx={{
                textTransform: "none",
              }}
            >
              {"Copy"}
            </Button>
          )}
        </Box>
        <Box>
          {isLoading ? (
            <Box
              sx={{
                height: "56px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <CircularProgress
                size={"32px"}
              />
              <Button
                variant={"text"}
                color={"error"}
                sx={{
                  marginLeft: "8px",
                }}
                onClick={() => {
                  props.controller?.current?.abort()
                }}
              >
                {"Cancel request"}
              </Button>
            </Box>
          ) : (
            markdown ? (
              <ChatMarkdownMessage
                content={message}
              />
            ) : (
              <Typography
                sx={{
                  paddingY: "16px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message}
              </Typography>
            )
          )}
        </Box>
        <Box>
          {isLoading ? undefined : finishReasonChips()}
        </Box>
      </Box>
    </Box>
  );
}
