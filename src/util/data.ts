export interface AppData {
  'version': number;
  'openai_api_key': string;
  'github_token': string;
  'github_gist_id': string;
  'chats': Chat[];
  'conversations': ChatConversation[];
  'usage': Usage;
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

export interface ChatConversation {
  'id': string;
  'user_message': string;
  'assistant_message': string;
}

export interface Usage {
  'tokens': number;
  'image_256': number;
  'image_512': number;
  'image_1024': number;
}
