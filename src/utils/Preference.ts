// string, number, boolean, array, object.
export default class Preference<T> {
  readonly key: string;
  readonly defaultValue: T;

  private cached: boolean = false;
  private cacheValue: T;

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
    const storeValue = localStorage.getItem(this.key);
    let value: T;
    if (storeValue === null) {
      value = this.defaultValue;
    } else {
      if (typeof this.defaultValue === "string") {
        value = storeValue as T;
      } else if (typeof this.defaultValue === "number") {
        value = Number(storeValue) as T;
      } else if (typeof this.defaultValue === "boolean") {
        value = (storeValue === "true") as T;
      } else if (Array.isArray(this.defaultValue)) {
        value = JSON.parse(storeValue) as T;
      } else {
        value = {
          ...this.defaultValue,
          ...JSON.parse(storeValue),
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
    let storeValue: string;
    if (typeof value === "string") {
      storeValue = value;
    } else if (typeof value === "number") {
      storeValue = value.toString();
    } else if (typeof value === "boolean") {
      storeValue = value.toString();
    } else {
      storeValue = JSON.stringify(value);
    }
    localStorage.setItem(this.key, storeValue);
  }

  update(value: Partial<T>): T {
    if (typeof value !== "object") {
      throw new Error();
    }
    const newValue = {
      ...this.get(),
      ...value,
    };
    this.set(newValue);
    return newValue;
  }

  remove() {
    this.cacheValue = this.defaultValue;
    this.cached = false;
    localStorage.removeItem(this.key);
  }
}
