import {Configuration, OpenAIApi} from "openai";

export function api(apiKey: string): OpenAIApi {
  const configuration = new Configuration({
    apiKey: apiKey,
  })
  return new OpenAIApi(configuration)
}
