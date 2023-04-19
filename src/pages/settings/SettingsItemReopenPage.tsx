import {Button, ButtonGroup, Checkbox, FormControlLabel, useTheme} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import store from "../../utils/store";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function SettingsItemReopenPage() {
  const theme = useTheme();

  const [reopenPage, _setReopenPage] = useState(store.reopenPage.get())

  const setReopenPage = (reopenPage: boolean) => {
    _setReopenPage(reopenPage)
    store.reopenPage.set(reopenPage)
  }

  return (
    <SettingsItem
      title={"Startup page"}
    >
      <Box>
        <FormControlLabel
          control={
            <Checkbox
              checked={reopenPage}
              onChange={(event) => setReopenPage(event.target.checked)}
            />
          }
          label={
            <Typography
              sx={{
                fontSize: theme.typography.body2.fontSize,
              }}
            >
              {"Reopen chat on startup"}
            </Typography>
          }
        />
      </Box>
    </SettingsItem>
  );
}
