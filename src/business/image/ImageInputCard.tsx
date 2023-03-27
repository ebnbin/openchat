import React, {ChangeEvent, useState} from "react";
import {Card, IconButton, TextField} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";
import {api} from "../../util/util";
import {ImageData} from "./ImagePage";
import store from "../../util/store";
import {Usage} from "../../util/data";

interface ImageInputCardProps {
  handleRequestStart: (imageData: ImageData) => void
  handleRequestSuccess: (imageData: ImageData) => void
  handleRequestError: (imageData: ImageData) => void
}

export default function ImageInputCard(props: ImageInputCardProps) {
  const { handleRequestStart, handleRequestSuccess, handleRequestError } = props

  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.metaKey) {
      event.preventDefault()
      if (input !== '') {
        request()
      }
    }
  }

  const [input, setInput] = useState('')

  const request = () => {
    const imageData = {
      prompt: input,
      url: '',
      error: false,
    } as ImageData
    setInput('')
    handleRequestStart(imageData)
    setIsLoading(true)

    api()
      .createImage({
        prompt: imageData.prompt,
        size: '256x256',
      })
      .then(response => {
        store.updateUsage({
          tokens: 0,
          image_256: 1,
          image_512: 0,
          image_1024: 0,
        } as Usage)
        const responseImageData = {
          ...imageData,
          url: response.data.data[0].url,
        } as ImageData
        handleRequestSuccess(responseImageData)
        setIsLoading(false)
      })
      .catch(() => {
        const responseImageData = {
          ...imageData,
          error: true,
        } as ImageData
        handleRequestError(responseImageData)
        setIsLoading(false)
      })
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
          disabled={input === '' || isLoading}
          onClick={request}
        >
          <SendRounded />
        </IconButton>
      </Box>
    </Card>
  )
}
