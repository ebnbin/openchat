import {AppData} from "../data/data";

class Store {
  appData: AppData;

  constructor() {
    const storedAppData = localStorage.getItem('app_data')
    if (storedAppData) {
      this.appData = JSON.parse(storedAppData)
    } else {
      this.appData = {
        version: 100, // 0.1.0
        openai_api_key: '',
        chats: [],
      } as AppData
    }
  }

  private save() {
    localStorage.setItem('app_data', JSON.stringify(this.appData))
  }

  public setAppData(appData: AppData) {
    this.appData = appData
    this.save()
  }

  public setOpenAIApiKey(openAIApiKey: string) {
    this.appData = {
      ...this.appData,
      openai_api_key: openAIApiKey,
    } as AppData
    this.save()
  }
}

const store = new Store();
export default store
