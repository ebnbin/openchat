import Box from "@mui/material/Box";
import {Chip, IconButton} from "@mui/material";
import {AddRounded, BookmarksRounded, CloseRounded, DashboardCustomizeRounded, DoneRounded} from "@mui/icons-material";
import {pageSaveList} from "./HomePage";
import React from "react";

interface HomeDrawerContentHeaderProps {
  pageId: number,
  pinMode: boolean,
  handleNewChatClick: () => void,
  handleSaveListClick: () => void,
  handlePinModeClick: () => void,
  handlePinModeSaveClick: () => void,
  handlePinModeCloseClick: () => void,
}

export default function HomeDrawerContentHeader(props: HomeDrawerContentHeaderProps) {
  return (
    <>
      <Box
        sx={{
          display: props.pinMode ? "none" : "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "48px",
          paddingX: "8px",
        }}
      >
        <Chip
          variant={"outlined"}
          color={"primary"}
          label={"New chat"}
          icon={<AddRounded/>}
          onClick={props.handleNewChatClick}
          sx={{
            marginX: "8px",
            flexGrow: 1,
          }}
        />
        <IconButton
          onClick={props.handleSaveListClick}
          color={props.pageId === pageSaveList ? "primary" : "default"}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <BookmarksRounded/>
        </IconButton>
        <IconButton
          onClick={props.handlePinModeClick}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <DashboardCustomizeRounded/>
        </IconButton>
      </Box>
      <Box
        sx={{
          display: props.pinMode ? "flex" : "none",
          flexDirection: "row",
          alignItems: "center",
          height: "48px",
          paddingX: "8px",
        }}
      >
        <Chip
          variant={"filled"}
          label={"Customize your pins"}
          color={"info"}
          sx={{
            marginX: "8px",
            flexGrow: 1,
          }}
        />
        <IconButton
          onClick={props.handlePinModeCloseClick}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <CloseRounded/>
        </IconButton>
        <IconButton
          onClick={props.handlePinModeSaveClick}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <DoneRounded/>
        </IconButton>
      </Box>
    </>
  );
}
