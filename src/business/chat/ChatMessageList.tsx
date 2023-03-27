import {Box, List} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {ConversationEntity, ConversationEntityType} from "./ChatPage";
import {ChatCompletionRequestMessageRoleEnum} from "openai";

interface MessageListProps {
  conversationEntities: ConversationEntity[];
}

export default function ChatMessageList(props: MessageListProps) {
  const { conversationEntities } = props
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
                isLoading={false}
              />
              <ChatMessageItem
                role={ChatCompletionRequestMessageRoleEnum.Assistant}
                message={conversationEntity.assistantMessage}
                context={conversationEntity.type !== ConversationEntityType.DEFAULT}
                isLoading={conversationEntity.type === ConversationEntityType.REQUESTING}
              />
            </Box>
          ))
      }
    </List>
  )
}
