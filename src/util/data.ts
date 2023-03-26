export interface AppData {
  'version': number;
  'openai_api_key': string;
  'chats': Chat[];
  'usage': Usage;
}

export interface Chat {
  'id': string;
  'title': string;
  'context_threshold': number;
  'system_message': string;
  'tokens_per_char': number;
  'tokens': number;
}

export interface ChatConversation {
  'id': string;
  'user_message': string;
  'assistant_message': string;
  'finish_reason': string | null;
}

export interface Usage {
  'tokens': number;
  'image_256': number;
  'image_512': number;
  'image_1024': number;
}
