import React, {ChangeEvent, useState} from "react";
import {Alert, Card, Chip, IconButton, InputAdornment, Snackbar, TextField, useMediaQuery} from "@mui/material";
import {ExpandCircleDownRounded, SendRounded} from "@mui/icons-material";
import store from "../../util/store";
import Box from "@mui/material/Box";

interface ChatInputProps {
  isLoading: boolean,
  handleRequest: (input: string) => void
  showScrollToButton: boolean,
  handleScrollToBottom: () => void,
}

export default function ChatInput(props: ChatInputProps) {
  const { isLoading, handleRequest } = props

  const [composition, setComposition] = useState(false)
  const [input, setInput] = useState('')

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (store.sendOnEnter.get()) {
      if (event.key === 'Enter' && !event.shiftKey && !composition) {
        event.preventDefault()
        handleSendClick()
      }
    } else {
      if (event.key === 'Enter' && event.metaKey && !composition) {
        event.preventDefault()
        handleSendClick()
      }
    }
  }

  function canRequest(): boolean {
    return input !== '' && !isLoading
  }

  const handleSendClick = () => {
    if (store.openAIApiKey.get() === '') {
      setSnackbarOpen(true)
    } else if (canRequest()) {
      const currInput = input
      setInput('')
      handleRequest(currInput)
    }
  }

  const isNotSmallPage = useMediaQuery(`(min-width:600px)`)

  const [snackbarOpen, setSnackbarOpen] = useState(false)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: props.showScrollToButton ? 'flex' : 'none',
          justifyContent: 'flex-end',
        }}
      >
        <IconButton
          onClick={props.handleScrollToBottom}
          sx={{
            marginBottom: '8px',
          }}
        >
          <ExpandCircleDownRounded/>
        </IconButton>
      </Box>
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
                  onClick={handleSendClick}
                >
                  <SendRounded />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Card>
      <Snackbar
        anchorOrigin={ { vertical: 'bottom', horizontal: 'center' } }
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={'error'}
          sx={{
            width: '100%'
          }}
        >
          {'OpenAI API key is not set'}
        </Alert>
      </Snackbar>
    </Box>
  );
}
