export default class LocalStorageItem<T> {
  private readonly key: string;
  private readonly defaultValue: T;

  private cacheValue: T | undefined = undefined;

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  public get(): T {
    if (this.cacheValue !== undefined) {
      return this.cacheValue;
    }
    const json = localStorage.getItem(this.key);
    if (json) {
      const value = JSON.parse(json);
      this.cacheValue = value;
      return value;
    }
    return this.defaultValue;
  }

  public set(value: T) {
    if (this.cacheValue === value) {
      return;
    }
    this.cacheValue = value;
    const json = JSON.stringify(value);
    localStorage.setItem(this.key, json);
  }

  public remove() {
    this.cacheValue = undefined;
    localStorage.removeItem(this.key);
  }
}
