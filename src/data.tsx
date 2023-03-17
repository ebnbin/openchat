export interface Chat {
  model: string
  maxTokens: number
  historyThreshold: number
  systemMessageList: SystemMessage[]
  messagePairList: MessagePair[]
  tokensPerChar: number
}

interface SystemMessage {
  content: string
}

interface MessagePair {
  content: string
  assistantMessage?: AssistantMessage
}

interface AssistantMessage {
  content: string
  incomplete: boolean
  timestamp: number
}
