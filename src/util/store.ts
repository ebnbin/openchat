import {Chat, Conversation, Data, Settings, Usage} from "./data";
import {del, get, set, update} from "idb-keyval";
import Preference from "./Preference";

class Store {
  private readonly usage: Preference<Usage>;
  private readonly settings: Preference<Settings>;

  constructor() {
    this.usage = new Preference<Usage>('usage', {
      tokens: 0,
      conversation_count: 0,
      char_count: 0,
    } as Usage);
    this.settings = new Preference<Settings>('settings', {
      theme: 'system',
    } as Settings);
  }

  async migrate() {
    const currentVersion = 501; // 0.5.1
    const storedVersion = parseInt(localStorage.getItem('version') ?? '0', 10);
    if (storedVersion < 400) {
      localStorage.clear();
    }
    if (storedVersion < 500) {
      await update<Chat[]>('chats', (chats) => {
        if (!chats) {
          return [];
        }
        return chats.map((chat) => {
          chat.pin_timestamp = 0;
          return chat;
        });
      });
    }
    if (storedVersion < currentVersion) {
      localStorage.setItem('version', `${currentVersion}`);
    }
  }

  getDataAsync(): Promise<Data> {
    return Promise.all([this.getChatsAsync(), this.getAllConversationsAsync()])
      .then(([chats, conversations]) => {
        return {
          chats,
          conversations,
        } as Data;
      });
  }

  setData(data: Data): Promise<void> {
    return Promise.all([
      set('chats', data.chats),
      set('conversations', data.conversations),
    ]).then(() => {
    });
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

  //*******************************************************************************************************************

  newChat(): Chat {
    const timestamp = Date.now();
    return {
      id: timestamp,
      title: '',
      icon_text: '',
      icon_text_size: 'medium',
      icon_color: '',
      context_threshold: 0.7,
      system_message: '',
      user_message_template: '',
      update_timestamp: timestamp,
      pin_timestamp: 0,
    };
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: Date.now(),
      chat_id: 0,
      user_message: '',
      assistant_message: '',
      like_timestamp: 0,
      ...conversation,
    };
  }

  //*******************************************************************************************************************

  getChatsAsync(): Promise<Chat[]> {
    return get<Chat[]>('chats').then((chats) => chats || []);
  }

  updateChatsCreateChatAsync(chat: Chat) {
    update<Chat[]>('chats', (chats) => {
      return chats ? [...chats, chat] : [chat];
    }).finally();
  }

  updateChatsUpdateChatAsync(chatId: number, chat: Partial<Chat>) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.map((foundChat) => {
        if (foundChat.id === chatId) {
          return {
            ...foundChat,
            ...chat,
          };
        }
        return foundChat;
      });
    }).finally();
  }

  updateChatsDeleteChatAsync(chatId: number) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.filter((foundChat) => foundChat.id !== chatId);
    }).finally();
  }

  updateChatsAsync(chat: ((id: number) => Partial<Chat>)) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.map((foundChat) => {
        return {
          ...foundChat,
          ...chat(foundChat.id),
        };
      });
    }).finally();
  }

  //*******************************************************************************************************************

  getAllConversationsAsync(): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || []);
  }

  getLikesConversationIdsAsync(): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || [])
      .then((conversations) => conversations.filter((conversation) => conversation.like_timestamp !== 0))
      .then((conversations) => conversations.sort((a, b) => b.like_timestamp - a.like_timestamp));
  }

  getConversationsAsync(chatId: number): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || [])
      .then((conversations) => conversations.filter((conversation) => conversation.chat_id === chatId));
  }

  updateConversationsCreateConversationAsync(conversation: Conversation) {
    update<Conversation[]>('conversations', (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }).finally();
  }

  updateConversationsUpdateConversationAsync(conversationId: number, conversation: Partial<Conversation>) {
    update<Conversation[]>('conversations', (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.map((foundConversation) => {
        if (foundConversation.id === conversationId) {
          return {
            ...foundConversation,
            ...conversation,
          };
        }
        return foundConversation;
      });
    }).finally();
  }

  updateConversationsDeleteConversationAsync(conversationId: number) {
    update<Conversation[]>('conversations', (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.id !== conversationId);
    }).finally();
  }

  updateConversationsDeleteConversationsAsync(chatId: number) {
    update<Conversation[]>('conversations', (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.chat_id !== chatId);
    }).finally();
  }

  //*******************************************************************************************************************

  getUsage(): Usage {
    return this.usage.get();
  }

  getTokensPerChar(): number {
    const usage = this.usage.get();
    if (usage.char_count === 0) {
      return 0.25;
    }
    return usage.tokens / usage.char_count;
  }

  increaseUsage(usage: Partial<Usage>) {
    const prev = this.usage.get();
    this.usage.set({
      tokens: prev.tokens + (usage.tokens ?? 0),
      conversation_count: prev.conversation_count + (usage.conversation_count ?? 0),
      char_count: prev.char_count + (usage.char_count ?? 0),
    } as Usage);
  }

  //*******************************************************************************************************************

  getSettings(): Settings {
    return this.settings.get();
  }

  updateSettings(settings: Partial<Settings>) {
    this.settings.update(settings);
  }

  //*******************************************************************************************************************

  deleteAllData() {
    del('chats').finally();
    del('conversations').finally();
  }
}

const store = new Store();
export default store;
