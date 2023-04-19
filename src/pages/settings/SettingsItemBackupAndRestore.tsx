import {
  Alert, Button,
  IconButton,
  InputAdornment,
  Snackbar,
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
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarSecurity, setSnackbarSecurity] = useState<AlertColor>("success")
  const [snackbarText, setSnackbarText] = useState("")

  const backupData = () => {
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
          setGithubGistId(response.data.id);
          setSnackbarOpen(true);
          setSnackbarSecurity("success");
          setSnackbarText("Backup success");
        })
        .catch(() => {
          setIsRequesting(false);
          setSnackbarOpen(true);
          setSnackbarSecurity("error");
          setSnackbarText("Backup error");
        });
    })
  }

  const restoreData = () => {
    setIsRequesting(true);
    axios.get(`https://api.github.com/gists/${githubGistId}`, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
      },
    })
      .then((response) => {
        const json = response.data.files["openchat_data.json"]?.content ?? "";
        if (json === "") {
          setSnackbarOpen(true);
          setSnackbarSecurity("warning");
          setSnackbarText("No backup data");
          setIsRequesting(false);
        } else {
          store.restoreData(JSON.parse(json))
            .then(() => {
              setIsRequesting(false);
              setSnackbarOpen(true);
              setSnackbarSecurity("success");
              setSnackbarText("Restore success");
              props.handleDialogClose();
              appContext.reload();
            });
        }
      })
      .catch(() => {
        setSnackbarOpen(true);
        setSnackbarSecurity("error");
        setSnackbarText("Restore error");
        setIsRequesting(false);
      });
  }

  return (
    <SettingsItem
      title={"Backup and restore"}
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
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          severity={snackbarSecurity}
        >
          {snackbarText}
        </Alert>
      </Snackbar>
    </SettingsItem>
  );
}
