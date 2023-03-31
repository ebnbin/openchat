import React, {useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent, DialogContentText,
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
  const [githubToken, setGithubToken] = useState(store.getGithubToken())
  const [githubGistId, setGithubGistId] = useState(store.getGithubGistId())

  const usage = store.getUsage()

  const price = () => {
    return (usage.tokens / 1000 * 0.002 + usage.image_256 * 0.016 + usage.image_512 * 0.018 + usage.image_1024 * 0.02).toFixed(2)
  }

  const gistOnClick = () => {
    // fetch('https://api.github.com/gists', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${githubToken}`,
    //     'Accept': 'application/vnd.github.v3+json',
    //   },
    //   body: JSON.stringify(
    //     {
    //       'public': false,
    //       'files': {
    //         'openchat_data.json': {
    //           'content': JSON.stringify(store.getAppData()),
    //         }
    //       },
    //     }
    //   )
    // })
    //   .then(response => alert(`success`))
    //   .catch(error => alert('error'));

    fetch(`https://api.github.com/gists/${githubGistId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(
        {
          'files': {
            'openchat_data.json': {
              'content': store.getDataJson(),
            }
          },
        }
      )
    })
      .then(response => alert(`success`))
      .catch(error => alert('error'));
  }

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
            GitHub token
          </Typography>
          <TextField
            variant={'standard'}
            fullWidth={true}
            type={'text'}
            placeholder={'GitHub token'}
            value={githubToken}
            onChange={(event) => {
              setGithubToken(event.target.value)
              store.setGithubToken(event.target.value)
            }}
          />
        </Box>
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
            GitHub gist id
          </Typography>
          <TextField
            variant={'standard'}
            fullWidth={true}
            type={'text'}
            placeholder={'GitHub gist id'}
            value={githubGistId}
            onChange={(event) => {
              setGithubGistId(event.target.value)
              store.setGithubGistId(event.target.value)
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
            Usage
          </Typography>
          <DialogContentText>
            tokens: {usage.tokens}
            <br/>
            image_256: {usage.image_256}
            <br/>
            image_512: {usage.image_512}
            <br/>
            image_1024: {usage.image_1024}
            <br/>
            Estimated price: ${price()}
          </DialogContentText>
        </Box>
        <Box
          sx={{
            paddingX: '24px',
            paddingY: '16px',
          }}
        >
          <Button
            onClick={gistOnClick}
          >
            Test gist upload
          </Button>
        </Box>
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
