import {Box} from "@mui/material";
import React, {RefObject} from "react";
import ConversationItem, {ConversationEntity} from "../conversation/ConversationItem";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import ConversationItemFooter from "../conversation/ConversationItemFooter";

interface ConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitySave: (conversationId: number, saveTimestamp: number) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
  virtuosoRef: RefObject<VirtuosoHandle>;
  atBottomStateChange: (atBottom: boolean) => void;
  controller: RefObject<AbortController | null>;
}

export default function ConversationList(props: ConversationListProps) {
  const { conversationEntities, deleteConversationEntity } = props;

  const handleLikeClick = (conversationEntity: ConversationEntity) => {
    props.updateConversationEntitySave(conversationEntity.conversation.id,
      conversationEntity.conversation.save_timestamp === 0 ? Date.now() : 0);
  }

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
              isSave={false}
              abortController={props.controller}
            >
              <ConversationItemFooter
                conversationEntity={conversationEntity}
                isSave={false}
                handleSaveClick={() => handleLikeClick(conversationEntity)}
                handleDeleteClick={() => deleteConversationEntity(conversationEntity)}
              />
            </ConversationItem>
          );
        }
      }}
    />
  );
}
