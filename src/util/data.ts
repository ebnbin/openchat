export interface Data {
  'chats': Chat[];
  'conversations': Conversation[];
}

export interface Chat {
  'id': string;
  'title': string;
  'context_threshold': number;
  'system_message': string;
  'user_message_template': string;
  'tokens_per_char': number;
  'tokens': number;
  'conversations': string[];
}

export interface Conversation {
  'id': string;
  'user_message': string;
  'assistant_message': string;
  'deleted': boolean;
  'liked': boolean;
}

export interface Usage {
  'tokens': number;
  'image_256': number;
  'image_512': number;
  'image_1024': number;
}
