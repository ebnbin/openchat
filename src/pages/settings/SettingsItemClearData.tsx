import {Button, Chip, Dialog, DialogActions, DialogContent} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import {DeleteRounded} from "@mui/icons-material";
import store from "../../utils/store";
import {useAppContext} from "../app/AppPage";

interface SettingsItemClearDataProps {
  handleDialogClose: () => void;
}

export default function SettingsItemClearData(props: SettingsItemClearDataProps) {
  const appContext = useAppContext();

  const handleDeleteDataClick = () => {
    store.deleteData()
      .then(() => {
        setConfirmDialogOpen(false);
        props.handleDialogClose();
        appContext.reload();
      });
  }

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  return (
    <SettingsItem>
      <Chip
        variant={"outlined"}
        color={"error"}
        label={"Clear data"}
        icon={<DeleteRounded/>}
        onClick={() => setConfirmDialogOpen(true)}
      />
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}>
        <DialogContent>
          {"Are you sure you want to delete all chats and conversations?"}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
          >
            {"Cancel"}
          </Button>
          <Button
            onClick={handleDeleteDataClick}
          >
            {"Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </SettingsItem>
  );
}
