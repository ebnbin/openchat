import React, {ChangeEvent} from "react";
import {TextField} from "@mui/material";

interface ApiKeyProps {
  apiKey: string;
  setApiKey: (apiKey: string) => void;
}

export function ApiKeyPage({ apiKey, setApiKey }: ApiKeyProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <TextField
        label={"OPENAI_API_KEY"}
        value={apiKey}
        onChange={(event) => {
          setApiKey(event.target.value)
        }}
      />
    </div>
  );
}
