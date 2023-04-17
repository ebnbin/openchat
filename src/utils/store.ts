import {Chat, Conversation, Data, Usage} from "./types";
import {del, get, set, update} from "idb-keyval";
import Preference from "./Preference";

class Store {
  private readonly usage: Preference<Usage> = new Preference<Usage>('usage', {
    token_count: 0,
    conversation_count: 0,
  } as Usage);

  private readonly version: Preference<number> = new Preference<number>('version', 0);
  readonly theme: Preference<string> = new Preference<string>('theme', 'system');
  readonly openAIApiKey: Preference<string> = new Preference<string>('openai_api_key', '');
  readonly githubToken: Preference<string> = new Preference<string>('github_token', '');
  readonly githubGistId: Preference<string> = new Preference<string>('github_gist_id', '');
  readonly reopenChat: Preference<boolean> = new Preference<boolean>('reopen_chat', false);
  readonly selectedPageId: Preference<number> = new Preference<number>('selected_page_id', 0);
  readonly sendOnEnter: Preference<boolean> = new Preference<boolean>('send_on_enter', true);

  // readonly pinChats: Preference<number[]> = new Preference<number[]>('pin_chats', []);

  setPinChats(pinChats: number[]) {
    localStorage.setItem('pin_chats', JSON.stringify(pinChats));
  }

  getPinChats(): number[] {
    const json = localStorage.getItem('pin_chats');
    if (json === null) {
      return [];
    }
    return JSON.parse(json);
  }

  async migrate() {
    const currentVersion = 502; // 0.5.2
    const storedVersion = this.version.get();
    if (storedVersion < 400) {
      localStorage.clear();
    }
    if (storedVersion < 500) {
      await update<Chat[]>('chats', (chats) => {
        if (!chats) {
          return [];
        }
        return chats.map((chat) => {
          // chat.pin_timestamp = 0;
          return chat;
        });
      });
    }
    if (storedVersion < currentVersion) {
      this.version.set(currentVersion);
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
      temperature: 1,
      update_timestamp: timestamp,
      conversation_count: 0,
      char_count: 0,
      token_count: 0,
    };
  }

  newConversation(conversation: Partial<Conversation>): Conversation {
    return {
      id: Date.now(),
      chat_id: 0,
      user_message: '',
      assistant_message: '',
      finish_reason: '',
      save_timestamp: 0,
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
      .then((conversations) => conversations.filter((conversation) => conversation.save_timestamp !== 0))
      .then((conversations) => conversations.sort((a, b) => b.save_timestamp - a.save_timestamp));
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

  increaseUsage(usage: Partial<Usage>) {
    const prev = this.usage.get();
    this.usage.set({
      token_count: prev.token_count + (usage.token_count ?? 0),
      conversation_count: prev.conversation_count + (usage.conversation_count ?? 0),
    } as Usage);
  }

  //*******************************************************************************************************************

  deleteAllData() {
    del('chats').finally();
    del('conversations').finally();
  }
}

const store = new Store();
export default store;
