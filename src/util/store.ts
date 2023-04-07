import {Chat, Conversation, Usage} from "./data";
import {del, get, update} from "idb-keyval";

class Store {
  constructor() {
    this.migrate();
  }

  private migrate() {
    const currentVersion = 300; // 0.3.0
    const storedVersion = parseInt(localStorage.getItem('version') ?? '0', 10);
    if (storedVersion < currentVersion) {
      localStorage.clear();
      // TODO: migrate
      localStorage.setItem('version', `${currentVersion}`);
    }
  }

  getDataJson(): string {
    return '';
  }

  getOpenAIApiKey(): string {
    return localStorage.getItem('openai_api_key') ?? '';
  }

  setOpenAIApiKey(openAIApiKey: string) {
    localStorage.setItem('openai_api_key', openAIApiKey);
  }

  getGithubToken(): string {
    return localStorage.getItem('github_token') ?? '';
  }

  setGithubToken(githubToken: string) {
    localStorage.setItem('github_token', githubToken);
  }

  getGithubGistId(): string {
    return localStorage.getItem('github_gist_id') ?? '';
  }

  setGithubGistId(githubGistId: string) {
    localStorage.setItem('github_gist_id', githubGistId);
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
    };
  }

  createChatAsync(chat: Chat) {
    update<Chat[]>('chats', (chats) => {
      return chats ? [...chats, chat] : [chat];
    }).catch(() => {
    });
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

  createConversationAsync(chatId: number, conversation: Conversation) {
    update<Conversation[]>(`chat_${chatId}`, (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }).catch(() => {
    });
  }

  createConversationAsync2(chatId: number, userMessage: string): Conversation {
    const conversation = this.newConversation({
      user_message: userMessage,
    });
    this.createConversationAsync(chatId, conversation);
    return conversation;
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

  deleteConversationAsync(chatId: number, conversationId: number) {
    update<Conversation[]>(`chat_${chatId}`, (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((c) => c.id !== conversationId);
    }).catch(() => {
    });
  }

  getUsageAsync(): Promise<Usage> {
    return get<Usage>('usage')
      .then((usage) => usage || {tokens: 0, image_256: 0, image_512: 0, image_1024: 0});
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
