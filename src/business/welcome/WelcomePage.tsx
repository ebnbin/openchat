import {Box} from "@mui/material";
import React from "react";
import LogoImage from "./LogoImage";

export default function WelcomePage() {
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
      <Box
        sx={{
          margin: 'auto',
        }}
      >
        <LogoImage/>
      </Box>
    </Box>
  )
}
