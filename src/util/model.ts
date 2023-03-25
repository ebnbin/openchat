import {ChatCompletionRequestMessage} from "openai";

export interface AppModel {
  chats: ChatModel[];
  chatMessagesMap: Map<string, ChatMessageModel[]>;
}

export interface ChatModel {
  id: string;
  title: string;
  contextThreshold: number;
  systemMessage: string;
  tokenPerChar: number;
  token: number;
}

export interface ChatMessageModel {
  id: string;
  message: ChatCompletionRequestMessage;
  context: boolean;
}
