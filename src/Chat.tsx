import {useState} from "react";
import {ChatCompletionRequestMessage} from "openai";
import Box from "@mui/material/Box";
import {Button, Card, IconButton, TextField} from "@mui/material";
import SendIcon from "@mui/icons-material/SendRounded";

interface ChatProps {
  apiKey: string
  model: string
}

export function Chat(props: ChatProps) {
  const { apiKey, model } = props

  const [messages, setMessages] = useState<ChatCompletionRequestMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')

  const request = async () => {
  }

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      width={'100%'}
      height={'100%'}
      position={'relative'}
    >
      <Box
        width={'100%'}
        flexGrow={1}
        overflow={'auto'}
        padding={'16px'}
        paddingBottom={'88px'}
      >
        <Box
          maxWidth={960}
          margin={'0 auto'}
        >
          {/* content */}
        </Box>
      </Box>
      <Box
        width={'100%'}
        flexShrink={0}
        position={'absolute'}
        bottom={0}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 992,
            margin: '0 auto',
            padding: '16px',
            paddingTop: '8px',
            borderRadius: 0,
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
          elevation={8}
        >
          <Box
            display={'flex'}
            flexDirection={'row'}
            width={'100%'}
            alignItems={'flex-end'}
          >
            <TextField
              variant={'standard'}
              fullWidth={true}
              multiline={true}
              maxRows={8}
              label={'Message'}
              sx={{
                flexGrow: 1,
              }}
            />
            <IconButton>
              <SendIcon/>
            </IconButton>
          </Box>
        </Card>
      </Box>
    </Box>
  )
}
