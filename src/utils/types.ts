export type Theme = "system" | "light" | "dark";

export type IconTextSize = "small" | "medium" | "large";

export const ICON_COLORS = ["", "red", "pink", "purple", "deepPurple", "indigo", "blue", "lightBlue", "cyan", "teal",
  "green", "lightGreen", "lime", "yellow", "amber", "orange", "deepOrange", "brown", "grey", "blueGrey"] as const;

export type IconColor = typeof ICON_COLORS[number];

export type FinishReason = "" | "stop" | "length" | "content_filter";

export interface Data {
  version: number;
  timestamp: number;
  chats: Chat[];
  conversations: Conversation[];
}

export interface Chat {
  id: number;
  update_timestamp: number;
  title: string;
  icon_text: string;
  icon_text_size: IconTextSize;
  icon_color: IconColor;
  system_message: string;
  user_message_template: string;
  temperature: number;
  context_threshold: number;
  conversation_count: number;
  char_count: number;
  token_count: number;
}

export interface Conversation {
  id: number;
  chat_id: number;
  user_message: string;
  assistant_message: string;
  finish_reason: FinishReason;
  save_timestamp: number;
}

export interface Usage {
  conversation_count: number;
  token_count: number;
}
