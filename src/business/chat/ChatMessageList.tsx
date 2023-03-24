import {CircularProgress, List, ListItem} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {MessageWrapper} from "./ChatPage";

interface MessageListProps {
  messageWrappers: MessageWrapper[]
  requestingMessageWrapper: MessageWrapper | null
  isLoading: boolean
}

export default function ChatMessageList(props: MessageListProps) {
  const { messageWrappers, requestingMessageWrapper, isLoading } = props

  const validMessageWrappers = requestingMessageWrapper
    ? [...messageWrappers, requestingMessageWrapper]
    : messageWrappers
  return (
    <List>
      {
        validMessageWrappers
          .filter((messageWrapper) => messageWrapper.message.role !== ChatCompletionRequestMessageRoleEnum.System)
          .map((messageWrapper) => (
              <ChatMessageItem
                key={messageWrapper.id}
                messageWrapper={messageWrapper}
              />
            )
          )
      }
      { isLoading ? (
        <ListItem
          sx={{
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </ListItem>
      ) : undefined }
    </List>
  )
}
