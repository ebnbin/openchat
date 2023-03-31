import logo_dark from "../../logo_dark.png";
import logo_light from "../../logo_light.png";
import React from "react";
import {Container, Link, Typography, useTheme} from "@mui/material";
import Box from "@mui/material/Box";

export default function Logo() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const color = isDarkMode ? '#3f3f3f' : '#bfbfbf';
  return (
    <Container>
      <Box
        sx={{
          width: '100%',
        }}
      >
        <img
          src={isDarkMode ? logo_dark : logo_light}
          alt={'logo'}
          style={{
            width: '192px',
            height: '192px',
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography
          variant={'h4'}
          color={color}
          sx={{
            fontWeight: 'bold',
            userSelect: 'none',
          }}
        >
          OpenChat
        </Typography>
      </Box>
      <Box
        sx={{
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Typography
          variant={'overline'}
          color={color}
          sx={{
            fontSize: '10px',
          }}
        >
          Powered by&nbsp;
        </Typography>
        <Link
          variant={'overline'}
          color={color}
          href={'https://platform.openai.com/'}
          target={'_blank'}
          sx={{
            fontSize: '10px',
          }}
        >
          OpenAI
        </Link>
      </Box>
    </Container>
  );
}
