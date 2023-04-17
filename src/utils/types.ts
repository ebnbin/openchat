export interface Data {
  'version': number;
  'timestamp': number;
  'chats': Chat[];
  'conversations': Conversation[];
}

export interface Chat {
  'id': number;
  'update_timestamp': number;
  'title': string;
  'icon_text': string;
  'icon_text_size': string;
  'icon_color': string;
  'system_message': string;
  'user_message_template': string;
  'temperature': number;
  'context_threshold': number;
  'conversation_count': number;
  'char_count': number;
  'token_count': number;
}

export interface Conversation {
  'id': number;
  'chat_id': number;
  'user_message': string;
  'assistant_message': string;
  'finish_reason': string;
  'save_timestamp': number;
}

export interface Usage {
  'conversation_count': number;
  'token_count': number;
}
