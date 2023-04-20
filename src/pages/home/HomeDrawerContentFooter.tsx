import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import {GitHub, SettingsRounded} from "@mui/icons-material";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import {Divider} from "@mui/material";

interface HomeDrawerContentFooterProps {
  pinMode: boolean,
  handleSettingsClick: () => void,
}

export default function HomeDrawerContentFooter(props: HomeDrawerContentFooterProps) {
  return (
    <Box
      sx={{
        display: props.pinMode ? "none" : "flex",
        flexDirection: "column",
      }}
    >
      <Divider/>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "48px",
        }}
      >
        <ListItem
          disablePadding={true}
        >
          <ListItemButton
            onClick={props.handleSettingsClick}
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
        <IconButton
          onClick={() => window.open("https://github.com/ebnbin/openchat", "_blank")}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <GitHub/>
        </IconButton>
      </Box>
    </Box>
  );
}
