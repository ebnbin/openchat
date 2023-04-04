import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, InputAdornment, TextField} from "@mui/material";
import {SendRounded} from "@mui/icons-material";

interface InputCardProps {
  isLoading: boolean,
  handleRequest: (input: string) => void
}

export default function ChatInputCard(props: InputCardProps) {
  const { isLoading, handleRequest } = props

  const [composition, setComposition] = useState(false)
  const [input, setInput] = useState('')

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !composition) {
      event.preventDefault()
      if (canRequest()) {
        request()
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

  return (
    <Card
      elevation={4}
      sx={{
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
