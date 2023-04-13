import Box from "@mui/material/Box";
import {IconButton, Popover, Theme, useTheme} from "@mui/material";
import React, {useState} from "react";
import {
  amber,
  blue, blueGrey, brown,
  cyan, deepOrange,
  deepPurple,
  green, grey,
  indigo,
  lightBlue,
  lightGreen, lime, orange,
  pink,
  purple,
  red,
  teal, yellow
} from "@mui/material/colors";
import {PaletteRounded} from "@mui/icons-material";

export const colorValue = (theme: Theme, color: string) => {
  const isDarkMode = theme.palette.mode === 'dark';
  const index = isDarkMode ? 'A100' : '700';
  switch (color) {
    case '':
      return 'transparent';
    case 'red':
      return red[index];
    case 'pink':
      return pink[index];
    case 'purple':
      return purple[index];
    case 'deepPurple':
      return deepPurple[index];
    case 'indigo':
      return indigo[index];
    case 'blue':
      return blue[index];
    case 'lightBlue':
      return lightBlue[index];
    case 'cyan':
      return cyan[index];
    case 'teal':
      return teal[index];
    case 'green':
      return green[index];
    case 'lightGreen':
      return lightGreen[index];
    case 'lime':
      return lime[index];
    case 'yellow':
      return yellow[index];
    case 'amber':
      return amber[index];
    case 'orange':
      return orange[index];
    case 'deepOrange':
      return deepOrange[index];
    case 'brown':
      return brown[index];
    case 'grey':
      return grey[index];
    case 'blueGrey':
      return blueGrey[index];
    default:
      return 'transparent';
  }
}

interface ColorPickerProps {
  color: string;
  setColor: (color: string) => void;
}

export default function ColorPicker(props: ColorPickerProps) {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleColorClick = (color: string) => {
    props.setColor(color);
    handleClose();
  }

  const open = Boolean(anchorEl);

  const colors = [
    [
      '',
      'red',
      'pink',
      'purple',
      'deepPurple',
    ],
    [
      'indigo',
      'blue',
      'lightBlue',
      'cyan',
      'teal',
    ],
    [
      'green',
      'lightGreen',
      'lime',
      'yellow',
      'amber',
    ],
    [
      'orange',
      'deepOrange',
      'brown',
      'grey',
      'blueGrey',
    ],
  ];

  return (
    <Box>
      <IconButton
        onClick={handleClick}
      >
        <PaletteRounded/>
      </IconButton>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {colors.map((row, index) => (
          <Box
            key={index}
            sx={{
              width: '200px',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            {row.map((color, index) => (
              <Box
                key={index}
                onClick={() => handleColorClick(color)}
                sx={{
                  flexGrow: 1,
                  flexShrink: 0,
                  height: '40px',
                  bgcolor: colorValue(theme, color),
                }}
              />
            ))}
          </Box>
        ))}
      </Popover>
    </Box>
  )
}
