import {Card} from "@mui/material";
import React from "react";
import MessageItem from "../conversation/MessageItem";
import {ConversationEntity} from "../chat/ConversationItem";
import ConversationItemFooter from "../conversation/ConversationItemFooter";

interface LikesConversationItemProps {
  conversationEntity: ConversationEntity;
  unlikeConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function LikesConversationItem(props: LikesConversationItemProps) {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "0px",
        marginBottom: "16px",
      }}
    >
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={true}
      />
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={false}
      />
      <ConversationItemFooter
        conversationEntity={props.conversationEntity}
        isSave={true}
        handleRemoveClick={() => props.unlikeConversationEntity(props.conversationEntity)}
      />
    </Card>
  );
}
