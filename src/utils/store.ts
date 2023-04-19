import {Chat, Conversation, Data, Theme, Usage} from "./types";
import {clear, createStore, del, get, set, update, UseStore} from "idb-keyval";
import Preference from "./Preference";
import {Dispatch, SetStateAction} from "react";

class Store {
  readonly version: Preference<number> = new Preference("version", 0);
  readonly theme: Preference<Theme> = new Preference("theme", "system");
  readonly darkThemeForCodeBlock: Preference<boolean> = new Preference("dark_theme_for_code_block", false);
  readonly sendOnEnter: Preference<boolean> = new Preference("send_on_enter", true);
  readonly reopenPage: Preference<boolean> = new Preference("reopen_page", false);
  readonly reopenPageId: Preference<number> = new Preference("reopen_page_id", 0);
  readonly openAIApiKey: Preference<string> = new Preference("openai_api_key", "");
  readonly githubToken: Preference<string> = new Preference("github_token", "");
  readonly githubGistId: Preference<string> = new Preference("github_gist_id", "");
  readonly usage: Preference<Usage> = new Preference("usage", {
    conversation_count: 0,
    token_count: 0,
  } as Usage);
  readonly pinChats: Preference<number[]> = new Preference("pin_chats", []);

  //*******************************************************************************************************************

  readonly idbStore: UseStore = createStore("openchat", "data")

  //*******************************************************************************************************************

  async migrate() {
    const currentVersion = 502; // 0.5.2
    const storedVersion = this.version.get();
    if (storedVersion < currentVersion) {
      localStorage.clear();
      await clear(this.idbStore);
      this.version.set(currentVersion);
    }
  }

  //*******************************************************************************************************************

  newChat(): Chat {
    const timestamp = Date.now();
    return {
      id: timestamp,
      update_timestamp: timestamp,
      title: "",
      icon_text: "",
      icon_text_size: "medium",
      icon_color: "",
      system_message: "",
      user_message_template: "",
      temperature: 1,
      context_threshold: 0.6,
      conversation_count: 0,
      char_count: 0,
      token_count: 0,
    } as Chat;
  }

  newConversation(chatId: number, userMessage: string): Conversation {
    return {
      id: Date.now(),
      chat_id: chatId,
      user_message: userMessage,
      assistant_message: "",
      finish_reason: "",
      save_timestamp: 0,
    };
  }

  //*******************************************************************************************************************

  getChats(): Promise<Chat[]> {
    return get<Chat[]>("chats", this.idbStore)
      .then((chats) => chats || []);
  }

  updateChatsCreateChat(chat: Chat, state?: [Chat[], Dispatch<SetStateAction<Chat[]>>]) {
    if (state) {
      state[1]((chats) => {
        return [...chats, chat];
      });
    }

    update<Chat[]>("chats", (chats) => {
      return chats ? [...chats, chat] : [chat];
    }, this.idbStore).finally();
  }

  updateChatsUpdateChat(chatId: number, chat: Partial<Chat>, state?: [Chat[], Dispatch<SetStateAction<Chat[]>>]) {
    if (state) {
      state[1]((chats) => {
        return chats.map((foundChat) => {
          if (foundChat.id === chatId) {
            return {
              ...foundChat,
              ...chat,
            };
          }
          return foundChat;
        });
      });
    }

    update<Chat[]>("chats", (chats) => {
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
    }, this.idbStore).finally();
  }

  updateChatsDeleteChat(chatId: number, state?: [Chat[], Dispatch<SetStateAction<Chat[]>>]) {
    if (state) {
      state[1]((chats) => {
        return chats.filter((foundChat) => foundChat.id !== chatId);
      });
    }

    update<Chat[]>("chats", (chats) => {
      if (!chats) {
        return [];
      }
      return chats.filter((foundChat) => foundChat.id !== chatId);
    }, this.idbStore).finally();
  }

