import {Box} from "@mui/material";
import React from "react";
import {Virtuoso} from "react-virtuoso";
import ConversationItem, {ConversationEntity} from "../conversation/ConversationItem";
import ConversationItemFooter from "../conversation/ConversationItemFooter";

interface SaveListConversationListProps {
  conversationEntities: ConversationEntity[];
  handleRemoveSaveClick: (conversationEntity: ConversationEntity) => void;
}

export default function SaveListConversationList(props: SaveListConversationListProps) {
  return (
    <Virtuoso
      data={[...props.conversationEntities, "paddingBottom"]}
      totalCount={props.conversationEntities.length + 1}
      itemContent={(index, item) => {
        if (item === "paddingBottom") {
          return (
            <Box
              sx={{
                height: "100px",
              }}
            />
          );
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
                handleRemoveSaveClick={props.handleRemoveSaveClick}
              />
            </ConversationItem>
          );
        }
      }}
    />
  );
}
