import {Button, ButtonGroup} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import store from "../../utils/store";

export default function SettingsItemSendOnEnter() {
  const [sendOnEnter, _setSendOnEnter] = useState(store.sendOnEnter.get())

  const setSendOnEnter = (sendOnEnter: boolean) => {
    _setSendOnEnter(sendOnEnter)
    store.sendOnEnter.set(sendOnEnter)
  }

  return (
    <SettingsItem
      title={"Send message"}
    >
      <ButtonGroup
        size={"small"}
      >
        <Button
          variant={sendOnEnter ? "contained" : "outlined"}
          onClick={() => setSendOnEnter(true)}
          sx={{
            textTransform: "none",
          }}
        >
          {"Enter"}
        </Button>
        <Button
          variant={sendOnEnter ? "outlined" : "contained"}
          onClick={() => setSendOnEnter(false)}
          sx={{
            textTransform: "none",
          }}
        >
          {"Command+Enter"}
        </Button>
      </ButtonGroup>
    </SettingsItem>
  );
}
