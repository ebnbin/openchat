import React, {ChangeEvent, useState} from "react";
import {
  Button,
  Card,
  IconButton, TextField
} from "@mui/material";
import Box from "@mui/material/Box";
import {SendRounded} from "@mui/icons-material";
import {api} from "../../util/util";
import {ImageData} from "./ImagePage";
import store from "../../util/store";
import {Usage} from "../../util/data";
import {CreateImageRequestSizeEnum} from "openai";

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

  const [size, setSize] = useState<CreateImageRequestSizeEnum>(CreateImageRequestSizeEnum._256x256)

  const sizeLabel = () => {
    switch (size) {
      case "256x256":
        return '256'
      case '512x512':
        return '512'
      case '1024x1024':
        return '1024'
    }
  }

  const updateSize = () => {
    switch (size) {
      case "256x256":
        setSize(CreateImageRequestSizeEnum._512x512)
        break
      case '512x512':
        setSize(CreateImageRequestSizeEnum._1024x1024)
        break
      case '1024x1024':
        setSize(CreateImageRequestSizeEnum._256x256)
        break
    }
  }

  const request = () => {
    const imageData = {
      prompt: input,
      size: size,
      url: '',
      error: false,
    } as ImageData
    setInput('')
    handleRequestStart(imageData)
    setIsLoading(true)

    api()
      .createImage({
        prompt: imageData.prompt,
        size: imageData.size,
      })
      .then(response => {
        store.updateUsage({
          tokens: 0,
          image_256: imageData.size === "256x256" ? 1 : 0,
          image_512: imageData.size === "512x512" ? 1 : 0,
          image_1024: imageData.size === "1024x1024" ? 1 : 0,
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
          label={'Prompt'}
          placeholder={'A cute baby sea otter'}
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
        <Button
          disabled={isLoading}
          onClick={updateSize}
        >
          {sizeLabel()}
        </Button>
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
