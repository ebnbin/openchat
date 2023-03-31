export default class Preference<T> {
  private readonly key: string;
  private readonly defaultValue: T;

  private cacheValue: T;

  private cached: boolean = false;

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;
    this.cacheValue = defaultValue;
  }

  has(): boolean {
    return localStorage.getItem(this.key) !== null;
  }

  get(): T {
    if (this.cached) {
      return this.cacheValue;
    }
    const json = localStorage.getItem(this.key);
    let value: T;
    if (json === null) {
      value = this.defaultValue;
    } else {
      const parsedValue = JSON.parse(json);
      value = {
        ...this.defaultValue,
        ...parsedValue,
      };
    }
    this.cacheValue = value;
    this.cached = true;
    return value;
  }

  set(value: T) {
    if (this.has() && this.get() === value) {
      return;
    }
    this.cacheValue = value;
    this.cached = true;
    const json = JSON.stringify(value);
    localStorage.setItem(this.key, json);
  }

  remove() {
    this.cacheValue = this.defaultValue;
    this.cached = false;
    localStorage.removeItem(this.key);
  }
}
