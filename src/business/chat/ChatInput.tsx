import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, InputAdornment, TextField, useMediaQuery} from "@mui/material";
import {SendRounded} from "@mui/icons-material";
import store from "../../util/store";

interface ChatInputProps {
  isLoading: boolean,
  handleRequest: (input: string) => void
}

export default function ChatInput(props: ChatInputProps) {
  const { isLoading, handleRequest } = props

  const [composition, setComposition] = useState(false)
  const [input, setInput] = useState('')

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (store.getSettings().send_on_enter) {
      if (event.key === 'Enter' && !event.shiftKey && !composition) {
        event.preventDefault()
        if (canRequest()) {
          request()
        }
      }
    } else {
      if (event.key === 'Enter' && event.metaKey && !composition) {
        event.preventDefault()
        if (canRequest()) {
          request()
        }
      }
    }
  }

  function canRequest(): boolean {
    return input !== '' && !isLoading
  }

  const request = () => {
    const currInput = input
    setInput('')
    handleRequest(currInput)
  }

  const isNotSmallPage = useMediaQuery(`(min-width:600px)`)

  return (
    <Card
      elevation={4}
      sx={{
        marginX: isNotSmallPage ? '16px' : '0px',
        padding: '16px',
        borderRadius: '0px',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <TextField
        variant={'standard'}
        fullWidth={true}
        multiline={true}
        maxRows={8}
        placeholder={'Send a message...'}
        value={input}
        autoFocus={true}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onCompositionStart={() => setComposition(true)}
        onCompositionEnd={() => setComposition(false)}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position={'end'}
              sx={{
                alignItems: 'end',
                alignSelf: 'end',
              }}
            >
              <IconButton
                size={'small'}
                disabled={!canRequest()}
                onClick={request}
              >
                <SendRounded />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Card>
  );
}
