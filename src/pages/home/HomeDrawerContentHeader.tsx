import Box from "@mui/material/Box";
import {Chip, IconButton, useTheme} from "@mui/material";
import {
  AddRounded,
  BookmarksRounded,
  CloseRounded,
  DashboardCustomizeRounded,
  DoneRounded,
  SearchRounded
} from "@mui/icons-material";
import {pageNewChat, pageSaveList, pageSearch} from "./HomePage";
import React from "react";
import Typography from "@mui/material/Typography";

interface HomeDrawerContentHeaderProps {
  pageId: number,
  pinMode: boolean,
  handleNewChatClick: () => void,
  handleSearchClick: () => void,
  handleSaveListClick: () => void,
  handlePinModeClick: () => void,
  handlePinModeSaveClick: () => void,
  handlePinModeCloseClick: () => void,
}

export default function HomeDrawerContentHeader(props: HomeDrawerContentHeaderProps) {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          display: props.pinMode ? "none" : "flex",
          flexDirection: "row",
          alignItems: "center",
          height: "48px",
        }}
      >
        <Chip
          variant={"outlined"}
          color={props.pageId === pageNewChat ? "primary" : "default"}
          label={"New chat"}
          icon={<AddRounded/>}
          onClick={props.handleNewChatClick}
          sx={{
            marginX: "16px",
            flexGrow: 1,
          }}
        />
        <IconButton
          onClick={props.handleSearchClick}
          color={props.pageId === pageSearch ? "primary" : "default"}
          sx={{
            width: "48px",
            height: "48px",
          }}
        >
          <SearchRounded/>
        </IconButton>
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
        }}
      >
        <Typography
          variant={"body2"}
          color={theme.palette.primary.main}
          sx={{
            marginX: "16px",
            flexGrow: 1,
            textAlign: "center",
          }}
        >
          {"Customize your pins"}
        </Typography>
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
