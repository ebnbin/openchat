import {Button, Dialog, DialogActions, DialogContent} from "@mui/material";
import React from "react";

interface ConfirmDialogProps {
  open: boolean;
  handleClose: () => void;
  message: string;
  handleConfirmClick: () => void;
}

export default function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleClose}>
      <DialogContent>
        {props.message}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleClose}
        >
          {"Cancel"}
        </Button>
        <Button
          onClick={() => {
            props.handleConfirmClick();
            props.handleClose();
          }}
        >
          {"OK"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
