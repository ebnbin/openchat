import {ChatCompletionRequestMessage} from "openai";

export interface ChatMessageModel {
  id: string;
  message: ChatCompletionRequestMessage;
  context: boolean;
}
