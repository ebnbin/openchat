import {Box} from "@mui/material";
import React, {RefObject} from "react";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import LikesConversationItem from "./LikesConversationItem";
import {ConversationEntity} from "../conversation/ConversationList";

interface LikesConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitiesNoStore: (conversationEntities: ConversationEntity[]) => void;
  unlikeConversationEntity: (conversationEntity: ConversationEntity) => void;
  virtuosoRef: RefObject<VirtuosoHandle>;
}

export default function LikesConversationList(props: LikesConversationListProps) {
  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    props.updateConversationEntitiesNoStore(props.conversationEntities.map((c) =>
      c.id === conversationEntity.id ? conversationEntity : c));
  }

  return (
    <Virtuoso
      ref={props.virtuosoRef}
      data={[...props.conversationEntities, 0]}
      totalCount={props.conversationEntities.length + 1}
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
            <LikesConversationItem
              conversationEntity={conversationEntity}
              updateConversationEntity={updateConversationEntity}
              unlikeConversationEntity={props.unlikeConversationEntity}
            />
          );
        }
      }}
    />
  );
}
