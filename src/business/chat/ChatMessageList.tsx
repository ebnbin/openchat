import {Box, CircularProgress, List, ListItem} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {ConversationEntity, ConversationEntityType} from "./ChatPage";
import {ChatCompletionRequestMessageRoleEnum} from "openai";

interface MessageListProps {
  conversationEntities: ConversationEntity[];
}

export default function ChatMessageList(props: MessageListProps) {
  const { conversationEntities } = props

  const isLoading = conversationEntities.length > 0 &&
    conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.REQUESTING
  return (
    <List>
      {
        conversationEntities
          .map((conversationEntity) => (
            <Box
              key={conversationEntity.id}
            >
              <ChatMessageItem
                role={ChatCompletionRequestMessageRoleEnum.User}
                message={conversationEntity.userMessage}
                context={conversationEntity.type !== ConversationEntityType.DEFAULT}
              />
              <ChatMessageItem
                role={ChatCompletionRequestMessageRoleEnum.Assistant}
                message={conversationEntity.assistantMessage}
                context={conversationEntity.type !== ConversationEntityType.DEFAULT}
              />
            </Box>
          ))
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
