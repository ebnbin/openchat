import logo from "../assets/logo.png";
import React from "react";
import {Container, Link, Typography} from "@mui/material";
import Box from "@mui/material/Box";

export default function Logo() {
  const color = "#7f7f7f7f";
  return (
    <Container
      sx={{
        userSelect: "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
        }}
      >
        <img
          src={logo}
          alt={"logo"}
          style={{
            width: "192px",
            height: "192px",
          }}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant={"h4"}
          color={color}
          sx={{
            fontWeight: "bold",
          }}
        >
          {"OpenChat"}
        </Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
        }}
      >
        <Typography
          variant={"overline"}
          color={color}
          sx={{
            fontSize: "10px",
          }}
        >
          {"Powered by "}
        </Typography>
        <Link
          variant={"overline"}
          color={color}
          href={"https://platform.openai.com/"}
          target={"_blank"}
          sx={{
            fontSize: "10px",
          }}
        >
          {"OpenAI"}
        </Link>
      </Box>
    </Container>
  );
}
