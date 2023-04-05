export interface Chat {
  'id': number;
  'title': string;
  'context_threshold': number;
  'system_message': string;
  'user_message_template': string;
  'tokens_per_char': number;
  'tokens': number;
}

export interface Conversation {
  'id': number;
  'user_message': string;
  'assistant_message': string;
}

export interface Usage {
  'tokens': number;
  'image_256': number;
  'image_512': number;
  'image_1024': number;
}
