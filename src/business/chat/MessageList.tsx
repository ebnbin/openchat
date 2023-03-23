import {CircularProgress, List, ListItem} from "@mui/material";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import MessageItem from "./MessageItem";
import React from "react";
import {MessageWrapper} from "./ChatPage";

interface MessageListProps {
  messageWrappers: MessageWrapper[]
  requestingMessage?: MessageWrapper
  isLoading: boolean
}

export default function MessageList(props: MessageListProps) {
  const { messageWrappers, requestingMessage, isLoading } = props

  const validMessageWrappers = requestingMessage ? [...messageWrappers, requestingMessage] : messageWrappers
  return (
    <List>
      {
        validMessageWrappers
          .filter((messageWrapper) => messageWrapper.message.role !== ChatCompletionRequestMessageRoleEnum.System)
          .map((messageWrapper) => (
              <MessageItem
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
