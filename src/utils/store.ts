import {Chat, Conversation, Data, Theme, Usage} from "./types";
import {del, get, set, update} from "idb-keyval";
import Preference from "./Preference";
import {Dispatch, SetStateAction} from "react";

class Store {
  readonly version: Preference<number> = new Preference("version", 0);
  readonly theme: Preference<Theme> = new Preference("theme", "system");
  readonly darkThemeForCodeBlock: Preference<boolean> = new Preference("dark_theme_for_code_block", false);
  readonly sendOnEnter: Preference<boolean> = new Preference("send_on_enter", true);
  readonly reopenPage: Preference<boolean> = new Preference("reopen_page", false);
  readonly reopenPageId: Preference<number> = new Preference("reopen_page_id", 0);
  readonly openAIAPIKey: Preference<string> = new Preference("openai_api_key", "");
  readonly githubToken: Preference<string> = new Preference("github_token", "");
  readonly githubGistId: Preference<string> = new Preference("github_gist_id", "");
  readonly usage: Preference<Usage> = new Preference("usage", {
    conversation_count: 0,
    token_count: 0,
  } as Usage);
  readonly pinChats: Preference<number[]> = new Preference("pin_chats", []);

  //*******************************************************************************************************************

  async migrate() {
    const currentVersion = 502; // 0.5.2
    const storedVersion = this.version.get();
    // TODO
    if (storedVersion < currentVersion) {
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
    return get<Chat[]>("chats")
      .then((chats) => chats || []);
  }

  updateChatsCreateChat(chat: Chat, state?: [Chat[], Dispatch<SetStateAction<Chat[]>>]) {
    if (state) {
      state[1]((chats) => {
        return [...chats, chat]
      });
    }

    update<Chat[]>("chats", (chats) => {
      return chats ? [...chats, chat] : [chat];
    }).finally();
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
    }).finally();
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
    }).finally();
  }

  //*******************************************************************************************************************

  getConversations(chatId?: number): Promise<Conversation[]> {
    return get<Conversation[]>("conversations")
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

  //*******************************************************************************************************************
  //*******************************************************************************************************************

  getDataAsync(): Promise<Data> {
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

  setData(data: Data): Promise<void> {
    return Promise.all([
      set("chats", data.chats),
      set("conversations", data.conversations),
    ]).then(() => {
    });
  }

  //*******************************************************************************************************************

  updateConversationsCreateConversationAsync(conversation: Conversation) {
    update<Conversation[]>("conversations", (conversations) => {
      return conversations ? [...conversations, conversation] : [conversation];
    }).finally();
  }

  updateConversationsUpdateConversationAsync(conversationId: number, conversation: Partial<Conversation>) {
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
    }).finally();
  }

  updateConversationsDeleteConversationAsync(conversationId: number) {
    update<Conversation[]>("conversations", (conversations) => {
      if (!conversations) {
        return [];
      }
      return conversations.filter((foundConversation) => foundConversation.id !== conversationId);
    }).finally();
  }

  updateConversationsDeleteConversationsAsync(chatId: number) {
    update<Conversation[]>("conversations", (conversations) => {
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
    del("chats").finally();
    del("conversations").finally();
  }
}

const store = new Store();
export default store;
