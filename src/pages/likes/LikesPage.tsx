import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import store from "../../util/store";
import {Conversation} from "../../util/data";
import {ConversationEntity, ConversationEntityType} from "../conversation/ConversationList";
import LikesConversationList from "./LikesConversationList";

function conversationsToConversationEntities(conversations: Conversation[]): ConversationEntity[] {
  return conversations.map((conversation) => {
    return {
      id: conversation.id,
      chatId: conversation.chat_id,
      userMessage: conversation.user_message,
      assistantMessage: conversation.assistant_message,
      finishReason: conversation.finish_reason,
      likeTimestamp: conversation.like_timestamp,
      userMessageMarkdown: true,
      assistantMessageMarkdown: true,
      type: ConversationEntityType.Context, // TODO
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
      return conversationEntities.filter((c) => c.id !== conversationEntity.id);
    });
    if (conversationEntity.chatId === 0) {
      store.updateConversationsDeleteConversationAsync(conversationEntity.id);
    } else {
      store.updateConversationsUpdateConversationAsync(conversationEntity.id, {
        like_timestamp: 0,
      });
    }
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          width: '100%',
          flexGrow: 1,
          padding: '0px',
          overflow: 'auto',
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
