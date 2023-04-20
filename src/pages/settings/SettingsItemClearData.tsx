import {Chip} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import {DeleteRounded} from "@mui/icons-material";
import store from "../../utils/store";
import {useAppContext} from "../app/AppPage";
import ConfirmDialog from "../../components/ConfirmDialog";

interface SettingsItemClearDataProps {
  handleDialogClose: () => void;
}

export default function SettingsItemClearData(props: SettingsItemClearDataProps) {
  const appContext = useAppContext();

  const handleDeleteDataClick = () => {
    store.deleteData()
      .then(() => {
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
      <ConfirmDialog
        open={confirmDialogOpen}
        handleClose={() => setConfirmDialogOpen(false)}
        message={"Are you sure you want to delete all chats and conversations?"}
        handleConfirmClick={handleDeleteDataClick}
      />
    </SettingsItem>
  );
}
