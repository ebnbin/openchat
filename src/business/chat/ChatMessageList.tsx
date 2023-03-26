import {CircularProgress, List, ListItem} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {MessageWrapper} from "./ChatPage";

interface MessageListProps {
  messageWrappers: MessageWrapper[]
  isLoading: boolean
}

export default function ChatMessageList(props: MessageListProps) {
  const { messageWrappers, isLoading } = props

  return (
    <List>
      {
        messageWrappers
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
