import {Configuration, OpenAIApi} from "openai";

export function api(apiKey: string): OpenAIApi {
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
