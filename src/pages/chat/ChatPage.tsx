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

function conversationsToConversationEntities(conversations: Conversation[]): ConversationEntity[] {
  return conversations.map((conversation) => {
    return {
      conversation: conversation,
      context: false,
      isRequesting: false,
    } as ConversationEntity;
  });
}

function updateConversationEntitiesContext(
  chat: Chat,
  conversationEntitiesNoContext: ConversationEntity[],
): ConversationEntity[] {
  const maxTokens = defaultOpenAIModel.maxTokens * chat.context_threshold;
  let usedTokens = 0;
  if (chat.system_message !== "") {
    usedTokens += (chat.system_message.length + defaultOpenAIModel.extraCharsPerMessage) * getTokensPerChar(chat);
  }
  return conversationEntitiesNoContext
    .filter(() => true)
    .reverse()
    .map((conversationEntity) => {
      let context: boolean;
      if (usedTokens > maxTokens) {
        context = false;
      } else {
        const tokens = (conversationEntity.conversation.user_message.length + conversationEntity.conversation.assistant_message.length
          + 2 * defaultOpenAIModel.extraCharsPerMessage) * getTokensPerChar(chat);
        usedTokens += tokens;
        context = usedTokens <= maxTokens;
      }
      if (conversationEntity.isRequesting) {
        context = true;
      }
      return {
        ...conversationEntity,
        context: context,
      } as ConversationEntity;
    })
    .reverse();
}

function getRequestingConversationEntity(conversation: Conversation): ConversationEntity {
  return {
    conversation: conversation,
    context: true,
    isRequesting: true,
  } as ConversationEntity;
}

function getRequestingMessages(
  chat: Chat,
  requestingConversationEntities: ConversationEntity[],
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
  requestingConversationEntities
    .filter((conversationEntity) => conversationEntity.context)
    .forEach((conversationEntity) => {
      result.push(
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: conversationEntity.conversation.user_message,
        } as ChatCompletionRequestMessage,
      );
      if (!conversationEntity.isRequesting) {
        result.push(
          {
            role: ChatCompletionRequestMessageRoleEnum.Assistant,
            content: conversationEntity.conversation.assistant_message,
          } as ChatCompletionRequestMessage,
        );
      }
    });
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
  store.increaseUsage({
    token_count: responseTotalTokens,
    conversation_count: 1,
  })
  updateChat(chat.id, {
    token_count: chat.token_count + responseTotalTokens,
    char_count: chat.char_count + charCount,
  })
}

function handleResponseUpdateConversation(
  chat: Chat,
  requestingConversation: Conversation,
  response: CreateChatCompletionResponse,
) {
  const responseMessageContent = response.choices[0].message!!.content;
  store.updateConversationsUpdateConversationAsync(requestingConversation.id, {
    assistant_message: responseMessageContent,
    finish_reason: (response.choices[0].finish_reason ?? "") as FinishReason,
  })
}

function getResponseConversationEntitiesNoContext(
  conversationEntities: ConversationEntity[],
  response: CreateChatCompletionResponse,
): ConversationEntity[] {
  const responseMessageContent = response.choices[0].message!!.content;
  return conversationEntities.map((conversationEntity) => {
    return {
      ...conversationEntity,
      conversation: {
        ...conversationEntity.conversation,
        assistant_message: conversationEntity.isRequesting
          ? responseMessageContent
          : conversationEntity.conversation.assistant_message,
        finish_reason: conversationEntity.isRequesting
          ? (response.choices[0].finish_reason ?? "")
          : conversationEntity.conversation.finish_reason,
      } as Conversation,
      isRequesting: false,
    };
  });
}

function getErrorConversationEntitiesNoContext(
  conversationEntities: ConversationEntity[],
): ConversationEntity[] {
  return conversationEntities.map((conversationEntity) => {
    return {
      ...conversationEntity,
      isRequesting: false,
    };
  });
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
  const [conversationEntitiesNoContext, setConversationEntitiesNoContext] = useState<ConversationEntity[]>([]);

  useEffect(() => {
    store.getConversationsAsync(props.chat.id)
      .then((conversations) => {
        const conversationEntitiesNoContext = conversationsToConversationEntities(conversations)
        setConversationEntitiesNoContext(conversationEntitiesNoContext)
        scrollToBottom(false);
      });
  }, [props.chat.id]);

  const [conversationEntities, setConversationEntities] = useState<ConversationEntity[]>([]);

  const updateConversationEntityLike = (conversationEntity: ConversationEntity) => {
    setConversationEntities((conversationEntities) => {
      return conversationEntities.map((c) => {
        if (c.conversation.id === conversationEntity.conversation.id) {
          return {
            ...c,
            conversation: {
              ...c.conversation,
              save_timestamp: conversationEntity.conversation.save_timestamp,
            } as Conversation,
          } as ConversationEntity;
        }
        return c;
      });
    });
    store.updateConversationsUpdateConversationAsync(conversationEntity.conversation.id, {
      save_timestamp: conversationEntity.conversation.save_timestamp,
    })
  }

  useEffect(() => {
    const conversationEntities = updateConversationEntitiesContext(props.chat, conversationEntitiesNoContext);
    setConversationEntities(conversationEntities);
  }, [props.chat, conversationEntitiesNoContext]);

  useLayoutEffect(() => {
    if (conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].isRequesting) {
      scrollToBottom(true);
    }
  }, [conversationEntities]);

  const handleDeleteConversationClick = (conversationEntity: ConversationEntity) => {
    const nextConversationEntities = conversationEntities.filter((entity) => entity.conversation.id !== conversationEntity.conversation.id)
    setConversationEntitiesNoContext(nextConversationEntities)
    if (conversationEntity.conversation.save_timestamp === 0) {
      store.updateConversationsDeleteConversationAsync(conversationEntity.conversation.id);
    } else {
      store.updateConversationsUpdateConversationAsync(conversationEntity.conversation.id, {
        chat_id: 0,
      });
    }
  }

  const controllerRef = useRef<AbortController | null>(null);

  const handleRequest = (message: string) => {
    if (props.createChat !== undefined) {
      props.createChat(props.chat);
    }


    const requestingConversation = store.newConversation({
      chat_id: props.chat.id,
      user_message: message,
    })
    store.updateConversationsCreateConversationAsync(requestingConversation);
    props.updateChat(props.chat.id, {
      update_timestamp: requestingConversation.id,
    });


    const requestingConversationEntity = getRequestingConversationEntity(requestingConversation);
    let requestingConversationEntities = [...conversationEntities, requestingConversationEntity];
    setConversationEntitiesNoContext(requestingConversationEntities);

    const requestingMessages = getRequestingMessages(props.chat, requestingConversationEntities);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    controllerRef.current = new AbortController();

    openAIApi()
      .createChatCompletion({
        model: defaultOpenAIModel.model,
        messages: requestingMessages,
      }, {
        signal: controllerRef.current.signal,
      })
      .then((response) => {
        handleResponseUpdateChat(props.chat, props.updateChat, requestingMessages, response.data);
        handleResponseUpdateConversation(props.chat, requestingConversation, response.data);

        const responseConversationEntitiesNoContext =
          getResponseConversationEntitiesNoContext(requestingConversationEntities, response.data);
        setConversationEntitiesNoContext(responseConversationEntitiesNoContext);
      })
      .catch((e) => {
        console.log(e)
        const errorConversationEntitiesNoContext =
          getErrorConversationEntitiesNoContext(requestingConversationEntities);
        setConversationEntitiesNoContext(errorConversationEntitiesNoContext);
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
          updateConversationEntityLike={updateConversationEntityLike}
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
