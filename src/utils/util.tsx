import {Configuration, OpenAIApi} from "openai";
import { useState, useEffect } from "react";
import store from "./store";

export function openAIApi(): OpenAIApi {
  const configuration = new Configuration({
    apiKey: store.openAIApiKey.get(),
  });
  return new OpenAIApi(configuration);
}

export async function copy(text: string, callback: ((success: boolean) => void) | null): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    if (callback) {
      callback(true);
    }
  } catch (error) {
    if (callback) {
      callback(false);
    }
  }
}

export function useDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleDarkModeChange = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    }

    const darkModeMediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");

    setIsDarkMode(darkModeMediaQueryList.matches);

    darkModeMediaQueryList.addEventListener("change", handleDarkModeChange);

    return () => {
      darkModeMediaQueryList.removeEventListener("change", handleDarkModeChange);
    }
  }, []);

  return isDarkMode;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunkedArr: T[][] = [];
  while (arr.length) {
    chunkedArr.push(arr.splice(0, size));
  }
  return chunkedArr;
}

export const widePageWidth = 1200;

interface OpenAIModel {
  model: string,
  maxTokens: number,
  extraCharsPerMessage: number,
}

export const defaultOpenAIModel: OpenAIModel = {
  model: "gpt-3.5-turbo",
  maxTokens: 4096,
  extraCharsPerMessage: 16,
} as const;
