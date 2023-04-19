import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import {SettingsRounded} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import React from "react";

interface HomeDrawerContentFooterProps {
  pinMode: boolean,
  handleSettingsClick: () => void,
}

export default function HomeDrawerContentFooter(props: HomeDrawerContentFooterProps) {
  return (
    <ListItem
      disablePadding={true}
      dense={true}
    >
      <ListItemButton
        onClick={props.handleSettingsClick}
        sx={{
          display: props.pinMode ? "none" : undefined,
        }}
      >
        <ListItemIcon>
          <SettingsRounded
            sx={{
              marginLeft: "8px",
            }}
          />
        </ListItemIcon>
        <ListItemText
          primary={"Settings"}
        />
      </ListItemButton>
    </ListItem>
  );
}
