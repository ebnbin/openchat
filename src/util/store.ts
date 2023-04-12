import {Chat, Conversation, Data, Usage} from "./data";
import {get, set, update} from "idb-keyval";

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

  getDataAsync(): Promise<Data> {
    return Promise.all([this.getChatsAsync(), this.getAllConversationsAsync(), this.getUsageAsync()])
      .then(([chats, conversations, usage]) => {
        return {
          chats,
          conversations,
          usage,
        } as Data;
      });
  }

  setData(data: Data): Promise<void> {
    return Promise.all([
      set('chats', data.chats),
      set('conversations', data.conversations),
      set('usage', data.usage),
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
      tokens_per_char: 0,
      tokens: 0,
      conversations: [],
    };
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: `${new Date().getTime()}`,
      user_message: '',
      assistant_message: '',
      deleted: false,
      liked: false,
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
