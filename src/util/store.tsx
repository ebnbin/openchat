import {AppData, Chat} from "./data";
import {AppModel, ChatMessageModel, ChatModel} from "./model";

class Store {
  private appData: AppData;

  private appModel: AppModel;

  constructor() {
    this.appData = this.readAppData();
    this.appModel = this.appDataToAppModel(this.appData);
  }

  private readAppData(): AppData {
    const appDataJson = localStorage.getItem('app_data');
    if (appDataJson) {
      return JSON.parse(appDataJson);
    }
    return {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData;
  }

  private appDataToAppModel(appData: AppData): AppModel {
    return {
      chats: appData.chats.map((chat) => {
        return {
          id: chat.id,
          title: chat.title,
          contextThreshold: chat.context_threshold,
          systemMessage: chat.system_message,
          tokenPerChar: chat.tokens_per_char,
          token: chat.tokens,
        } as ChatModel;
      }),
      chatMessagesMap: new Map<string, ChatMessageModel[]>(),
    } as AppModel;
  }

  private writeAppData(appData: AppData) {
    const appDataJson = JSON.stringify(appData);
    localStorage.setItem('app_data', appDataJson);
  }

  private save() {
    this.writeAppData(this.appData);
  }

  public getOpenAIApiKey(): string {
    return this.appData.openai_api_key;
  }

  public setOpenAIApiKey(openAIApiKey: string) {
    this.appData = {
      ...this.appData,
      openai_api_key: openAIApiKey,
    } as AppData;
    this.save();
  }

  public getChats(): Chat[] {
    return this.appData.chats;
  }

  public setChats(chats: Chat[]) {
    this.appData = {
      ...this.appData,
      chats: chats,
    } as AppData;
    this.save();
  }
}

const store = new Store();
export default store;
