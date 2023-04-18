import {Box} from "@mui/material";
import React from "react";
import {Virtuoso} from "react-virtuoso";
import ConversationItem, {ConversationEntity} from "../conversation/ConversationItem";
import ConversationItemFooter from "../conversation/ConversationItemFooter";

interface LikesConversationListProps {
  conversationEntities: ConversationEntity[];
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
            <ConversationItem
              conversationEntity={conversationEntity}
              isSave={true}
            >
              <ConversationItemFooter
                conversationEntity={conversationEntity}
                isSave={true}
                handleRemoveClick={() => props.unlikeConversationEntity(conversationEntity)}
              />
            </ConversationItem>
          );
        }
      }}
    />
  );
}
