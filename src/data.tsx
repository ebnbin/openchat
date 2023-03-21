export interface Settings {
  apiKey: string
  chats: ChatSettings[]
}

export interface ChatSettings {
  id: string
  title: string
  model: string
  maxTokens: number
  extraCharsPerMessage: number,
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
