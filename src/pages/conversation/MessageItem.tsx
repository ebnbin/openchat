import {Button, CircularProgress, Typography, useMediaQuery, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import React, {useState} from "react";
import ChatMarkdownMessage from "../../components/Markdown";
import {maxContentWidth, narrowPageWidth} from "../../utils/utils";
import {ConversationEntity} from "../chat/ConversationItem";
import FinishReasonChip from "../../components/FinishReasonChip";
import MessageItemHeader from "./MessageItemHeader";

interface MessageItemProps {
  conversationEntity: ConversationEntity,
  isUser: boolean,
  abortController?: React.RefObject<AbortController | null>,
}

export default function MessageItem(props: MessageItemProps) {
  const theme = useTheme();

  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const [markdown, setMarkdown] = useState(true);

  const message = props.isUser ? props.conversationEntity.conversation.user_message : props.conversationEntity.conversation.assistant_message;
  const finishReason = props.isUser ? "stop" : props.conversationEntity.conversation.finish_reason;
  const context = props.conversationEntity.context
  const isRequesting = !props.isUser && props.conversationEntity.isRequesting;

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
        <MessageItemHeader
          isUser={props.isUser}
          message={message}
          context={context}
          isRequesting={isRequesting}
          markdown={markdown}
          setMarkdown={setMarkdown}
        />
        {isRequesting ? (
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
              variant={"outlined"}
              color={"info"}
              size={"small"}
              onClick={() => {
                props.abortController?.current?.abort();
              }}
              sx={{
                marginLeft: "16px",
                textTransform: "none",
              }}
            >
              {"Stop generating"}
            </Button>
          </Box>
        ) : (
          markdown ? (
            <ChatMarkdownMessage
              content={message}
            />
          ) : (
            <Box
              sx={{
                minHeight: "56px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  paddingY: "16px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message}
              </Typography>
            </Box>
          )
        )}
        <Box>
          {isRequesting ? undefined : (
            <FinishReasonChip
              finishReason={finishReason}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
