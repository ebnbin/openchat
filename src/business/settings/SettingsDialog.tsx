import React, {useEffect, useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent, DialogTitle,
  TextField
} from "@mui/material";
import store from "../../util/store";
import {Usage} from "../../util/data";
import SettingsItem from "../../component/SettingsItem";
import {useDataTimestamp} from "../app/AppPage";

interface SettingsDialogProps {
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  const [openAIApiKey, setOpenAIApiKey] = useState(store.getOpenAIApiKey())
  const [githubToken, setGithubToken] = useState(store.getGithubToken())
  const [githubGistId, setGithubGistId] = useState(store.getGithubGistId())

  const [openAIApiUsageText, setOpenAIApiUsageText] = useState('')

  useEffect(() => {
    store.getUsageAsync().then(usage => {
      setOpenAIApiUsageText(
        `tokens: ${usage.tokens}\nimage_256: ${usage.image_256}\nimage_512: ${usage.image_512}\nimage_1024: ${usage.image_1024}\nEstimated price: ${price(usage)}`
      );
    });
  }, [props.dialogOpen]);

  const price = (usage: Usage) => {
    return (usage.tokens / 1000 * 0.002 + usage.image_256 * 0.016 + usage.image_512 * 0.018 + usage.image_1024 * 0.02).toFixed(2)
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
        setDataTimestamp({ data: new Date().getTime() })
        alert('Download success');
      })
      .catch(() => alert('Download error'));
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
          title={'GitHub token'}
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
        </SettingsItem>
        <SettingsItem
          title={'GitHub gist id'}
        >
          <TextField
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
            placeholder={'GitHub gist id'}
            value={githubGistId}
            onChange={(event) => {
              setGithubGistId(event.target.value)
            }}
          />
          <Button
            onClick={gistBackup}
          >
            {'Backup'}
          </Button>
          <Button
            onClick={gistRestore}
          >
            {'Restore'}
          </Button>
        </SettingsItem>
        <SettingsItem
          title={'OpenAI API Usage'}
          description={openAIApiUsageText}
        />
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
