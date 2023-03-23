import React, {ChangeEvent} from "react";
import {Card, IconButton, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";

interface InputCardProps {
  input: string
  setInput: (input: string) => void
  isRequesting: boolean
  request: () => void
}

export default function ChatInputCard(props: InputCardProps) {
  const { input, setInput, isRequesting, request } = props

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (input !== '') {
        request()
      }
    }
  }

  return (
    <Card
      elevation={8}
      sx={{
        width: '100%',
        padding: '16px',
        paddingTop: '8px',
        borderRadius: 0,
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
        }}
      >
        <TextField
          variant={'standard'}
          fullWidth={true}
          multiline={true}
          maxRows={8}
          label={'Message'}
          placeholder={'Hello, who are you?'}
          value={input}
          autoFocus={true}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            flexGrow: 1,
          }}
        />
        <IconButton
          disabled={input === '' || isRequesting}
          onClick={request}
        >
          <SendRounded />
        </IconButton>
      </Box>
    </Card>
  )
}
