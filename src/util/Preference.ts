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
      if (typeof this.defaultValue === 'string') {
        value = json as T;
      } else if (typeof this.defaultValue === 'number') {
        value = Number(json) as T;
      } else if (typeof this.defaultValue === 'boolean') {
        value = (json === 'true') as T;
      } else {
        const parsedValue = JSON.parse(json);
        value = {
          ...this.defaultValue,
          ...parsedValue,
        };
      }
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
    let json;
    if (typeof value === 'string') {
      json = value;
    } else if (typeof value === 'number') {
      json = value.toString();
    } else if (typeof value === 'boolean') {
      json = value.toString();
    } else {
      json = JSON.stringify(value);
    }
    localStorage.setItem(this.key, json);
  }

  update(value: Partial<T>): T {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      throw new Error('Preference.update() does not support primitive types');
    }
    this.set({
      ...this.get(),
      ...value,
    });
    return this.get();
  }

  remove() {
    this.cacheValue = this.defaultValue;
    this.cached = false;
    localStorage.removeItem(this.key);
  }
}
