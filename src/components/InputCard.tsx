import React, {useState} from "react";
import {Alert, Card, IconButton, InputAdornment, Snackbar, TextField, useMediaQuery} from "@mui/material";
import {ExpandCircleDownRounded, SendRounded} from "@mui/icons-material";
import store from "../utils/store";
import Box from "@mui/material/Box";
import {narrowPageWidth} from "../utils/utils";

interface InputCardProps {
  isRequesting: boolean;
  messageTemplate: string;
  onRequest: (message: string) => void;
  showScrollToButton: boolean;
  scrollToBottom: () => void;
}

export default function InputCard(props: InputCardProps) {
  const isNarrowPage = !useMediaQuery(`(min-width:${narrowPageWidth}px)`)

  const [composition, setComposition] = useState(false)
  const [input, setInput] = useState("")
  const [snackbarOpen, setSnackbarOpen] = useState(false)

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
    if (store.openAIAPIKey.get() === "") {
      setSnackbarOpen(true)
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
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={"error"}
        >
          {"OpenAI API key is not set"}
        </Alert>
      </Snackbar>
    </>
  );
}
