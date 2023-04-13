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
  'update_timestamp': number;
}

export interface Conversation {
  'id': string;
  'chat_id': string;
  'user_message': string;
  'assistant_message': string;
  'like_timestamp': number;
}

export interface Usage {
  'tokens': number;
  'conversation_count': number;
  'char_count': number;
}

export interface Settings {
  'theme': string;
}
