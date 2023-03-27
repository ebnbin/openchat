import Box from "@mui/material/Box";
import React, {useState} from "react";
import {contentWidth} from "../chat/ChatPage";
import ImageInputCard from "./ImageInputCard";
import {CircularProgress, Typography} from "@mui/material";
import {CreateImageRequestSizeEnum} from "openai";

export interface ImageData {
  prompt: string;
  size: CreateImageRequestSizeEnum,
  url: string;
  error: boolean;
}

export default function ImagePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null)

  const imageSize = () => {
    if (imageData === null) {
      return 'auto'
    }
    switch (imageData.size) {
      case "1024x1024":
        return '1024px'
      case "256x256":
        return '256px'
      case "512x512":
        return '512px'
    }
  }

  const content = () => {
    if (imageData === null) {
      return <></>
    }
    if (imageData.url !== '') {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: 'flex',
            paddingBottom: '72px',
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <img
              src={imageData.url}
              style={{
                maxWidth: imageSize(),
                maxHeight: imageSize(),
              }}
            />
          </Box>
        </Box>
      )
    }
    if (imageData.error) {
      return (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: 'flex',
            paddingBottom: '72px',
          }}
        >
          <Box
            sx={{
              margin: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography>
              Error
            </Typography>
          </Box>
        </Box>
      )
    }
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          display: 'flex',
          paddingBottom: '72px',
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {content()}
      <Box
        sx={{
          width: '100%',
          position: 'absolute',
          bottom: 0,
        }}
      >
        <Box
          sx={{
            maxWidth: contentWidth,
            margin: '0 auto',
          }}
        >
          <ImageInputCard
            handleRequestStart={(imageData) => {
              setImageData(imageData)
            }}
            handleRequestSuccess={(imageData) => {
              setImageData(imageData)
            }}
            handleRequestError={(imageData) => {
              setImageData(imageData)
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}
