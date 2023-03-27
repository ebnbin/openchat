import Box from "@mui/material/Box";
import React, {useState} from "react";
import {contentWidth} from "../chat/ChatPage";
import ImageInputCard from "./ImageInputCard";
import {CircularProgress, Typography} from "@mui/material";

export interface ImageData {
  prompt: string;
  url: string;
  error: boolean;
}

export default function ImagePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null)

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
                maxWidth: '256px',
                maxHeight: '256px',
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
