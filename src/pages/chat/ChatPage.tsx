import React, {useEffect, useLayoutEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, Conversation, FinishReason} from "../../utils/types";
import ConversationList from "./ConversationList";
import InputCard from "../../components/InputCard";
import {defaultOpenAIModel, maxContentWidth, openAIApi} from "../../utils/utils";
import store from "../../utils/store";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";
import {VirtuosoHandle} from "react-virtuoso";
import {ConversationEntity} from "../conversation/ConversationItem";

function updateConversationEntities(
  chat: Chat,
  conversations: Conversation[],
  requestingConversationId: number,
): ConversationEntity[] {
  const maxTokens = defaultOpenAIModel.maxTokens * chat.context_threshold;
  let usedTokens = 0;
  if (chat.system_message !== "") {
    usedTokens += (chat.system_message.length + defaultOpenAIModel.extraCharsPerMessage) * getTokensPerChar(chat);
  }
  return [...conversations]
    .reverse()
    .map((conversation) => {
      let context: boolean;
      if (usedTokens > maxTokens) {
        context = false;
      } else {
        const tokens = (conversation.user_message.length + conversation.assistant_message.length
          + 2 * defaultOpenAIModel.extraCharsPerMessage) * getTokensPerChar(chat);
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
  const result: ChatCompletionRequestMessage[] = []
  if (chat.system_message !== "") {
    result.push(
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chat.system_message,
      } as ChatCompletionRequestMessage,
    );
  }
  conversationEntities
    .filter((conversationEntity) => conversationEntity.context)
    .forEach((conversationEntity) => {
      result.push(
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: conversationEntity.conversation.user_message,
        } as ChatCompletionRequestMessage,
      );
      // if (!conversationEntity.isRequesting) {
        result.push(
          {
            role: ChatCompletionRequestMessageRoleEnum.Assistant,
            content: conversationEntity.conversation.assistant_message,
          } as ChatCompletionRequestMessage,
        );
      // }
    });
  result.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: requestingConversation.user_message,
  } as ChatCompletionRequestMessage)
  return result;
}

function getTokensPerChar(chat: Chat): number {
  if (chat.char_count === 0) {
    return 0.25;
  }
  return chat.token_count / chat.char_count;
}

function handleResponseUpdateChat(
  chat: Chat,
  updateChat: (chatId: number, chat: Partial<Chat>) => void,
  requestingMessages: ChatCompletionRequestMessage[],
  response: CreateChatCompletionResponse,
) {
  const responseMessageContent = response.choices[0].message!!.content;
  const responseTotalTokens = response.usage!!.total_tokens
  const charCount = requestingMessages
    .map((message) => message.content)
    .concat(responseMessageContent)
    .reduce((acc, message) => acc + message.length + defaultOpenAIModel.extraCharsPerMessage, 0)
  store.usage.set({
    token_count: store.usage.get().token_count + responseTotalTokens,
    conversation_count: store.usage.get().conversation_count + 1,
  })
  updateChat(chat.id, {
    conversation_count: chat.conversation_count + 1,
    token_count: chat.token_count + responseTotalTokens,
    char_count: chat.char_count + charCount,
  })
}

//*********************************************************************************************************************
//*********************************************************************************************************************

interface ChatProps {
  chat: Chat,
  updateChat: (chatId: number, chat: Partial<Chat>) => void,
  createChat?: (chat: Chat) => void, // For new chat
  children?: React.ReactNode; // For new chat
}

export default function ChatPage(props: ChatProps) {
  const [conversations, _setConversations] = useState<Conversation[]>([]);

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

  useEffect(() => {
    store.getConversations(props.chat.id)
      .then((conversations) => {
        _setConversations(conversations);
        scrollToBottom(false);
      });
  }, [props.chat.id]);

  const [conversationEntities, setConversationEntities] = useState<ConversationEntity[]>([]);

  const updateConversationSaveTimestamp = (conversationId: number, saveTimestamp: number) => {
    updateConversation(conversationId, {
      save_timestamp: saveTimestamp,
    });
  }

  useEffect(() => {
    const conversationEntities = updateConversationEntities(props.chat, conversations, requestingConversationId);
    setConversationEntities(conversationEntities);
  }, [props.chat, conversations, requestingConversationId]);

  useLayoutEffect(() => {
    if (conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].isRequesting) {
      scrollToBottom(true);
    }
  }, [conversationEntities]);

  const handleDeleteConversationClick = (conversationEntity: ConversationEntity) => {
    deleteConversation(conversationEntity.conversation);
  }

  const controllerRef = useRef<AbortController | null>(null);

  const handleRequest = (message: string) => {
    if (props.createChat !== undefined) {
      props.createChat(props.chat);
    }


    const requestingConversation = store.newConversation(props.chat.id, message);

    createConversation(requestingConversation);

    props.updateChat(props.chat.id, {
      update_timestamp: requestingConversation.id,
    });
    const requestingMessages = getRequestingMessages(props.chat, conversationEntities, requestingConversation);

    setRequestingConversationId(requestingConversation.id);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    openAIApi()
      .createChatCompletion({
        model: defaultOpenAIModel.model,
        messages: requestingMessages,
        temperature: props.chat.temperature,
      }, {
        signal: controllerRef.current.signal,
      })
      .then((response) => {
        handleResponseUpdateChat(props.chat, props.updateChat, requestingMessages, response.data);

        const responseData: CreateChatCompletionResponse = response.data;
        const responseMessageContent = responseData.choices[0].message!!.content;

        const conversationPartial: Partial<Conversation> = {
          assistant_message: responseMessageContent,
          finish_reason: (responseData.choices[0].finish_reason ?? "") as FinishReason,
        }

        updateConversation(requestingConversation.id, conversationPartial);

        setRequestingConversationId(0);
      })
      .catch(() => {
        setRequestingConversationId(0);
      })
  }

  useEffect(() => {
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    }
  }, []);

  const virtuosoRef = useRef<VirtuosoHandle>(null);

  const scrollToBottom = (smooth: boolean) => {
    virtuosoRef.current?.scrollToIndex({
      index: "LAST",
      behavior: smooth ? "smooth" : undefined,
      align: "end",
    })
  }

  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

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
          display: props.children !== undefined ? "none" : "block",
        }}
      >
        <ConversationList
          conversationEntities={conversationEntities}
          updateConversationEntitySave={updateConversationSaveTimestamp}
          deleteConversationEntity={handleDeleteConversationClick}
          virtuosoRef={virtuosoRef}
          atBottomStateChange={(atBottom) => {
            setShowScrollToBottom(!atBottom && conversationEntities.length > 0)
          }}
          controller={controllerRef}
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
            isRequesting={conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].isRequesting}
            messageTemplate={props.chat.user_message_template}
            onRequest={handleRequest}
            showScrollToButton={showScrollToBottom}
            scrollToBottom={() => {
              scrollToBottom(true);
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
