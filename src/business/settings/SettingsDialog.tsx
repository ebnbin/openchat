import React, {useEffect, useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent, DialogTitle, MenuItem, Select,
  TextField
} from "@mui/material";
import store from "../../util/store";
import {Settings, Usage} from "../../util/data";
import SettingsItem from "../../component/SettingsItem";
import {useDataTimestamp} from "../app/AppPage";
import {DeleteRounded} from "@mui/icons-material";

interface SettingsDialogProps {
  settings: Settings;
  updateSettings: (settingsPartial: Partial<Settings>) => void;
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  const [openAIApiKey, setOpenAIApiKey] = useState(store.getOpenAIApiKey())
  const [githubToken, setGithubToken] = useState(store.getGithubToken())
  const [githubGistId, setGithubGistId] = useState(store.getGithubGistId())

  const [openAIApiUsageText, setOpenAIApiUsageText] = useState('')

  useEffect(() => {
    const usage = store.getUsage()
    setOpenAIApiUsageText(
      `tokens: ${usage.tokens}\nEstimated price: ${price(usage)}`
    );
  }, [props.dialogOpen]);

  const price = (usage: Usage) => {
    return (usage.tokens / 1000 * 0.002).toFixed(2)
  }

  const { dataTimestamp, setDataTimestamp } = useDataTimestamp();

  const gistBackup = () => {
    store.getDataAsync()
      .then(data => {
        fetch(`https://api.github.com/gists/${githubGistId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
          body: JSON.stringify({
            'files': {
              'openchat_data.json': {
                'content': JSON.stringify(data),
              },
            },
          }),
        })
          .then(() => alert(`Upload success`))
          .catch(() => alert('Upload error'));
      })
  }

  const gistRestore = () => {
    fetch(`https://api.github.com/gists/${githubGistId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
      .then((response) => response.json())
      .then((data) => data.files['openchat_data.json'].content)
      .then((content) => store.setData(JSON.parse(content)))
      .then(() => {
        setDataTimestamp({ data: Date.now() })
        alert('Download success');
      })
      .catch(() => alert('Download error'));
  }

  const handleDeleteAllDataClick = () => {
    if (window.confirm('Are you sure you want to delete all your data?')) {
      store.deleteAllData();
      setDataTimestamp({ data: Date.now() })
    }
  }

  const handleCancelClick = () => {
    setOpenAIApiKey(store.getOpenAIApiKey());
    setGithubToken(store.getGithubToken());
    setGithubGistId(store.getGithubGistId());
    props.handleDialogClose();
  }

  const handleSaveClick = () => {
    store.setOpenAIApiKey(openAIApiKey);
    store.setGithubToken(githubToken);
    store.setGithubGistId(githubGistId);
    props.handleDialogClose();
  }

  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={handleCancelClick}
    >
      <DialogTitle>
        {'Settings'}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <SettingsItem
          title={'Dark mode'}
        >
          <Select
            size={'small'}
            value={props.settings.dark_mode}
            onChange={(event) => props.updateSettings({
              dark_mode: event.target.value as string,
            })}
          >
            <MenuItem value={'system'}>System</MenuItem>
            <MenuItem value={'light'}>Light</MenuItem>
            <MenuItem value={'dark'}>Dark</MenuItem>
          </Select>
        </SettingsItem>
        <SettingsItem
          title={'OPENAI_API_KEY'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            placeholder={'OPENAI_API_KEY'}
            value={openAIApiKey}
            onChange={(event) => {
              setOpenAIApiKey(event.target.value)
            }}
          />
        </SettingsItem>
        <SettingsItem
          title={'Backup and restore'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            placeholder={'GitHub token'}
            value={githubToken}
            onChange={(event) => {
              setGithubToken(event.target.value)
            }}
          />
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            placeholder={'GitHub gist id'}
            value={githubGistId}
            onChange={(event) => {
              setGithubGistId(event.target.value)
            }}
            sx={{
              marginTop: '8px',
            }}
          />
          <Button
            onClick={gistBackup}
            sx={{
              marginTop: '8px',
            }}
          >
            {'Backup'}
          </Button>
          <Button
            onClick={gistRestore}
            sx={{
              marginTop: '8px',
            }}
          >
            {'Restore'}
          </Button>
        </SettingsItem>
        <SettingsItem
          title={'OpenAI API Usage'}
          description={openAIApiUsageText}
        />
        <SettingsItem>
          <Button
            variant={'outlined'}
            size={'small'}
            color={'error'}
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
          onClick={handleCancelClick}
        >
          {'Cancel'}
        </Button>
        <Button
          onClick={handleSaveClick}
        >
          {'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
