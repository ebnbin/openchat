import {Box, List} from "@mui/material";
import React, {RefObject} from "react";
import ConversationItem from "./ConversationItem";

export enum ConversationEntityType {
  Default,
  Context,
  Requesting,
}

export interface ConversationEntity {
  id: string;
  userMessage: string;
  assistantMessage: string;
  userMessageMarkdown: boolean,
  assistantMessageMarkdown: boolean,
  type: ConversationEntityType;
}

//*********************************************************************************************************************

interface ConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitiesNoStore: (conversationEntities: ConversationEntity[]) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
  bottomRef: RefObject<HTMLDivElement>;
}

export default function ConversationList(props: ConversationListProps) {
  const { conversationEntities, updateConversationEntitiesNoStore, deleteConversationEntity } = props;

  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    updateConversationEntitiesNoStore(conversationEntities.map((c) =>
      c.id === conversationEntity.id ? conversationEntity : c));
  }

  return (
    <List>
      {
        conversationEntities.map((conversationEntity) => (
          <ConversationItem
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
