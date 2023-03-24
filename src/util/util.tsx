import {Configuration, OpenAIApi} from "openai";
import { useState, useEffect } from 'react';
import store from "./store";

export function api(apiKey: string = store.appData.openai_api_key): OpenAIApi {
  const configuration = new Configuration({
    apiKey: apiKey,
  })
  return new OpenAIApi(configuration)
}

export function copy(text: string): void {
  const textField = document.createElement('textarea');
  textField.value = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
}

function checkIsDarkMode(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (err) {
    return false;
  }
}

export function useIsDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(checkIsDarkMode());

  useEffect(() => {
    const mqList = window.matchMedia('(prefers-color-scheme: dark)');

    const listener = (event: MediaQueryListEvent) => {
      setIsDarkMode(event.matches);
    };

    mqList.addEventListener('change', listener);

    return () => {
      mqList.removeEventListener('change', listener);
    };
  }, []);

  return isDarkMode;
}
