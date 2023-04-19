import {
  Button,
  IconButton,
  InputAdornment, Link,
  TextField
} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import {
  CloudDownloadRounded,
  CloudUploadRounded,
  VisibilityOffRounded,
  VisibilityRounded
} from "@mui/icons-material";
import store from "../../utils/store";
import {useAppContext} from "../app/AppPage";
import axios, {AxiosResponse} from "axios";
import {AlertColor} from "@mui/material/Alert/Alert";
import Box from "@mui/material/Box";
import Toast from "../../components/Toast";

interface SettingsItemBackupAndRestoreProps {
  handleDialogClose: () => void;
}

export default function SettingsItemBackupAndRestore(props: SettingsItemBackupAndRestoreProps) {
  const appContext = useAppContext();

  const [githubToken, _setGithubToken] = useState(store.githubToken.get())
  const [githubGistId, _setGithubGistId] = useState(store.githubGistId.get())

  const setGithubToken = (githubToken: string) => {
    _setGithubToken(githubToken)
    store.githubToken.set(githubToken)
  }

  const setGithubGistId = (githubGistId: string) => {
    _setGithubGistId(githubGistId)
    store.githubGistId.set(githubGistId)
  }

  const [isRequesting, setIsRequesting] = useState(false)
  const [gitHubTokenVisibility, setGitHubTokenVisibility] = React.useState(false);
  const [toastOpen, setToastOpen] = useState(false)
  const [toastColor, setToastColor] = useState<AlertColor>("success")
  const [toastText, setToastText] = useState("")

  function toast(color: AlertColor, text: string) {
    setToastOpen(true)
    setToastColor(color)
    setToastText(text)
  }

  const backupData = () => {
    if (githubToken === "") {
      toast("error", "GitHub token is not set");
      return;
    }
    store.backupData().then(data => {
      setIsRequesting(true)
      let response: Promise<AxiosResponse<any, any>>;
      if (githubGistId === "") {
        response = axios.post("https://api.github.com/gists", {
          "files": {
            "openchat_data.json": {
              "content": JSON.stringify(data),
            },
          },
        }, {
          headers: {
            "Authorization": `Bearer ${githubToken}`,
          },
        })
      } else {
        response = axios.patch(`https://api.github.com/gists/${githubGistId}`, {
          "files": {
            "openchat_data.json": {
              "content": JSON.stringify(data),
            },
          },
        }, {
          headers: {
            "Authorization": `Bearer ${githubToken}`,
          },
        })
      }
      response
        .then((response) => {
          setIsRequesting(false);
          toast("success", "Backup success");
          setGithubGistId(response.data.id);
        })
        .catch(() => {
          setIsRequesting(false);
          toast("error", "Backup error");
        });
    })
  }

  const restoreData = () => {
    if (githubToken === "") {
      toast("error", "GitHub token is not set");
      return;
    }
    setIsRequesting(true);
    axios.get(`https://api.github.com/gists/${githubGistId}`, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
      },
    })
      .then((response) => {
        const json = response.data.files["openchat_data.json"]?.content ?? "";
        if (json === "") {
          setIsRequesting(false);
          toast("warning", "No backup data");
        } else {
          store.restoreData(JSON.parse(json))
            .then(() => {
              setIsRequesting(false);
              props.handleDialogClose();
              appContext.reload("success", "Restore success");
            });
        }
      })
      .catch(() => {
        setIsRequesting(false);
        toast("error", "Restore error")
      });
  }

  return (
    <SettingsItem
      title={"Backup and restore (Beta)"}
      description={<>
        Backup and restore your chats and conversations using GitHub
        Gist. <Link href={'https://github.com/settings/tokens'} target={'_blank'}>{"Find your GitHub tokens here"}</Link>
      </>}
    >
      <TextField
        variant={"outlined"}
        size={"small"}
        label={"GitHub token"}
        placeholder={"ghp_************************************"}
        fullWidth={true}
        value={githubToken}
        onChange={(event) => setGithubToken(event.target.value)}
        type={gitHubTokenVisibility ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
            >
              <IconButton
                onClick={() => setGitHubTokenVisibility(!gitHubTokenVisibility)}
                edge={"end"}
              >
                {gitHubTokenVisibility ? <VisibilityOffRounded/> : <VisibilityRounded/>}
              </IconButton>
            </InputAdornment>
          ),
        }}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          marginTop: "8px",
        }}
      />
      <TextField
        variant={"outlined"}
        size={"small"}
        label={"GitHub gist id"}
        placeholder={"********************************"}
        helperText={"Leave it blank to create a new gist"}
        fullWidth={true}
        value={githubGistId}
        onChange={(event) => setGithubGistId(event.target.value)}
        InputLabelProps={{
          shrink: true,
        }}
        sx={{
          marginTop: "8px",
        }}
      />
      <Box
        sx={{
          marginTop: "8px",
        }}
      >
        <Button
          onClick={backupData}
          startIcon={<CloudUploadRounded/>}
          disabled={isRequesting}
          sx={{
            textTransform: "none",
          }}
        >
          {"Backup"}
        </Button>
        <Button
          onClick={restoreData}
          startIcon={<CloudDownloadRounded/>}
          disabled={isRequesting}
          sx={{
            textTransform: "none",
          }}
        >
          {"Restore"}
        </Button>
      </Box>
      <Toast
        open={toastOpen}
        handleClose={() => setToastOpen(false)}
        color={toastColor}
        text={toastText}
      />
    </SettingsItem>
  );
}
