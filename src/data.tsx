export interface Settings {
  apiKey: string
  chatList: Chat[]
}

export interface Chat {
  id: string
  title: string
  model: string
  maxTokens: number
  extraCharsPerMessage: number,
  contextThreshold: number
  systemMessage: string
  conversations: ChatConversation[]
  tokensPerChar: number
  tokens: number
  incomplete: boolean
}

export interface ChatConversation {
  timestamp: number
  userMessage: string
  assistantMessage: string
}
