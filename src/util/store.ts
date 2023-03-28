import {AppData, Chat, ChatConversation, Usage} from "./data";
import Preference from "./Preference";

class Store {
  private readonly appData: Preference<AppData>;
  private readonly chatConversationsMap: Map<string, Preference<ChatConversation[]>>;

  constructor() {
    this.appData = new Preference<AppData>('app_data', {
      version: 300, // 0.3.0
      openai_api_key: '',
      github_token: '',
      github_gist_id: '',
      chats: [],
      usage: {
        tokens: 0,
        image_256: 0,
        image_512: 0,
        image_1024: 0,
      } as Usage,
    } as AppData);
    if (this.appData.get().version < 300) {
      this.appData.remove()
      localStorage.clear()
    }

    this.chatConversationsMap = new Map();
  }

  getAppData(): AppData {
    return this.appData.get();
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

  public getGithubToken(): string {
    return this.appData.get().github_token;
  }

  public setGithubToken(githubToken: string) {
    this.appData.set({
      ...this.appData.get(),
      github_token: githubToken,
    } as AppData);
  }

  public getGithubGistId(): string {
    return this.appData.get().github_gist_id;
  }

  public setGithubGistId(github_gist_id: string) {
    this.appData.set({
      ...this.appData.get(),
      github_gist_id: github_gist_id,
    } as AppData);
  }

  public getChats(): Chat[] {
    return this.appData.get().chats;
  }

  public newChat(): Chat {
    return {
      id: `${new Date().getTime()}`,
      title: '',
      context_threshold: 0.7,
      system_message: '',
      user_message_template: '',
      tokens_per_char: 0,
      tokens: 0,
    } as Chat
  }

  public createChat(
    chat: Chat = this.newChat(),
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

  getUsage() {
    return this.appData.get().usage;
  }

  updateUsage(usage: Usage) {
    const currentUsage = this.appData.get().usage
    const nextUsage = {
      ...currentUsage,
      tokens: currentUsage.tokens + usage.tokens,
      image_256: currentUsage.image_256 + usage.image_256,
      image_512: currentUsage.image_512 + usage.image_512,
      image_1024: currentUsage.image_1024 + usage.image_1024,
    } as Usage
    this.appData.set({
      ...this.appData.get(),
      usage: nextUsage,
    } as AppData);
  }
}

const store = new Store();
export default store;
