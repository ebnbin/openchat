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
    const timestamp = new Date().getTime();
    return {
      id: `${timestamp}`,
      title: '',
      icon_text: '',
      icon_text_size: 'medium',
      icon_color: '',
      context_threshold: 0.7,
      system_message: '',
      user_message_template: '',
      update_timestamp: timestamp,
    };
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: `${new Date().getTime()}`,
      chat_id: '',
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

  getLikesConversationIdsAsync(): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || [])
      .then((conversations) => conversations.filter((conversation) => conversation.like_timestamp !== 0))
      .then((conversations) => conversations.sort((a, b) => b.like_timestamp - a.like_timestamp));
  }

  getConversationsAsync(chatId: string): Promise<Conversation[]> {
    return get<Conversation[]>('conversations')
      .then((conversations) => conversations || [])
      .then((conversations) => conversations.filter((conversation) => conversation.chat_id === chatId));
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

  updateConversationsDeleteConversationsAsync(chatId: string) {
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
