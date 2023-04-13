export interface Data {
  'chats': Chat[];
  'conversations': Conversation[];
}

export interface Chat {
  'id': string;
  'title': string;
  'icon_text': string;
  'icon_text_size': string;
  'icon_color': string;
  'context_threshold': number;
  'system_message': string;
  'user_message_template': string;
  'conversations': string[];
}

export interface Conversation {
  'id': string;
  'user_message': string;
  'assistant_message': string;
}

export interface Usage {
  'tokens': number;
  'charCount': number;
}

export interface Settings {
  'dark_mode': string;
  'chat_order': string;
}
