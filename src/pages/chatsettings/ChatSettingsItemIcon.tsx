import {Chat, IconTextSize} from "../../utils/types";
import {IconButton, TextField} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import Box from "@mui/material/Box";
import ChatIcon from "../../components/ChatIcon";
import {FormatSizeRounded, PaletteRounded} from "@mui/icons-material";
import IconColorPicker from "../../components/IconColorPicker";

interface ChatSettingsItemIconProps {
  chat: Chat;
  updateChat: (chat: Partial<Chat>) => void;
}

export default function ChatSettingsItemIcon(props: ChatSettingsItemIconProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const nextIconTextSize = (): IconTextSize => {
    switch (props.chat.icon_text_size) {
      case "small":
        return "medium";
      case "medium":
        return "large";
      case "large":
        return "small";
      default:
        return "medium";
    }
  }

  const iconTextSizeIconSize = (): number => {
    switch (props.chat.icon_text_size) {
      case "small":
        return 12;
      case "medium":
        return 24;
      case "large":
        return 36;
      default:
        return 24;
    }
  }

  return (
    <SettingsItem
      title={"Icon"}
    >
      <Box
        display={"flex"}
        flexDirection={"row"}
        alignItems={"end"}
      >
        <ChatIcon
          iconText={props.chat.icon_text}
          iconTextSize={props.chat.icon_text_size}
          iconColor={props.chat.icon_color}
        />
        <TextField
          variant={"outlined"}
          size={"small"}
          label={"Icon text"}
          fullWidth={true}
          placeholder={"😄"}
          value={props.chat.icon_text}
          onChange={(event) => props.updateChat({icon_text: event.target.value})}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            flexGrow: 1,
            marginX: "8px",
            marginTop: "8px",
          }}
        />
        <IconButton
          onClick={() => props.updateChat({icon_text_size: nextIconTextSize()})}
          sx={{
            width: "40px",
            height: "40px",
          }}
        >
          <FormatSizeRounded
            sx={{
              width: `${iconTextSizeIconSize()}px`,
              height: `${iconTextSizeIconSize()}px`,
            }}
          />
        </IconButton>
        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <PaletteRounded/>
        </IconButton>
        <IconColorPicker
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          setIconColor={(iconColor) => props.updateChat({icon_color: iconColor})}
        />
      </Box>
    </SettingsItem>
  );
}
