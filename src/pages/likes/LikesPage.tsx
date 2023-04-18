import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import store from "../../utils/store";
import {Conversation} from "../../utils/types";
import LikesConversationList from "./LikesConversationList";
import {ConversationEntity} from "../conversation/ConversationItem";

function conversationsToConversationEntities(conversations: Conversation[]): ConversationEntity[] {
  return conversations.map((conversation) => {
    return {
      conversation: conversation,
      context: true,
      isRequesting: false,
    } as ConversationEntity;
  });
}

export default function LikesPage() {
  const [conversations, _setConversations] = useState<Conversation[]>([]);

  const conversationEntities = conversationsToConversationEntities(conversations);

  useEffect(() => {
    store.getSavedConversations()
      .then((conversations) => {
        _setConversations(conversations);
      });
  }, []);

  const removeSavedConversation = (conversation: Conversation) => {
    store.updateConversationsRemoveSavedConversation(conversation, [conversations, _setConversations]);
  }

  const unlikeConversationEntity = (conversationEntity: ConversationEntity) => {
    removeSavedConversation(conversationEntity.conversation);
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      <Box
        sx={{
          width: "100%",
          flexGrow: 1,
          padding: "0px",
          overflow: "auto",
        }}
      >
        <LikesConversationList
          conversationEntities={conversationEntities}
          unlikeConversationEntity={unlikeConversationEntity}
        />
      </Box>
    </Box>
  )
}
