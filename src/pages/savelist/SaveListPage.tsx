import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import store from "../../utils/store";
import {Conversation} from "../../utils/types";
import SaveListConversationList from "./SaveListConversationList";
import {ConversationEntity} from "../conversation/ConversationItem";

export default function SaveListPage() {
  const [conversations, _setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    store.getSavedConversations()
      .then((conversations) => {
        _setConversations(conversations);
      });
  }, []);

  const conversationEntities = conversations.map((conversation) => {
    return {
      conversation: conversation,
      context: true,
      isRequesting: false,
    } as ConversationEntity;
  });

  const handleRemoveSaveClick = (conversationEntity: ConversationEntity) => {
    store.updateConversationsRemoveSavedConversation(conversationEntity.conversation, [conversations, _setConversations]);
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <SaveListConversationList
        conversationEntities={conversationEntities}
        handleRemoveSaveClick={handleRemoveSaveClick}
      />
    </Box>
  );
}
