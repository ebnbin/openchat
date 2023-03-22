export interface Settings {
  'openai_api_key': string
  'chats': Chat[]
}

export interface Chat {
  'id': string
  'title': string
  'context_threshold': number
  'system_message': string
  'tokens_per_char': number
  'tokens': number
}

export interface ChatConversation {
  'id': string
  'user_message': string
  'assistant_message': string
}

export interface ChatModel {
  model: string,
  maxTokens: number,
  extraCharsPerMessage: number,
}

export const chatModels = new Map<string, ChatModel>([
  [
    'gpt-3.5-turbo',
    {
      model: 'gpt-3.5-turbo',
      maxTokens: 4096,
      extraCharsPerMessage: 16,
    } as ChatModel,
  ]
])

export const defaultModel = chatModels.get('gpt-3.5-turbo')!!
