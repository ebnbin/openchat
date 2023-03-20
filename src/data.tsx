export interface Chat {
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
  requestingUserMessage: string
}

export interface ChatConversation {
  timestamp: number
  userMessage: string
  assistantMessage: string
}
