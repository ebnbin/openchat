import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import {Theme} from "../../utils/types";
import SettingsItemTheme from "./SettingsItemTheme";
import SettingsItemSendOnEnter from "./SettingsItemSendOnEnter";
import SettingsItemReopenPage from "./SettingsItemReopenPage";
import SettingsItemOpenAIAPI from "./SettingsItemOpenAIAPI";
import SettingsItemBackupAndRestore from "./SettingsItemBackupAndRestore";
import SettingsItemClearData from "./SettingsItemClearData";

interface SettingsDialogProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={props.handleDialogClose}
    >
      <DialogTitle>
        {"Settings"}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <SettingsItemTheme
          theme={props.theme}
          setTheme={props.setTheme}
        />
        <SettingsItemSendOnEnter/>
        <SettingsItemReopenPage/>
        <SettingsItemOpenAIAPI/>
        <SettingsItemBackupAndRestore
          handleDialogClose={props.handleDialogClose}
        />
        <SettingsItemClearData
          handleDialogClose={props.handleDialogClose}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={props.handleDialogClose}
        >
          {"OK"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
