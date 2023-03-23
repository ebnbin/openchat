import React, {useState} from "react";
import {Model} from "openai";
import {Button} from "@mui/material";
import {JsonLog} from "./JsonLog";
import {api} from "../util/util";

interface ListModelsProps {
  apiKey: string;
}

// https://platform.openai.com/docs/api-reference/models/list
export function ListModels({ apiKey }: ListModelsProps) {
  const [response, setResponse] = useState<JSX.Element[]>();
  const [isLoading, setIsLoading] = useState(false);

  const request = async () => {
    setIsLoading(true)

    const response = await api(apiKey)
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
