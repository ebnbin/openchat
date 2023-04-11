import React, {useEffect, useRef, useState} from "react";
import Box from "@mui/material/Box";
import {Chat, Conversation} from "../../util/data";
import ChatConversationList from "./ChatConversationList";
import ChatInput from "./ChatInput";
import {defaultOpenAIModel, openAIApi} from "../../util/util";
import store from "../../util/store";
import {ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum} from "openai";
import {CreateChatCompletionResponse} from "openai/api";

export const contentWidth = 900

//*********************************************************************************************************************

export enum ConversationEntityType {
  Default,
  Context,
  Requesting,
}

export interface ConversationEntity {
  id: number;
  userMessage: string;
  assistantMessage: string;
  userMessageMarkdown: boolean,
  assistantMessageMarkdown: boolean,
  type: ConversationEntityType;
}

//*********************************************************************************************************************

function conversationsToConversationEntities(conversations: Conversation[]): ConversationEntity[] {
  return conversations.map((conversation) => {
    return {
      id: conversation.id,
      userMessage: conversation.user_message,
      assistantMessage: conversation.assistant_message,
      userMessageMarkdown: true,
      assistantMessageMarkdown: true,
      type: ConversationEntityType.Default,
    } as ConversationEntity;
  });
}

function updateConversationEntitiesContext(
  chat: Chat,
  conversationEntitiesNoContext: ConversationEntity[],
): ConversationEntity[] {
  const maxTokens = defaultOpenAIModel.maxTokens * chat.context_threshold;
  let usedTokens = 0;
  if (chat.system_message !== '') {
    usedTokens += (chat.system_message.length + defaultOpenAIModel.extraCharsPerMessage) * chat.tokens_per_char;
  }
  return conversationEntitiesNoContext
    .filter(() => true)
    .reverse()
    .map((conversationEntity) => {
      let context: boolean;
      if (usedTokens > maxTokens) {
        context = false;
      } else {
        const tokens = (conversationEntity.userMessage.length + conversationEntity.assistantMessage.length
          + 2 * defaultOpenAIModel.extraCharsPerMessage) * chat.tokens_per_char;
        usedTokens += tokens;
        context = usedTokens <= maxTokens;
      }
      const type = conversationEntity.type === ConversationEntityType.Requesting
        ? ConversationEntityType.Requesting
        : (context ? ConversationEntityType.Context : ConversationEntityType.Default);
      return {
        ...conversationEntity,
        type: type,
      } as ConversationEntity;
    })
    .reverse();
}

function getRequestingConversationEntity(conversation: Conversation): ConversationEntity {
  return {
    id: conversation.id,
    userMessage: conversation.user_message,
    assistantMessage: conversation.assistant_message,
    userMessageMarkdown: true,
    assistantMessageMarkdown: true,
    type: ConversationEntityType.Requesting,
  } as ConversationEntity;
}

function getRequestingMessages(
  chat: Chat,
  requestingConversationEntities: ConversationEntity[],
): ChatCompletionRequestMessage[] {
  const result: ChatCompletionRequestMessage[] = []
  if (chat.system_message !== '') {
    result.push(
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: chat.system_message,
      } as ChatCompletionRequestMessage,
    );
  }
  requestingConversationEntities
    .filter((conversationEntity) => conversationEntity.type !== ConversationEntityType.Default)
    .forEach((conversationEntity) => {
      result.push(
        {
          role: ChatCompletionRequestMessageRoleEnum.User,
          content: conversationEntity.userMessage,
        } as ChatCompletionRequestMessage,
      );
      if (conversationEntity.type !== ConversationEntityType.Requesting) {
        result.push(
          {
            role: ChatCompletionRequestMessageRoleEnum.Assistant,
            content: conversationEntity.assistantMessage,
          } as ChatCompletionRequestMessage,
        );
      }
    });
  return result;
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
  const tokensPerChar = responseTotalTokens / charCount
  const tokens = chat.tokens + responseTotalTokens
  store.increaseUsageAsync({
    tokens: responseTotalTokens,
  })
  updateChat(chat.id, {
    tokens_per_char: tokensPerChar,
    tokens: tokens,
  });
}

