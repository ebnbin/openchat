import logo_light from './../../logo_light.png';
import logo_dark from './../../logo_dark.png';
import {Box, useMediaQuery, useTheme} from "@mui/material";
import React from "react";

export default function WelcomePage() {
  const theme = useTheme()
  const isPageWide = useMediaQuery('(min-width:600px)')
  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'row',
        textAlign: 'center',
        justifyItems: 'center',
        position: 'relative',
      }}
    >
      <img
        src={theme.palette.mode === 'dark' ? logo_dark : logo_light}
        alt={'logo'}
        style={{
          width: isPageWide ? '256px' : '192px',
          height: isPageWide ? '256px' : '192px',
          margin: 'auto',
        }}
      />
    </Box>
  )
}
