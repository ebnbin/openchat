import {Box} from "@mui/material";
import React from "react";
import {Virtuoso} from "react-virtuoso";
import LikesConversationItem from "./LikesConversationItem";
import {ConversationEntity} from "../chat/ConversationItem";

interface LikesConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitiesNoStore: (conversationEntities: ConversationEntity[]) => void;
  unlikeConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function LikesConversationList(props: LikesConversationListProps) {
  return (
    <Virtuoso
      data={[...props.conversationEntities, 0]}
      totalCount={props.conversationEntities.length + 1}
      itemContent={(index, item) => {
        if (item === 0) {
          return (
            <Box
              sx={{
                height: "100px",
              }}
            />
          )
        } else {
          const conversationEntity = item as ConversationEntity;
          return (
            <LikesConversationItem
              conversationEntity={conversationEntity}
              unlikeConversationEntity={props.unlikeConversationEntity}
            />
          );
        }
      }}
    />
  );
}
