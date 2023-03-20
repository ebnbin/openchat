export interface Chat {
  model: string
  maxTokens: number
  contextThreshold: number
  systemMessage: string
  conversations: ChatConversation[]
  tokensPerChar: number
  extraCharsPerMessage: number
  tokens: number
}

export interface ChatConversation {
  userMessage: string
  assistantMessage: string
  incomplete: boolean
  timestamp: number
}
