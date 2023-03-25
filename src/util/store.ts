import {AppData, Chat, ChatMessage} from "./data";
import Preference from "./Preference";

class Store {
  private readonly appData: Preference<AppData>;
  private readonly chatMessagesMap: Map<string, Preference<ChatMessage[]>>;

  constructor() {
    this.appData = new Preference<AppData>('app_data', {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData);
    this.chatMessagesMap = new Map();
  }

  public getOpenAIApiKey(): string {
    return this.appData.get().openai_api_key;
  }

  public setOpenAIApiKey(openAIApiKey: string) {
    this.appData.set({
      ...this.appData.get(),
      openai_api_key: openAIApiKey,
    } as AppData);
  }

  public getChats(): Chat[] {
    return this.appData.get().chats;
  }

  public createChat(): Chat {
    const chat = {
      id: `${new Date().getTime()}`,
      title: '',
      context_threshold: 0.7,
      system_message: '',
      tokens_per_char: 0,
      tokens: 0,
    } as Chat;
    this.appData.set({
      ...this.appData.get(),
      chats: [
        ...this.appData.get().chats,
        chat,
      ],
    } as AppData);
    return chat;
  }

  public updateChat(chat: Chat) {
    const index = this.appData.get().chats.findIndex((foundChat) => foundChat.id === chat.id);
    if (index === -1) {
      return;
    }
    const copyChats = [...this.appData.get().chats];
    copyChats[index] = chat;
    this.appData.set({
      ...this.appData.get(),
      chats: copyChats,
    } as AppData);
  }

  public deleteChat(chatId: string) {
    const index = this.appData.get().chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) {
      return;
    }
    const copyChats = [...this.appData.get().chats];
    copyChats.splice(index, 1);
    this.appData.set({
      ...this.appData.get(),
      chats: copyChats,
    } as AppData);
    this.deleteChatMessages(chatId);
  }

  public getChatMessages(chatId: string): ChatMessage[] {
    let chatMessages: Preference<ChatMessage[]>;
    if (this.chatMessagesMap.has(chatId)) {
      chatMessages = this.chatMessagesMap.get(chatId)!!;
    } else {
      chatMessages = new Preference<ChatMessage[]>(`chat_${chatId}`, []);
      this.chatMessagesMap.set(chatId, chatMessages);
    }
    return chatMessages.get();
  }

  public updateChatMessages(chatId: string, chatMessages: ChatMessage[]) {
    if (!this.chatMessagesMap.has(chatId)) {
      return;
    }
    const chatMessagesPreference = this.chatMessagesMap.get(chatId)!!;
    chatMessagesPreference.set(chatMessages);
  }

  private deleteChatMessages(chatId: string) {
    if (!this.chatMessagesMap.has(chatId)) {
      return;
    }
    const chatMessages = this.chatMessagesMap.get(chatId)!!;
    chatMessages.remove();
    this.chatMessagesMap.delete(chatId);
  }
}

const store = new Store();
export default store;
