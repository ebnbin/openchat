import {AppData, Chat} from "../data/data";

class Store {
  private appData: AppData;

  constructor() {
    const storedAppData = localStorage.getItem('app_data');
    if (storedAppData) {
      this.appData = JSON.parse(storedAppData);
    } else {
      this.appData = {
        version: 100, // 0.1.0
        openai_api_key: '',
        chats: [],
      } as AppData;
    }
  }

  private save() {
    localStorage.setItem('app_data', JSON.stringify(this.appData));
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
