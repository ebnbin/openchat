import {Configuration, OpenAIApi} from "openai";
import store from "./store";

export function openAIApi(): OpenAIApi {
  const configuration = new Configuration({
    apiKey: store.openAIApiKey.get(),
  });
  return new OpenAIApi(configuration);
}

export function copy(text: string) {
  navigator.clipboard.writeText(text).finally();
}

export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  while (array.length) {
    result.push(array.splice(0, size));
  }
  return result;
}

export function dateTimeString(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export const widePageWidth = 1200;
export const narrowPageWidth = 600;
export const maxContentWidth = 900;

interface OpenAIModel {
  model: string,
  maxTokens: number,
  tokensPerChar: number,
  extraCharsPerMessage: number,
}

export const defaultOpenAIModel: OpenAIModel = {
  model: "gpt-3.5-turbo",
  maxTokens: 4096,
  tokensPerChar: 0.25,
  extraCharsPerMessage: 16,
} as const;
