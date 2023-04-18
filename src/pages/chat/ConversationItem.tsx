import MessageItem from "../conversation/MessageItem";
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
  abortController?: RefObject<AbortController | null>;
  children: React.ReactNode;
}

export default function ConversationItem(props: ConversationItemProps) {
  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: "0px",
        marginBottom: props.isSave ? "16px" : "1px",
      }}
    >
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={true}
      />
      <MessageItem
        conversationEntity={props.conversationEntity}
        isUser={false}
        abortController={props.abortController}
      />
      {props.children}
    </Card>
  );
}
