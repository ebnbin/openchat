import {Box, List} from "@mui/material";
import React, {RefObject} from "react";
import {ConversationEntity} from "./ChatPage";
import ChatConversationItem from "./ChatConversationItem";

interface ChatConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitiesNoStore: (conversationEntities: ConversationEntity[]) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
  bottomRef: RefObject<HTMLDivElement>;
}

export default function ChatConversationList(props: ChatConversationListProps) {
  const { conversationEntities, updateConversationEntitiesNoStore, deleteConversationEntity } = props;

  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    updateConversationEntitiesNoStore(conversationEntities.map((c) =>
      c.id === conversationEntity.id ? conversationEntity : c));
  }

  return (
    <List>
      {
        conversationEntities.map((conversationEntity) => (
          <ChatConversationItem
            conversationEntity={conversationEntity}
            updateConversationEntity={updateConversationEntity}
            deleteConversationEntity={deleteConversationEntity}
          />
        ))
      }
      <Box
        sx={{
          height: '164px',
        }}
      />
      <div
        ref={props.bottomRef}
      />
    </List>
  );
}
