export interface Data {
  'chats': Chat[];
  'conversations': Conversation[];
}

export interface Chat {
  'id': number;
  'title': string;
  'icon_text': string;
  'icon_text_size': string;
  'icon_color': string;
  'context_threshold': number;
  'system_message': string;
  'user_message_template': string;
  'update_timestamp': number;
  'char_count': number;
  'token_count': number;
}

export interface Conversation {
  'id': number;
  'chat_id': number;
  'user_message': string;
  'assistant_message': string;
  'finish_reason': string;
  'like_timestamp': number;
}

export interface Usage {
  'token_count': number;
  'conversation_count': number;
}
