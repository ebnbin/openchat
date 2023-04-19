import React, {useContext} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import store from "../../utils/store";
import {Theme} from "../../utils/types";
import SettingsItem from "../../components/SettingsItem";
import {useAppContext} from "../app/AppPage";
import {DeleteRounded} from "@mui/icons-material";
import SettingsItemTheme from "./SettingsItemTheme";
import SettingsItemSendOnEnter from "./SettingsItemSendOnEnter";
import SettingsItemReopenPage from "./SettingsItemReopenPage";
import SettingsItemOpenAIAPI from "./SettingsItemOpenAIAPI";
import SettingsItemBackupAndRestore from "./SettingsItemBackupAndRestore";

interface SettingsDialogProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {

  const appContext = useAppContext();

  const handleDeleteAllDataClick = () => {
    if (window.confirm("Are you sure you want to delete all your data?")) {
      store.deleteData()
        .then(() => {
          props.handleDialogClose();
          appContext.reload();
        });
    }
  }

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
        <SettingsItem>
          <Button
            variant={"outlined"}
            size={"small"}
            color={"error"}
            fullWidth={true}
            startIcon={<DeleteRounded />}
            onClick={handleDeleteAllDataClick}
          >
            Delete all data
          </Button>
        </SettingsItem>
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
