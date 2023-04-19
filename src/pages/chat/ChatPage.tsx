import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, Conversation, FinishReason} from "../../utils/types";
import ChatConversationList from "./ChatConversationList";
import InputCard from "../../components/InputCard";
import {defaultOpenAIModel, maxContentWidth, openAIApi} from "../../utils/utils";
import store from "../../utils/store";
import {ChatCompletionRequestMessage} from "openai";
import {CreateChatCompletionResponse} from "openai/api";
import {VirtuosoHandle} from "react-virtuoso";
import {ConversationEntity} from "../conversation/ConversationItem";

function updateConversationEntities(
  chat: Chat,
  conversations: Conversation[],
  requestingConversationId: number,
): ConversationEntity[] {
  const maxTokens = defaultOpenAIModel.maxTokens * chat.context_threshold;
  const tokensPerChar = chat.char_count === 0 ? defaultOpenAIModel.tokensPerChar : chat.token_count / chat.char_count;
  let usedTokens = 0;
  if (chat.system_message !== "") {
    usedTokens += (chat.system_message.length + defaultOpenAIModel.extraCharsPerMessage) * tokensPerChar;
  }
  return [...conversations]
    .reverse()
    .map((conversation) => {
      let context: boolean;
      if (usedTokens > maxTokens) {
        context = false;
      } else {
        const tokens = (conversation.user_message.length + conversation.assistant_message.length
          + 2 * defaultOpenAIModel.extraCharsPerMessage) * tokensPerChar;
        usedTokens += tokens;
        context = usedTokens <= maxTokens;
      }
      const isRequesting = conversation.id === requestingConversationId;
      if (isRequesting) {
        context = true;
      }
      return {
        conversation: conversation,
        context: context,
        isRequesting: isRequesting,
      } as ConversationEntity;
    })
    .reverse();
}

function getRequestingMessages(
  chat: Chat,
  conversationEntities: ConversationEntity[],
  requestingConversation: Conversation,
): ChatCompletionRequestMessage[] {
  const result: ChatCompletionRequestMessage[] = [];
  if (chat.system_message !== "") {
    result.push({
      role: "system",
      content: chat.system_message,
    } as ChatCompletionRequestMessage);
  }
  conversationEntities
    .filter((conversationEntity) => conversationEntity.context)
    .forEach((conversationEntity) => {
      result.push({
        role: "user",
        content: conversationEntity.conversation.user_message,
      } as ChatCompletionRequestMessage);
      result.push({
        role: "assistant",
        content: conversationEntity.conversation.assistant_message,
      } as ChatCompletionRequestMessage);
    });
  result.push({
    role: "user",
    content: requestingConversation.user_message,
  } as ChatCompletionRequestMessage);
  return result;
}

function getCharCount(requestingMessages: ChatCompletionRequestMessage[], responseMessageContent: string): number {
  return [
    ...requestingMessages.map((message) => message.content),
    responseMessageContent,
  ]
    .reduce((acc, message) => acc + (message.length + defaultOpenAIModel.extraCharsPerMessage), 0);
}

interface ChatPageProps {
  chat: Chat,
  updateChat: (chatId: number, chat: Partial<Chat>) => void,
  createChat?: (chat: Chat) => void, // New chat
  children?: React.ReactNode; // New chat welcome page
}

export default function ChatPage(props: ChatPageProps) {
  const [conversations, _setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    store.getConversations(props.chat.id)
      .then((conversations) => {
        _setConversations(conversations);
        scrollToBottom(false);
      });
  }, [props.chat.id]);

  const createConversation = (conversation: Conversation) => {
    store.updateConversationsCreateConversation(conversation, [conversations, _setConversations]);
  }

  const updateConversation = (conversationId: number, conversation: Partial<Conversation>) => {
    store.updateConversationsUpdateConversation(conversationId, conversation, [conversations, _setConversations]);
  }

  const deleteConversation = (conversation: Conversation) => {
    store.updateConversationsDeleteConversation(conversation, [conversations, _setConversations]);
  }

  const [requestingConversationId, setRequestingConversationId] = useState(0);

  const conversationEntities = updateConversationEntities(props.chat, conversations, requestingConversationId);

  //*******************************************************************************************************************
  // Scroll to bottom

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = (smooth: boolean) => {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      behavior: smooth ? "smooth" : undefined,
      align: "end",
    });
  }

  useLayoutEffect(() => {
    if (requestingConversationId !== 0) {
      scrollToBottom(true);
    }
  }, [requestingConversationId]);

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  //*******************************************************************************************************************
  // Request

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    }
  }, []);

  const onRequest = (message: string) => {
    // Create new chat
    props.createChat?.(props.chat);

    const currentConversationEntities = conversationEntities;
    const requestingConversation = store.newConversation(props.chat.id, message);
    const requestingMessages = getRequestingMessages(props.chat, currentConversationEntities, requestingConversation);

    props.updateChat(props.chat.id, {
      conversation_count: props.chat.conversation_count + 1,
      update_timestamp: requestingConversation.id,
    });
    store.usage.update({
      conversation_count: store.usage.get().conversation_count + 1,
    });
    setRequestingConversationId(requestingConversation.id);
    createConversation(requestingConversation);

    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    openAIApi()
      .createChatCompletion({
        model: defaultOpenAIModel.model,
        messages: requestingMessages,
        temperature: props.chat.temperature,
      }, {
        signal: abortControllerRef.current.signal,
      })
      .then((response) => {
        const responseData: CreateChatCompletionResponse = response.data;
        const responseTotalTokens = responseData.usage?.total_tokens ?? 0;
        const responseFinishReason = (responseData.choices[0].finish_reason ?? "") as FinishReason;
        const responseMessageContent = responseData.choices[0].message?.content ?? "";
        const charCount = getCharCount(requestingMessages, responseMessageContent);

        props.updateChat(props.chat.id, {
          char_count: props.chat.char_count + charCount,
          token_count: props.chat.token_count + responseTotalTokens,
        });
        store.usage.update({
          token_count: store.usage.get().token_count + responseTotalTokens,
        });
        setRequestingConversationId(0);
        updateConversation(requestingConversation.id, {
          assistant_message: responseMessageContent,
          finish_reason: responseFinishReason,
        });
      })
      .catch(() => {
        setRequestingConversationId(0);
      });
  }

  //*******************************************************************************************************************

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
          display: props.children === undefined ? "flex" : "none",
          flexDirection: "column",
        }}
      >
        <ChatConversationList
          conversationEntities={conversationEntities}
          virtuosoRef={virtuosoRef}
          atBottomStateChange={(atBottom) => {
            setShowScrollToBottom(!atBottom && conversationEntities.length > 0)
          }}
          handleSaveClick={(conversationEntity) => {
            updateConversation(conversationEntity.conversation.id, {
              save_timestamp: conversationEntity.conversation.save_timestamp === 0 ? Date.now() : 0,
            });
          }}
          handleDeleteClick={(conversationEntity) => {
            deleteConversation(conversationEntity.conversation);
          }}
          abortControllerRef={abortControllerRef}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          position: "absolute",
          display: props.children === undefined ? "none" : "flex",
          paddingBottom: "64px",
        }}
      >
        {props.children}
      </Box>
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
          <InputCard
            isRequesting={requestingConversationId !== 0}
            messageTemplate={props.chat.user_message_template}
            onRequest={onRequest}
            showScrollToButton={showScrollToBottom}
            scrollToBottom={() => {
              scrollToBottom(true);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