function handleResponseUpdateConversation(
  chat: Chat,
  requestingConversation: Conversation,
  response: CreateChatCompletionResponse,
) {
  const responseMessageContent = response.choices[0].message!!.content;
  store.updateConversationsUpdateConversationAsync(requestingConversation.id, {
    assistant_message: responseMessageContent,
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
      assistantMessage: conversationEntity.type === ConversationEntityType.Requesting
        ? responseMessageContent
        : conversationEntity.assistantMessage,
      type: ConversationEntityType.Default,
    };
  });
}

function getErrorConversationEntitiesNoContext(
  conversationEntities: ConversationEntity[],
): ConversationEntity[] {
  return conversationEntities.map((conversationEntity) => {
    return {
      ...conversationEntity,
      type: ConversationEntityType.Default,
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
    store.getConversationsAsync(props.chat.conversations)
      .then((conversations) => {
        const conversationEntitiesNoContext = conversationsToConversationEntities(conversations)
        setConversationEntitiesNoContext(conversationEntitiesNoContext)
        scrollToBottom(false);
      });
  }, [props.chat.id]);

  const [conversationEntities, setConversationEntities] = useState<ConversationEntity[]>([]);

  useEffect(() => {
    const conversationEntities = updateConversationEntitiesContext(props.chat, conversationEntitiesNoContext);
    setConversationEntities(conversationEntities);
  }, [props.chat, conversationEntitiesNoContext]);

  useEffect(() => {
    if (conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.Requesting) {
      scrollToBottom(true);
    }
  }, [conversationEntities]);

  const handleDeleteConversationClick = (conversationEntity: ConversationEntity) => {
    const nextConversationEntities = conversationEntities.filter((entity) => entity.id !== conversationEntity.id)
    setConversationEntitiesNoContext(nextConversationEntities)
    store.updateConversationsDeleteConversationAsync(conversationEntity.id);
    props.updateChat(props.chat.id, {
      conversations: props.chat.conversations.filter((conversationId) => conversationId !== conversationEntity.id),
    });
  }

  const handleRequest = (input: string) => {
    if (props.createChat !== undefined) {
      props.createChat(props.chat);
    }


    const formattedInput = props.chat.user_message_template.includes('{{message}}')
      ? props.chat.user_message_template.replaceAll('{{message}}', input)
      : input;
    const requestingConversation = store.newConversation({
      user_message: formattedInput,
    })
    store.updateConversationsCreateConversationAsync(requestingConversation);
    props.updateChat(props.chat.id, {
      conversations: [...props.chat.conversations, requestingConversation.id],
    });


    const requestingConversationEntity = getRequestingConversationEntity(requestingConversation);
    let requestingConversationEntities = [...conversationEntities, requestingConversationEntity];
    setConversationEntitiesNoContext(requestingConversationEntities);

    const requestingMessages = getRequestingMessages(props.chat, requestingConversationEntities);
    openAIApi()
      .createChatCompletion({
        model: defaultOpenAIModel.model,
        messages: requestingMessages,
      })
      .then((response) => {
        handleResponseUpdateChat(props.chat, props.updateChat, requestingMessages, response.data);
        handleResponseUpdateConversation(props.chat, requestingConversation, response.data);

        const responseConversationEntitiesNoContext =
          getResponseConversationEntitiesNoContext(requestingConversationEntities, response.data);
        setConversationEntitiesNoContext(responseConversationEntitiesNoContext);
      })
      .catch(() => {
        const errorConversationEntitiesNoContext =
          getErrorConversationEntitiesNoContext(requestingConversationEntities);
        setConversationEntitiesNoContext(errorConversationEntitiesNoContext);
      })
  }

  const conversationListBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth: boolean) => {
    if (conversationListBottomRef.current) {
      conversationListBottomRef.current.scrollIntoView({
        behavior: smooth ? 'smooth' : undefined,
        block: 'end',
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
          display: props.children !== undefined ? 'none' : 'block',
        }}
      >
        <ChatConversationList
          conversationEntities={conversationEntities}
          updateConversationEntitiesNoStore={setConversationEntities}
          deleteConversationEntity={handleDeleteConversationClick}
          bottomRef={conversationListBottomRef}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: props.children === undefined ? 'none' : 'flex',
          paddingBottom: '72px',
        }}
      >
        {props.children}
      </Box>
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: contentWidth,
            margin: '0 auto',
          }}
        >
          <ChatInput
            isLoading={conversationEntities.length > 0 && conversationEntities[conversationEntities.length - 1].type === ConversationEntityType.Requesting}
            handleRequest={handleRequest}
          />
        </Box>
      </Box>
    </Box>
  )
}
