import {Box, List} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {ConversationEntity, ConversationEntityType} from "./ChatPage";
import {ChatCompletionRequestMessageRoleEnum} from "openai";

interface MessageListProps {
  conversationEntities: ConversationEntity[];
  setConversationEntities: (conversationEntities: ConversationEntity[]) => void;
}

export default function ChatMessageList(props: MessageListProps) {
  const { conversationEntities, setConversationEntities } = props

  const setRaw = (id: string, isUser: boolean, raw: boolean) => {
    const foundIndex = conversationEntities.findIndex((c) => c.id === id)
    if (foundIndex === -1) {
      return
    }
    const foundConversationEntity = conversationEntities[foundIndex]
    const copyConversationEntity = {
      ...foundConversationEntity,
      userMessageRaw: isUser ? raw : foundConversationEntity.userMessageRaw,
      assistantMessageRaw: isUser ? foundConversationEntity.assistantMessageRaw : raw,
    } as ConversationEntity
    const copyConversationEntities = [
      ...conversationEntities,
    ]
    copyConversationEntities[foundIndex] = copyConversationEntity
    setConversationEntities(copyConversationEntities)
  }

  return (
    <List>
      {
        conversationEntities
          .map((conversationEntity) => (
            <Box
              key={conversationEntity.id}
            >
              <ChatMessageItem
                id={conversationEntity.id}
                role={ChatCompletionRequestMessageRoleEnum.User}
                message={conversationEntity.userMessage}
                context={conversationEntity.type !== ConversationEntityType.DEFAULT}
                isLoading={conversationEntity.type === ConversationEntityType.REQUESTING}
                raw={conversationEntity.userMessageRaw}
                setRaw={setRaw}
              />
              <ChatMessageItem
                id={conversationEntity.id}
                role={ChatCompletionRequestMessageRoleEnum.Assistant}
                message={conversationEntity.assistantMessage}
                context={conversationEntity.type !== ConversationEntityType.DEFAULT}
                isLoading={conversationEntity.type === ConversationEntityType.REQUESTING}
                raw={conversationEntity.assistantMessageRaw}
                setRaw={setRaw}
              />
            </Box>
          ))
      }
    </List>
  )
}
