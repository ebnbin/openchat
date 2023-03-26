import {AppData, Chat, ChatConversation} from "./data";
import Preference from "./Preference";

class Store {
  private readonly appData: Preference<AppData>;
  private readonly chatConversationsMap: Map<string, Preference<ChatConversation[]>>;

  constructor() {
    this.appData = new Preference<AppData>('app_data', {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData);
    this.chatConversationsMap = new Map();
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

  public createChat(
    chat: Chat = {
      id: `${new Date().getTime()}`,
      title: '',
      context_threshold: 0.7,
      system_message: '',
      tokens_per_char: 0,
      tokens: 0,
    } as Chat,
  ): Chat {
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
    this.deleteChatConversations(chatId);
  }

  public getChatConversations(chatId: string): ChatConversation[] {
    let chatConversations: Preference<ChatConversation[]>;
    if (this.chatConversationsMap.has(chatId)) {
      chatConversations = this.chatConversationsMap.get(chatId)!!;
    } else {
      chatConversations = new Preference<ChatConversation[]>(`chat_${chatId}`, []);
      this.chatConversationsMap.set(chatId, chatConversations);
    }
    return chatConversations.get();
  }

  public updateChatConversations(chatId: string, chatConversations: ChatConversation[]) {
    if (!this.chatConversationsMap.has(chatId)) {
      return;
    }
    const chatConversationsPreference = this.chatConversationsMap.get(chatId)!!;
    chatConversationsPreference.set(chatConversations);
  }

  private deleteChatConversations(chatId: string) {
    if (!this.chatConversationsMap.has(chatId)) {
      return;
    }
    const chatConversations = this.chatConversationsMap.get(chatId)!!;
    chatConversations.remove();
    this.chatConversationsMap.delete(chatId);
  }
}

const store = new Store();
export default store;
