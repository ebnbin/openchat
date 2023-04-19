import React, {useEffect, useState} from "react";
import Box from "@mui/material/Box";
import store from "../../utils/store";
import {Conversation} from "../../utils/types";
import SearchPageConversationList from "./SearchPageConversationList";
import {ConversationEntity} from "../conversation/ConversationItem";
import {maxContentWidth} from "../../utils/utils";
import SearchInputCard from "../../components/SearchInputCard";

export default function SearchPage() {
  const [allConversations, _setAllConversations] = useState<Conversation[]>([]);

  const [conversations, _setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    store.getConversations()
      .then((conversations) => {
        _setAllConversations(conversations);
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

  const handleInputChange = (input: string) => {
    const split = Array.from(new Set(input.trim().split(/\s+/)));
    if (split.length === 1 && split[0] === "") {
      _setConversations(allConversations);
      return;
    }
    _setConversations(allConversations.filter((conversation) => {
      let found = true;
      split.forEach((text) => {
        found = found && (conversation.user_message.toLowerCase().includes(text.toLowerCase())
          || conversation.assistant_message.toLowerCase().includes(text.toLowerCase()));
      })
      return found;
    }));
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
      <SearchPageConversationList
        conversationEntities={conversationEntities}
      />
      <Box
        sx={{
          width: "100%",
          position: "absolute",
          bottom: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: maxContentWidth,
            margin: "0 auto",
          }}
        >
          <SearchInputCard
            handleInputChange={handleInputChange}
          />
        </Box>
      </Box>
    </Box>
  );
}
