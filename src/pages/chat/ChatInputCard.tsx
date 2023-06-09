import React, {useState} from "react";
import {Card, IconButton, InputAdornment, TextField, useMediaQuery} from "@mui/material";
import {ExpandCircleDownRounded, SendRounded} from "@mui/icons-material";
import store from "../../utils/store";
import Box from "@mui/material/Box";
import {narrowPageWidth} from "../../utils/utils";
import Toast from "../../components/Toast";

interface ChatInputCardProps {
  isRequesting: boolean;
  messageTemplate: string;
  onRequest: (message: string) => void;
  showScrollToButton: boolean;
  scrollToBottom: () => void;
}

export default function ChatInputCard(props: ChatInputCardProps) {
  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const [composition, setComposition] = useState(false);
  const [input, setInput] = useState("");
  const [toastOpen, setToastOpen] = useState(false);

  const message = props.messageTemplate === "" ? input : props.messageTemplate.replaceAll("{{input}}", input);
  const canRequest = !props.isRequesting && message !== "";

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (store.sendOnEnter.get()) {
      if (event.key === "Enter" && !event.shiftKey && !composition) {
        event.preventDefault();
        handleSendClick();
      }
    } else {
      if (event.key === "Enter" && event.metaKey && !composition) {
        event.preventDefault();
        handleSendClick();
      }
    }
  }

  const handleSendClick = () => {
    if (!canRequest) {
      return;
    }
    if (store.openAIApiKey.get() === "") {
      setToastOpen(true)
      return
    }
    const currentMessage = message;
    setInput("")
    props.onRequest(currentMessage);
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: props.showScrollToButton ? "flex" : "none",
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            onClick={props.scrollToBottom}
            sx={{
              marginBottom: "8px",
            }}
          >
            <ExpandCircleDownRounded/>
          </IconButton>
        </Box>
        <Card
          elevation={4}
          sx={{
            marginX: isNarrowPage ? "0px" : "16px",
            padding: "16px",
            borderRadius: "0px",
            borderTopLeftRadius: "8px",
            borderTopRightRadius: "8px",
          }}
        >
          <TextField
            variant={"standard"}
            fullWidth={true}
            multiline={true}
            maxRows={8}
            placeholder={"Send a message..."}
            value={input}
            autoFocus={true}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onKeyDown}
            onCompositionStart={() => setComposition(true)}
            onCompositionEnd={() => setComposition(false)}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position={"end"}
                  sx={{
                    alignItems: "end",
                    alignSelf: "end",
                  }}
                >
                  <IconButton
                    size={"small"}
                    disabled={!canRequest}
                    onClick={handleSendClick}
                  >
                    <SendRounded/>
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Card>
      </Box>
      <Toast
        open={toastOpen}
        handleClose={() => setToastOpen(false)}
        color={"error"}
        text={"OpenAI API key is not set"}
      />
    </>
  );
}
