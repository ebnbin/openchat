import React, {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import store from "../../util/store";
import {Conversation} from "../../util/data";
import {ConversationEntity, ConversationEntityType} from "../conversation/ConversationList";
import LikesConversationList from "./LikesConversationList";
import {VirtuosoHandle} from "react-virtuoso";

function conversationsToConversationEntities(conversations: Conversation[]): ConversationEntity[] {
  return conversations.map((conversation) => {
    return {
      id: conversation.id,
      userMessage: conversation.user_message,
      assistantMessage: conversation.assistant_message,
      userMessageMarkdown: true,
      assistantMessageMarkdown: true,
      type: ConversationEntityType.Context, // TODO
    } as ConversationEntity;
  });
}

export default function LikesPage() {
  const [conversationEntities, _setConversationEntities] = useState<ConversationEntity[]>([]);

  useEffect(() => {
    store.getAllConversationsAsync()
      .then((conversations) => {
        const conversationEntities = conversationsToConversationEntities(conversations)
        _setConversationEntities(conversationEntities)
      });
  }, []);

  const updateConversationEntitiesNoStore = (conversationEntities: ConversationEntity[]) => {
    _setConversationEntities(conversationEntities);
  }

  const unlikeConversationEntity = (conversationEntity: ConversationEntity) => {
    // TODO
  }

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = (smooth: boolean) => {
    virtuosoRef.current?.scrollToIndex({
      index: Number.MAX_SAFE_INTEGER,
      behavior: smooth ? 'smooth' : undefined,
    })
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
          virtuosoRef={virtuosoRef}
        />
      </Box>
    </Box>
  )
}