  //*******************************************************************************************************************

  getConversations(chatId?: number): Promise<Conversation[]> {
    return get<Conversation[]>("conversations", this.idbStore)
      .then((conversations) => conversations || [])
      .then((conversations) => {
        if (chatId) {
          return conversations.filter((conversation) => conversation.chat_id === chatId);
        }
        return conversations;
      });
  }

  getSavedConversations(): Promise<Conversation[]> {
    return this.getConversations()
      .then((conversations) => conversations.filter((conversation) => conversation.save_timestamp !== 0))
      .then((conversations) => conversations.sort((a, b) => b.save_timestamp - a.save_timestamp));
  }

  updateConversationsCreateConversation(conversation: Conversation, state?: [Conversation[], Dispatch<SetStateAction<Conversation[]>>]) {
    if (state) {
      state[1]((conversations) => {
        return [...conversations, conversation];
      });
    }

    update<Conversation[]>("conversations", (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }, this.idbStore).finally();
  }

  updateConversationsUpdateConversation(conversationId: number, conversation: Partial<Conversation>, state?: [Conversation[], Dispatch<SetStateAction<Conversation[]>>]) {
    if (state) {
      state[1]((conversations) => {
        return conversations.map((foundConversation) => {
          if (foundConversation.id === conversationId) {
            return {
              ...foundConversation,
              ...conversation,
            };
          }
          return foundConversation;
        });
      });
    }

    update<Conversation[]>("conversations", (conversations) => {
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
    }, this.idbStore).finally();
  }

  updateConversationsRemoveSavedConversation(conversation: Conversation, state?: [Conversation[], Dispatch<SetStateAction<Conversation[]>>]) {
    if (state) {
      this.internalUpdateConversationsDeleteConversationState(conversation.id, state);
    }

    if (conversation.chat_id === 0) {
      this.internalUpdateConversationsDeleteConversation(conversation.id);
    } else {
      this.updateConversationsUpdateConversation(conversation.id, { save_timestamp: 0 });
    }
  }

  updateConversationsDeleteConversation(conversation: Conversation, state?: [Conversation[], Dispatch<SetStateAction<Conversation[]>>]) {
    if (state) {
      this.internalUpdateConversationsDeleteConversationState(conversation.id, state);
    }

    if (conversation.save_timestamp === 0) {
      this.internalUpdateConversationsDeleteConversation(conversation.id);
    } else {
      this.updateConversationsUpdateConversation(conversation.id, { chat_id: 0 });
    }
  }

  private internalUpdateConversationsDeleteConversationState(conversationId: number, state: [Conversation[], Dispatch<SetStateAction<Conversation[]>>]) {
    state[1]((conversations) => {
      return conversations.filter((foundConversation) => foundConversation.id !== conversationId);
    });
  }

  private internalUpdateConversationsDeleteConversation(conversationId: number) {
    update<Conversation[]>("conversations", (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.id !== conversationId);
    }, this.idbStore).finally();
  }

  updateConversationsDeleteConversations(chatId: number) {
    update<Conversation[]>("conversations", (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.chat_id !== chatId || foundConversation.save_timestamp !== 0);
    }, this.idbStore).finally();
  }

  //*******************************************************************************************************************

  backupData(): Promise<Data> {
    return Promise.all([this.getChats(), this.getConversations()])
      .then(([chats, conversations]) => {
        return {
          version: this.version.get(),
          timestamp: Date.now(),
          chats,
          conversations,
        } as Data;
      });
  }

  restoreData(data: Data): Promise<void> {
    return Promise.all([
      set("chats", data.chats, this.idbStore),
      set("conversations", data.conversations, this.idbStore),
    ]).then(() => {
    });
  }

  deleteData(): Promise<void> {
    return Promise.all([
      del("chats", this.idbStore),
      del("conversations", this.idbStore),
    ]).then(() => {
    });
  }
}

const store = new Store();
export default store;
