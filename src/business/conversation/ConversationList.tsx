import {Box} from "@mui/material";
import React, {RefObject} from "react";
import ConversationItem from "./ConversationItem";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";

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
  virtuosoRef: RefObject<VirtuosoHandle>;
}

export default function ConversationList(props: ConversationListProps) {
  const { conversationEntities, updateConversationEntitiesNoStore, deleteConversationEntity } = props;

  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    updateConversationEntitiesNoStore(conversationEntities.map((c) =>
      c.id === conversationEntity.id ? conversationEntity : c));
  }

  return (
    <Virtuoso
      ref={props.virtuosoRef}
      data={[...conversationEntities, 0]}
      totalCount={conversationEntities.length + 1}
      itemContent={(index, item) => {
        if (item === 0) {
          return (
            <Box
              sx={{
                height: '225px',
              }}
            />
          )
        } else {
          const conversationEntity = item as ConversationEntity;
          return (
            <ConversationItem
              conversationEntity={conversationEntity}
              updateConversationEntity={updateConversationEntity}
              deleteConversationEntity={deleteConversationEntity}
            />
          );
        }
      }}
    />
  );
}
