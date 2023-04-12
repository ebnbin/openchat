import {Chat, Conversation, Data, Settings, Usage} from "./data";
import {get, set, update} from "idb-keyval";
import Preference from "./Preference";

class Store {
  private readonly usage: Preference<Usage>;
  private readonly settings: Preference<Settings>;

  constructor() {
    this.usage = new Preference<Usage>('usage', {
      tokens: 0,
      charCount: 0,
      image_256: 0,
      image_512: 0,
      image_1024: 0,
    } as Usage);
    this.settings = new Preference<Settings>('settings', {
      dark_mode: 'system',
    } as Settings);

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
    return {
      id: `${new Date().getTime()}`,
      title: '',
      context_threshold: 0.7,
      system_message: '',
      user_message_template: '',
      conversations: [],
    };
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: `${new Date().getTime()}`,
      user_message: '',
      assistant_message: '',
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

  updateChatsUpdateChatAsync(chatId: string, chat: Partial<Chat>) {
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

  updateChatsDeleteChatAsync(chatId: string) {
    update<Chat[]>('chats', (chats) => {
      if (!chats) {
        return [];
      }
      return chats.filter((foundChat) => foundChat.id !== chatId);
    }).finally();
  }

  //*******************************************************************************************************************

  getAllConversationsAsync(): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || []);
  }

  getConversationsAsync(conversationIds: string[]): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || [])
      .then((conversations) => conversations.filter((foundConversation) => conversationIds.includes(foundConversation.id)));
  }

  updateConversationsCreateConversationAsync(conversation: Conversation) {
    update<Conversation[]>('conversations', (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }).finally();
  }

  updateConversationsUpdateConversationAsync(conversationId: string, conversation: Partial<Conversation>) {
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

  updateConversationsDeleteConversationAsync(conversationId: string) {
    update<Conversation[]>('conversations', (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.id !== conversationId);
    }).finally();
  }

  updateConversationsDeleteConversationsAsync(conversationIds: string[]) {
    update<Conversation[]>('conversations', (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => !conversationIds.includes(foundConversation.id));
    }).finally();
  }

  //*******************************************************************************************************************

  getUsage(): Usage {
    return this.usage.get();
  }

  getTokensPerChar(): number {
    const usage = this.usage.get();
    if (usage.charCount === 0) {
      return 0.25;
    }
    return usage.tokens / usage.charCount;
  }

  increaseUsage(usage: Partial<Usage>) {
    const prev = this.usage.get();
    this.usage.set({
      tokens: prev.tokens + (usage.tokens ?? 0),
      charCount: prev.charCount + (usage.charCount ?? 0),
      image_256: prev.image_256 + (usage.image_256 ?? 0),
      image_512: prev.image_512 + (usage.image_512 ?? 0),
      image_1024: prev.image_1024 + (usage.image_1024 ?? 0),
    } as Usage);
  }

  //*******************************************************************************************************************

  getSettings(): Settings {
    return this.settings.get();
  }

  updateSettings(settings: Partial<Settings>) {
    this.settings.update(settings);
  }
}

const store = new Store();
export default store;
