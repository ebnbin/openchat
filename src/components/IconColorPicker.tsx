import Box from "@mui/material/Box";
import {Icon, Popover, useTheme} from "@mui/material";
import React from "react";
import {ICON_COLORS, IconColor} from "../utils/types";
import {iconColorValue} from "./ChatIcon";
import {chunk} from "../utils/utils";
import {InvertColorsRounded} from "@mui/icons-material";

interface IconColorPickerProps {
  anchorEl: HTMLButtonElement | null;
  setAnchorEl: (anchorEl: HTMLButtonElement | null) => void;
  setIconColor: (iconColor: IconColor) => void;
}

export default function IconColorPicker(props: IconColorPickerProps) {
  const theme = useTheme();

  const handlePopoverClose = (iconColor: IconColor | null) => {
    if (iconColor !== null) {
      props.setIconColor(iconColor);
    }
    props.setAnchorEl(null);
  }

  return (
    <Popover
      anchorEl={props.anchorEl}
      open={props.anchorEl !== null}
      onClose={() => handlePopoverClose(null)}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      {chunk([...ICON_COLORS], 5).map((row, index) => (
        <Box
          key={index}
          sx={{
            width: "200px",
            display: "flex",
            flexDirection: "row",
          }}
        >
          {row.map((iconColor, index) => (
            <Box
              key={index}
              onClick={() => handlePopoverClose(iconColor)}
              sx={{
                flexGrow: 1,
                height: "40px",
                bgcolor: iconColorValue(theme.palette.mode === "dark", iconColor),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {iconColor === "" ? <InvertColorsRounded/>: <Icon/>}
            </Box>
          ))}
        </Box>
      ))}
    </Popover>
  );
}
