import {AppData, Chat, ChatMessage} from "./data";
import LocalStorageItem from "./LocalStorageItem";

class Store {
  private appData: LocalStorageItem<AppData> = new LocalStorageItem<AppData>('app_data', {
    version: 100, // 0.1.0
    openai_api_key: '',
    chats: [],
  } as AppData);
  private chatMessagesMap: Map<string, LocalStorageItem<ChatMessage[]>> = new Map();

  //*******************************************************************************************************************

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

  public setChats(chats: Chat[]) {
    this.appData.set({
      ...this.appData.get(),
      chats: chats,
    } as AppData);
  }

  //*******************************************************************************************************************

  public getChat(chatId: string): Chat {
    const chat = this.appData.get().chats.find((chat) => chat.id === chatId);
    if (!chat) {
      throw new Error();
    }
    return chat;
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
    this.removeChatMessages(chatId);
  }

  public getChatMessages(chatId: string): ChatMessage[] {
    let chatMessages: LocalStorageItem<ChatMessage[]>;
    if (!this.chatMessagesMap.has(chatId)) {
      chatMessages = new LocalStorageItem<ChatMessage[]>(`chat_${chatId}`, []);
      this.chatMessagesMap.set(chatId, chatMessages);
    } else {
      chatMessages = this.chatMessagesMap.get(chatId)!!;
    }
    return chatMessages.get();
  }

  public updateChatMessages(chatId: string, chatMessages: ChatMessage[]) {
    if (!this.chatMessagesMap.has(chatId)) {
      return;
    }
    const chatMessagesLocalStorageItem = this.chatMessagesMap.get(chatId)!!;
    chatMessagesLocalStorageItem.set(chatMessages);
  }

  private removeChatMessages(chatId: string) {
    if (!this.chatMessagesMap.has(chatId)) {
      return;
    }
    const chatMessages = this.chatMessagesMap.get(chatId)!!;
    chatMessages.remove()
    this.chatMessagesMap.delete(chatId);
  }
}

const store = new Store();
export default store;
