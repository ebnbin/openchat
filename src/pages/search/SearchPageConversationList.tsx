import {Box} from "@mui/material";
import React from "react";
import {Virtuoso} from "react-virtuoso";
import ConversationItem, {ConversationEntity} from "../conversation/ConversationItem";

interface SearchPageConversationListProps {
  conversationEntities: ConversationEntity[];
}

export default function SearchPageConversationList(props: SearchPageConversationListProps) {
  return (
    <Virtuoso
      data={[...props.conversationEntities, "paddingBottom"]}
      totalCount={props.conversationEntities.length + 1}
      itemContent={(index, item) => {
        if (item === "paddingBottom") {
          return (
            <Box
              sx={{
                height: "164px",
              }}
            />
          );
        } else {
          const conversationEntity = item as ConversationEntity;
          return (
            <ConversationItem
              conversationEntity={conversationEntity}
            />
          );
        }
      }}
    />
  );
}
