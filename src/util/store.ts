import {AppData, Chat, ChatMessage} from "./data";

class Store {
  private appData: AppData = this.readAppData();
  private chatMessagesMap: Map<string, ChatMessage[]> = new Map<string, ChatMessage[]>();

  private readAppData(): AppData {
    const appDataJson = localStorage.getItem('app_data');
    if (appDataJson) {
      return JSON.parse(appDataJson);
    }
    return {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData;
  }

  private writeAppData(appData: AppData) {
    const appDataJson = JSON.stringify(appData);
    localStorage.setItem('app_data', appDataJson);
  }

  private readChatMessages(chatId: string): ChatMessage[] {
    const chatMessagesJson = localStorage.getItem(`chat_${chatId}`);
    if (chatMessagesJson) {
      return JSON.parse(chatMessagesJson);
    }
    return [];
  }

  private writeChatMessage(chatId: string, chatMessages: ChatMessage[]) {
    const chatMessagesJson = JSON.stringify(chatMessages);
    localStorage.setItem(`chat_${chatId}`, chatMessagesJson);
  }

  private removeChatMessages(chatId: string) {
    localStorage.removeItem(`chat_${chatId}`);
  }

  //*******************************************************************************************************************

  public getOpenAIApiKey(): string {
    return this.appData.openai_api_key;
  }

  public setOpenAIApiKey(openAIApiKey: string) {
    this.appData = {
      ...this.appData,
      openai_api_key: openAIApiKey,
    } as AppData;
    this.writeAppData(this.appData);
  }

  public getChatsData(): Chat[] {
    return this.appData.chats;
  }

  public setChatsData(chats: Chat[]) {
    this.appData = {
      ...this.appData,
      chats: chats,
    } as AppData;
    this.writeAppData(this.appData);
  }

  //*******************************************************************************************************************

  public getChat(chatId: string): Chat {
    const chat = this.appData.chats.find((chat) => chat.id === chatId);
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
    this.appData = {
      ...this.appData,
      chats: [
        ...this.appData.chats,
        chat,
      ],
    };
    this.writeAppData(this.appData);
    return chat;
  }

  public updateChat(chat: Chat) {
    const index = this.appData.chats.findIndex((foundChat) => foundChat.id === chat.id);
    if (index === -1) {
      return;
    }
    const copyChats = [...this.appData.chats];
    copyChats[index] = chat;
    this.appData = {
      ...this.appData,
      chats: copyChats,
    };
    this.writeAppData(this.appData);
  }

  public deleteChat(chatId: string) {
    const index = this.appData.chats.findIndex((chat) => chat.id === chatId);
    if (index === -1) {
      return;
    }
    const copyChats = [...this.appData.chats];
    copyChats.splice(index, 1);
    this.appData = {
      ...this.appData,
      chats: copyChats,
    };
    this.writeAppData(this.appData);
    this.chatMessagesMap.delete(chatId);
    this.removeChatMessages(chatId);
  }

  public getChatMessages(chatId: string): ChatMessage[] {
    if (this.chatMessagesMap.has(chatId)) {
      return this.chatMessagesMap.get(chatId)!!;
    }
    const chatMessages = this.readChatMessages(chatId);
    this.chatMessagesMap.set(chatId, chatMessages);
    return chatMessages;
  }

  public updateChatMessages(chatId: string, chatMessages: ChatMessage[]) {
    this.chatMessagesMap.set(chatId, chatMessages);
    this.writeChatMessage(chatId, chatMessages);
  }
}

const store = new Store();
export default store;
