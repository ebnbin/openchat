import {Box} from "@mui/material";
import React, {RefObject} from "react";
import ConversationItem, {ConversationEntity} from "./ConversationItem";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";

interface ConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntityLike: (conversationEntity: ConversationEntity) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
  virtuosoRef: RefObject<VirtuosoHandle>;
  atBottomStateChange: (atBottom: boolean) => void;
  controller: RefObject<AbortController | null>;
}

export default function ConversationList(props: ConversationListProps) {
  const { conversationEntities, deleteConversationEntity } = props;

  return (
    <Virtuoso
      ref={props.virtuosoRef}
      data={[...conversationEntities, 0]}
      totalCount={conversationEntities.length + 1}
      atBottomStateChange={props.atBottomStateChange}
      atBottomThreshold={161}
      itemContent={(index, item) => {
        if (item === 0) {
          return (
            <Box
              sx={{
                height: "225px",
              }}
            />
          )
        } else {
          const conversationEntity = item as ConversationEntity;
          return (
            <ConversationItem
              conversationEntity={conversationEntity}
              updateConversationEntityLike={props.updateConversationEntityLike}
              deleteConversationEntity={deleteConversationEntity}
              controller={props.controller}
            />
          );
        }
      }}
    />
  );
}
