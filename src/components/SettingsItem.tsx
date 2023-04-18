import {Typography, useTheme} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

interface SettingsItemProps {
  title?: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

export default function SettingsItem(props: SettingsItemProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        marginBottom: "24px",
      }}
    >
      {
        props.title === undefined ? undefined : (
          <Typography
            variant={"subtitle2"}
            sx={{
              fontWeight: "bold",
              marginY: "4px",
            }}
          >
            {props.title}
          </Typography>
        )
      }
      {
        props.description === undefined ? undefined : (
          <Typography
            variant={"body2"}
            color={theme.palette.text.secondary}
            sx={{
              whiteSpace: "pre-wrap",
              marginY: "4px",
            }}
          >
            {props.description}
          </Typography>
        )
      }
      {
        props.children === undefined ? undefined : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              marginY: "4px",
            }}
          >
            {props.children}
          </Box>
        )
      }
    </Box>
  );
}
