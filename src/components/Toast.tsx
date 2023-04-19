import {Alert, Snackbar} from "@mui/material";
import React from "react";
import {AlertColor} from "@mui/material/Alert/Alert";

interface ToastProps {
  open: boolean;
  handleClose: () => void;
  color: AlertColor;
  text: string;
}

export default function Toast(props: ToastProps) {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      open={props.open}
      autoHideDuration={3000}
      onClose={props.handleClose}
    >
      <Alert
        variant={"filled"}
        severity={props.color}
      >
        {props.text}
      </Alert>
    </Snackbar>
  );
}
