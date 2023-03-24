import React, {useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link, TextField,
  Typography
} from "@mui/material";
import Box from "@mui/material/Box";
import store from "../../util/store";

interface SettingsDialogProps {
  open: boolean
  handleClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  const { open, handleClose } = props

  // const handleIsDarkModeChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   setAppData(
  //     {
  //       ...appData,
  //       // isDarkMode: event.target.checked,
  //     } as AppData
  //   )
  // }

  const [openAIApiKey, setOpenAIApiKey] = useState(store.getOpenAIApiKey())

  return (
    <Dialog
      fullWidth={true}
      scroll={'paper'}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>
        Settings
      </DialogTitle>
      <DialogContent
        dividers={true}
        sx={{
          padding: 0,
        }}
      >
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Typography
            variant={'subtitle1'}
            gutterBottom={true}
          >
            API key
          </Typography>
          <Typography
            variant={'body2'}
            color={'text.secondary'}
            gutterBottom={true}
          >
            Visit your&nbsp;
            <Link
              href={'https://platform.openai.com/account/api-keys'}
              target={'_blank'}
            >
              API key
            </Link>
            &nbsp;page to retrieve the API key you'll use in your requests
          </Typography>
          <TextField
            variant={'standard'}
            fullWidth={true}
            type={'text'}
            placeholder={'API key'}
            value={openAIApiKey}
            onChange={(event) => {
              setOpenAIApiKey(event.target.value)
              store.setOpenAIApiKey(event.target.value)
            }}
          />
        </Box>
        {/*<Box*/}
        {/*  sx={{*/}
        {/*    paddingX: '24px',*/}
        {/*    paddingY: '16px',*/}
        {/*  }}*/}
        {/*>*/}
        {/*  <Typography*/}
        {/*    variant={'subtitle1'}*/}
        {/*    gutterBottom={true}*/}
        {/*  >*/}
        {/*    Dark mode*/}
        {/*  </Typography>*/}
        {/*  <Switch*/}
        {/*    checked={settings.isDarkMode}*/}
        {/*    onChange={handleIsDarkModeChange}*/}
        {/*  />*/}
        {/*</Box>*/}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
