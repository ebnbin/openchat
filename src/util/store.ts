import {Data, Chat, Conversation, Usage} from "./data";
import Preference from "./Preference";
import {del, get, set, update} from "idb-keyval";

class Store {
  private readonly data: Preference<Data>;

  constructor() {
    this.data = new Preference<Data>('data', {
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
      },
    });
    this.migrate();
  }

  private migrate() {
    if (this.data.get().version < 300) {
      this.data.remove();
      localStorage.clear();
    }
  }

  getDataJson(): string {
    return JSON.stringify(this.data.get(), (key, value) => {
      if (key === 'openai_api_key' || key === 'github_token' || key === 'github_gist_id') {
        return undefined;
      }
      return value;
    });
  }

  getOpenAIApiKey(): string {
    return this.data.get().openai_api_key;
  }

  setOpenAIApiKey(openAIApiKey: string) {
    this.data.update({
      openai_api_key: openAIApiKey,
    });
  }

  getGithubToken(): string {
    return this.data.get().github_token;
  }

  setGithubToken(githubToken: string) {
    this.data.update({
      github_token: githubToken,
    });
  }

  getGithubGistId(): string {
    return this.data.get().github_gist_id;
  }

  setGithubGistId(githubGistId: string) {
    this.data.update({
      github_gist_id: githubGistId,
    });
  }

  getChats(): Chat[] {
    return this.data.get().chats;
  }

  getChatsAsync(): Promise<Chat[]> {
    return get<Chat[]>('chats')
      .then((chats) => chats || []);
  }

  newChat(): Chat {
    return {
      id: new Date().getTime(),
      title: '',
      context_threshold: 0.7,
      system_message: '',
      user_message_template: '',
      tokens_per_char: 0,
      tokens: 0,
      conversations: [],
    };
  }

  createChat(chat: Chat) {
    this.data.update({
      chats: [
        ...this.data.get().chats,
        chat,
      ],
    });
  }

  createChatAsync(chat: Chat) {
    update<Chat[]>('chats', (chats) => {
      return chats ? [...chats, chat] : [chat];
    }).catch(() => {
    });
  }

  updateChat(chatId: number, chat: Partial<Chat>): Chat | null {
    let updatedChat: Chat | null = null;
    this.data.update({
      chats: this.data.get().chats.map((c) => {
        if (c.id === chatId) {
          updatedChat = {
            ...c,
            ...chat,
          };
          return updatedChat;
        }
        return c;
      }),
    });
    return updatedChat;
  }

  updateChatAsync(chatId: number, chat: Partial<Chat>) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.map((c) => {
        if (c.id === chatId) {
          return {
            ...c,
            ...chat,
          };
        }
        return c;
      });
    }).catch(() => {
    });
  }

  deleteChat(chatId: number): boolean {
    const chat = this.data.get().chats.find((chat) => chat.id === chatId);
    if (!chat) {
      return false;
    }
    this.data.update({
      chats: this.data.get().chats.filter((c) => c.id !== chatId),
      conversations: this.data.get().conversations
        .filter((conversation) => !chat.conversations.includes(conversation.id)),
    })
    return true;
  }

  deleteChatAsync(chatId: number) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.filter((c) => c.id !== chatId);
    }).catch(() => {
    });
    del(`chat_${chatId}`).catch(() => {
    });
  }

  getConversations(chat: Chat): Conversation[] {
    return this.data.get().conversations
      .filter((conversation) => chat.conversations.includes(conversation.id));
  }

  getConversationsAsync(chatId: number): Promise<Conversation[]> {
    return get<Conversation[]>(`chat_${chatId}`)
      .then((conversations) => conversations || []);
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: new Date().getTime(),
      user_message: '',
      assistant_message: '',
      ...conversation,
    };
  }

  createConversation(chat: Chat, conversation: Conversation): Chat {
    if (!this.data.get().chats.find((c) => c.id === chat.id)) {
      return chat;
    }
    const updatedChat = {
      ...chat,
      conversations: [
        ...chat.conversations.filter((conversationId) => {
          return this.data.get().conversations.find((c) => c.id === conversationId);
        }),
        conversation.id,
      ],
    };
    this.data.update({
      chats: this.data.get().chats.map((c) => {
        if (c.id === chat.id) {
          return updatedChat;
        }
        return c;
      }),
      conversations: [
        ...this.data.get().conversations,
        conversation,
      ],
    });
    return updatedChat;
  }

  createConversationAsync(chatId: number, conversation: Conversation) {
    update<Conversation[]>(`chat_${chatId}`, (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }).catch(() => {
    });
  }

  updateConversation(conversationId: number, conversation: Partial<Conversation>): Conversation | null {
    let updatedConversation: Conversation | null = null;
    this.data.update({
      conversations: this.data.get().conversations.map((c) => {
        if (c.id === conversationId) {
          updatedConversation = {
            ...c,
            ...conversation,
          };
          return updatedConversation;
        }
        return c;
      }),
    });
    return updatedConversation;
  }

  updateConversationAsync(chatId: number, conversationId: number, conversation: Partial<Conversation>) {
    update<Conversation[]>(`chat_${chatId}`, (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            ...conversation,
          };
        }
        return c;
      });
    }).catch(() => {
    });
  }

  deleteConversation(conversationId: number) {
    this.data.update({
      conversations: this.data.get().conversations.filter((c) => c.id !== conversationId),
    });
  }

  deleteConversationAsync(chatId: number, conversationId: number) {
    update<Conversation[]>(`chat_${chatId}`, (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((c) => c.id !== conversationId);
    }).catch(() => {
    });
  }

  getUsage(): Usage {
    return this.data.get().usage;
  }

  getUsageAsync(): Promise<Usage> {
    return get<Usage>('usage')
      .then((usage) => usage || {tokens: 0, image_256: 0, image_512: 0, image_1024: 0});
  }

  increaseUsage(usage: Partial<Usage>) {
    const currentUsage = this.data.get().usage;
    this.data.update({
      usage: {
        tokens: currentUsage.tokens + (usage.tokens ?? 0),
        image_256: currentUsage.image_256 + (usage.image_256 ?? 0),
        image_512: currentUsage.image_512 + (usage.image_512 ?? 0),
        image_1024: currentUsage.image_1024 + (usage.image_1024 ?? 0),
      },
    });
  }

  increaseUsageAsync(usage: Partial<Usage>) {
    update<Usage>('usage', (currentUsage) => {
      return {
        tokens: (currentUsage?.tokens ?? 0) + (usage.tokens ?? 0),
        image_256: (currentUsage?.image_256 ?? 0) + (usage.image_256 ?? 0),
        image_512: (currentUsage?.image_512 ?? 0) + (usage.image_512 ?? 0),
        image_1024: (currentUsage?.image_1024 ?? 0) + (usage.image_1024 ?? 0),
      };
    }).catch(() => {
    });
  }
}

const store = new Store();
export default store;
