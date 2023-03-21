import React, {useState} from "react";
import {Model} from "openai";
import {Button} from "@mui/material";
import {JsonLog} from "./JsonLog";
import {Settings} from "./data";
import {api} from "./util";

interface ListModelsProps {
  settings: Settings;
}

// https://platform.openai.com/docs/api-reference/models/list
export function ListModels({ settings }: ListModelsProps) {
  const [response, setResponse] = useState<JSX.Element[]>();
  const [isLoading, setIsLoading] = useState(false);

  const request = async () => {
    setIsLoading(true)

    const response = await api(settings.apiKey)
      .listModels()
      .catch(() => {
        setIsLoading(false)
      });
    const listItems = response!!.data.data.map((item: Model) =>
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
        disabled={settings.apiKey.length === 0 || isLoading}
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
