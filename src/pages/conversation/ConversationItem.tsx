import MessageItem from "./MessageItem";
import {Card} from "@mui/material";
import React, {RefObject} from "react";
import {Conversation} from "../../utils/types";

export interface ConversationEntity {
  conversation: Conversation,
  context: boolean,
  isRequesting: boolean,
}

interface ConversationItemProps {
  conversationEntity: ConversationEntity;
  isSave: boolean;
  abortControllerRef?: RefObject<AbortController | null>;
  children: React.ReactNode;
}

export default function ConversationItem(props: ConversationItemProps) {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "0px",
        marginBottom: props.isSave ? "16px" : "2px",
      }}
    >
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={true}
      />
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={false}
        abortControllerRef={props.abortControllerRef}
      />
      {props.children}
    </Card>
  );
}
