export interface Settings {
  apiKey: string
  chats: ChatSettings[]
}

export interface ChatSettings {
  id: string
  title: string
  model: string
  contextThreshold: number
  systemMessage: string
  tokensPerChar: number
  tokens: number
  incomplete: boolean
}

export interface ChatConversation {
  timestamp: number
  userMessage: string
  assistantMessage: string
}

export interface ChatModel {
  maxTokens: number,
  extraCharsPerMessage: number,
}

export const chatModels = new Map<string, ChatModel>([
  [
    'gpt-3.5-turbo',
    {
      maxTokens: 4096,
      extraCharsPerMessage: 16,
    } as ChatModel,
  ]
])
