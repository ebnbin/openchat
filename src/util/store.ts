import {AppData, ChatData} from "./data";

class Store {
  private appData: AppData;

  constructor() {
    this.appData = this.readAppData();
  }

  private readAppData(): AppData {
    const appDataJson = localStorage.getItem('app');
    if (appDataJson) {
      return JSON.parse(appDataJson);
    }
    return {
      version: 100, // 0.1.0
      openai_api_key: '',
      chats: [],
    } as AppData;
  }

  private writeAppData(appData: AppData) {
    const appDataJson = JSON.stringify(appData);
    localStorage.setItem('app', appDataJson);
  }

  public getOpenAIApiKey(): string {
    return this.appData.openai_api_key;
  }

  public setOpenAIApiKey(openAIApiKey: string) {
    this.appData = {
      ...this.appData,
      openai_api_key: openAIApiKey,
    } as AppData;
    this.writeAppData(this.appData);
  }

  public getChatsData(): ChatData[] {
    return this.appData.chats;
  }

  public setChatsData(chats: ChatData[]) {
    this.appData = {
      ...this.appData,
      chats: chats,
    } as AppData;
    this.writeAppData(this.appData);
  }
}

const store = new Store();
export default store;
