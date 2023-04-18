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
  const [conversationEntities, _setConversationEntities] = useState<ConversationEntity[]>([]);

  useEffect(() => {
    store.getLikesConversationIdsAsync()
      .then((conversations) => {
        const conversationEntities = conversationsToConversationEntities(conversations)
        _setConversationEntities(conversationEntities)
      });
  }, []);

  const updateConversationEntitiesNoStore = (conversationEntities: ConversationEntity[]) => {
    _setConversationEntities(conversationEntities);
  }

  const unlikeConversationEntity = (conversationEntity: ConversationEntity) => {
    _setConversationEntities((conversationEntities) => {
      return conversationEntities.filter((c) => c.conversation.id !== conversationEntity.conversation.id);
    });
    if (conversationEntity.conversation.chat_id === 0) {
      store.updateConversationsDeleteConversationAsync(conversationEntity.conversation.id);
    } else {
      store.updateConversationsUpdateConversationAsync(conversationEntity.conversation.id, {
        save_timestamp: 0,
      });
    }
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
          updateConversationEntitiesNoStore={updateConversationEntitiesNoStore}
          unlikeConversationEntity={unlikeConversationEntity}
        />
      </Box>
    </Box>
  )
}
