import React, {useState} from "react";
import {Configuration, Model, OpenAIApi} from "openai";
import {Button} from "@mui/material";
import {JsonLog} from "./JsonLog";

interface ListModelsProps {
  apiKey: string;
}

// https://platform.openai.com/docs/api-reference/models/list
export function ListModels({ apiKey }: ListModelsProps) {
  const [response, setResponse] = useState<JSX.Element[]>();
  const [isLoading, setIsLoading] = useState(false);

  const { Configuration, OpenAIApi } = require("openai");

  const configuration = new Configuration({
    apiKey: apiKey,
  });
  const openai = new OpenAIApi(configuration);

  const request = async () => {
    setIsLoading(true)

    const response = await openai
      .listModels()
      .catch(() => {
        setIsLoading(false)
      });
    const listItems = response.data.data.map((item: Model) =>
      <li key={item.id}>
        <JsonLog
          object={item}
        />
      </li>
    );
    setResponse(listItems)

    setIsLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <Button
        variant={"contained"}
        disabled={apiKey.length === 0 || isLoading}
        onClick={request}
      >
        {"Request"}
      </Button>
      <ol>
        {response}
      </ol>
    </div>
  );
}
