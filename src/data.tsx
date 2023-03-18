export interface Chat {
  model: string
  maxTokens: number
  historyThreshold: number
  systemContent: string
  conversationList: Conversation[]
  tokensPerChar: number
  extraCharsPerMessage: number
}

export interface Conversation {
  userContent: string
  assistantContent: string
  incomplete: boolean
  timestamp: number
}
