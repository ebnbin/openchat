import {Box} from "@mui/material";
import React, {RefObject} from "react";
import ConversationItem, {ConversationEntity} from "../conversation/ConversationItem";
import {Virtuoso, VirtuosoHandle} from "react-virtuoso";
import ConversationItemFooter from "../conversation/ConversationItemFooter";

interface ChatConversationListProps {
  conversationEntities: ConversationEntity[];
  virtuosoRef: RefObject<VirtuosoHandle>;
  atBottomStateChange: (atBottom: boolean) => void;
  handleSaveClick: (conversationEntity: ConversationEntity) => void;
  handleDeleteClick: (conversationEntity: ConversationEntity) => void;
  abortController: RefObject<AbortController | null>;
}

export default function ChatConversationList(props: ChatConversationListProps) {
  return (
    <Virtuoso
      ref={props.virtuosoRef}
      data={[...props.conversationEntities, "paddingBottom"]}
      totalCount={props.conversationEntities.length + 1}
      atBottomStateChange={props.atBottomStateChange}
      atBottomThreshold={100}
      itemContent={(index, item) => {
        if (item === "paddingBottom") {
          return (
            <Box
              sx={{
                height: "225px",
              }}
            />
          );
        } else {
          const conversationEntity = item as ConversationEntity;
          return (
            <ConversationItem
              conversationEntity={conversationEntity}
              isSave={false}
              abortController={props.abortController}
            >
              <ConversationItemFooter
                conversationEntity={conversationEntity}
                isSave={false}
                handleSaveClick={props.handleSaveClick}
                handleDeleteClick={props.handleDeleteClick}
              />
            </ConversationItem>
          );
        }
      }}
    />
  );
}
