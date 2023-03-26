import logo_dark from "../../logo_dark.png";
import logo_light from "../../logo_light.png";
import React from "react";
import {useMediaQuery, useTheme} from "@mui/material";

export default function LogoImage() {
  const theme = useTheme()
  const isPageWide = useMediaQuery('(min-width:600px)')
  const size = isPageWide ? '256px' : '192px'
  return (
    <img
      src={theme.palette.mode === 'dark' ? logo_dark : logo_light}
      alt={'logo'}
      style={{
        width: size,
        height: size,
      }}
    />
  )
}
