import ChatRole from "../../components/ChatRole";
import Box from "@mui/material/Box";
import {Button} from "@mui/material";
import {ContentCopyRounded} from "@mui/icons-material";
import {copy} from "../../utils/utils";
import React from "react";

interface MessageItemHeaderProps {
  isUser: boolean,
  message: string,
  context: boolean,
  isRequesting: boolean,
  markdown: boolean,
  setMarkdown: (markdown: boolean) => void,
}

export default function MessageItemHeader(props: MessageItemHeaderProps) {
  const handleUserRoleClick = () => {
    if (props.isRequesting) {
      return;
    }
    props.setMarkdown(!props.markdown);
  }

  return (
    <Box
      sx={{
        height: "44px",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingTop: "12px",
      }}
    >
      <ChatRole
        isUser={props.isUser}
        context={props.context}
        handleClick={handleUserRoleClick}
      />
      <Box
        sx={{
          flexGrow: 1,
        }}
      />
      {props.isRequesting || props.message === "" ? undefined : (
        <Button
          variant={"text"}
          size={"small"}
          color={"info"}
          startIcon={<ContentCopyRounded/>}
          onClick={() => copy(props.message)}
          sx={{
            textTransform: "none",
          }}
        >
          {"Copy"}
        </Button>
      )}
    </Box>
  );
}
