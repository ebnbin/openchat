import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";

interface SettingsItemProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

export default function SettingsItem(props: SettingsItemProps) {
  return (
    <Box
      sx={{
        paddingBottom: "24px",
      }}
    >
      {
        props.title === undefined ? undefined : (
          <Typography
            variant={"subtitle2"}
            gutterBottom={true}
            sx={{
              fontWeight: "bold",
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
            color={"text.secondary"}
            gutterBottom={true}
            sx={{
              whiteSpace: "pre-wrap",
            }}
          >
            {props.description}
          </Typography>
        )
      }
      {props.children}
    </Box>
  );
}
