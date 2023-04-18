import {Avatar, Button, Chip, CircularProgress, Typography, useMediaQuery, useTheme} from "@mui/material";
import {
  ContentCopyRounded,
  FaceRounded
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React, {RefObject, useState} from "react";
import ChatMarkdownMessage from "../../components/Markdown";
import {copy, maxContentWidth, narrowPageWidth} from "../../utils/utils";
import chatGPTLogo from "../../assets/chatgpt_logo.png";
import {ConversationEntity} from "../chat/ConversationItem";

interface MessageItemProps {
  conversationEntity: ConversationEntity,
  isUser: boolean,
  controller?: RefObject<AbortController | null>;
}

export default function MessageItem(props: MessageItemProps) {
  const theme = useTheme();

  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const [markdown, setMarkdown] = useState(true);

  const message = props.isUser ? props.conversationEntity.conversation.user_message : props.conversationEntity.conversation.assistant_message;
  const finishReason = props.isUser ? "stop" : props.conversationEntity.conversation.finish_reason;
  const context = props.conversationEntity.context
  const isLoading = !props.isUser && props.conversationEntity.isRequesting;

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
        bgcolor: props.isUser ? undefined : theme.palette.action.hover,
      }}
    >
      <Box
        sx={{
          maxWidth: maxContentWidth,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          paddingX: isNarrowPage ? "16px" : "32px",
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
            variant={props.isUser ? "circular" : "rounded"}
            onClick={isLoading ? undefined : () => setMarkdown(!markdown)}
            sx={{
              width: "24px",
              height: "24px",
              marginRight: "8px",
              bgcolor: context ? (props.isUser ? theme.palette.primary.main : "#74aa9c") : theme.palette.action.disabled,
            }}
          >
            {props.isUser ? <FaceRounded/> : (
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
            {props.isUser ? "You" : "ChatGPT"}
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
              onClick={() => copy(message)}
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
