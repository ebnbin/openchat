import {AppData, Chat, ChatConversation, Usage} from "./data";
import Preference from "./Preference";

class Store {
  private readonly appData: Preference<AppData>;

  constructor() {
    this.appData = new Preference<AppData>('app_data', {
      version: 300, // 0.3.0
      openai_api_key: '',
      github_token: '',
      github_gist_id: '',
      chats: [],
      conversations: [],
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
      conversations: [],
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

  public updateChatToken(chat: Chat) {
    const index = this.appData.get().chats.findIndex((foundChat) => foundChat.id === chat.id);
    if (index === -1) {
      return;
    }
    const copyChats = [...this.appData.get().chats];
    copyChats[index] = {
      ...copyChats[index],
      tokens_per_char: chat.tokens_per_char,
      tokens: chat.tokens,
    };
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
    this.deleteConversations(chatId);
  }

  getConversations(): ChatConversation[] {
    return this.appData.get().conversations;
  }

  getChatConversations2(chat: Chat): ChatConversation[] {
    return chat.conversations
      .map((conversationId) => {
        return this.appData.get().conversations.find((conversation) => conversation.id === conversationId) ?? null;
      })
      .filter((conversation) => conversation !== null) as ChatConversation[];
  }

  createConversation(chatId: string, conversation: ChatConversation) {
    const chatIndex = this.appData.get().chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex === -1) {
      return;
    }
    const chat = this.appData.get().chats[chatIndex];
    const copyChat = {
      ...chat,
      conversations: [
        ...chat.conversations,
        conversation.id,
      ]
    } as Chat;
    const copyChats = [...this.appData.get().chats];
    copyChats[chatIndex] = copyChat;
    const copyConversations = [...this.appData.get().conversations, conversation];
    const copyAppData = {
      ...this.appData.get(),
      chats: copyChats,
      conversations: copyConversations,
    } as AppData;
    this.appData.set(copyAppData);
  }

  updateConversation(conversation: ChatConversation) {
    const conversationIndex = this.appData.get().conversations.findIndex((foundConversation) => foundConversation.id === conversation.id);
    if (conversationIndex === -1) {
      return;
    }
    const copyConversation = [...this.appData.get().conversations];
    copyConversation[conversationIndex] = conversation;
    const copyAppData = {
      ...this.appData.get(),
      conversations: copyConversation,
    } as AppData;
    this.appData.set(copyAppData);
  }

  deleteConversations(chatId: string) {
    const chatIndex = this.appData.get().chats.findIndex((chat) => chat.id === chatId);
    if (chatIndex === -1) {
      return;
    }
    const chat = this.appData.get().chats[chatIndex];
    const copyConversations = this.appData.get().conversations
      .filter((conversation) => !chat.conversations.includes(conversation.id))
    const copyAppData = {
      ...this.appData.get(),
      conversations: copyConversations,
    } as AppData;
    this.appData.set(copyAppData);
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
