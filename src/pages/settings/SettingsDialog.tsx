import React, {useState} from "react";
import {
  Button,
  ButtonGroup, Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl, FormControlLabel,
  IconButton,
  InputAdornment, InputLabel, Link,
  OutlinedInput
} from "@mui/material";
import store from "../../utils/store";
import {Theme} from "../../utils/types";
import SettingsItem from "../../components/SettingsItem";
import {useDataTimestamp} from "../app/AppPage";
import {DeleteRounded, VisibilityOffRounded, VisibilityRounded} from "@mui/icons-material";

interface SettingsDialogProps {
  theme: string;
  setTheme: (theme: Theme) => void;
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  const [openAIApiKey, _setOpenAIApiKey] = useState(store.openAIAPIKey.get())
  const [githubToken, _setGithubToken] = useState(store.githubToken.get())
  const [githubGistId, _setGithubGistId] = useState(store.githubGistId.get())
  const [reopenChat, _setReopenChat] = useState(store.reopenPage.get())
  const [sendOnEnter, _setSendOnEnter] = useState(store.sendOnEnter.get())
  const [darkThemeForCodeBlock, _setDarkThemeForCodeBlock] = useState(store.darkThemeForCodeBlock.get())

  const setOpenAIApiKey = (openAIApiKey: string) => {
    _setOpenAIApiKey(openAIApiKey)
    store.openAIAPIKey.set(openAIApiKey)
  }

  const setGithubToken = (githubToken: string) => {
    _setGithubToken(githubToken)
    store.githubToken.set(githubToken)
  }

  const setGithubGistId = (githubGistId: string) => {
    _setGithubGistId(githubGistId)
    store.githubGistId.set(githubGistId)
  }

  const setReopenChat = (reopenChat: boolean) => {
    _setReopenChat(reopenChat)
    store.reopenPage.set(reopenChat)
  }

  const setSendOnEnter = (sendOnEnter: boolean) => {
    _setSendOnEnter(sendOnEnter)
    store.sendOnEnter.set(sendOnEnter)
  }

  const setDarkThemeForCodeBlock = (darkThemeForCode: boolean) => {
    _setDarkThemeForCodeBlock(darkThemeForCode)
    store.darkThemeForCodeBlock.set(darkThemeForCode)
  }

  const usageText = () => {
    const usage = store.usage.get()
    return `Tokens: ${usage.token_count}\nConversation count: ${usage.conversation_count}\nEstimated price: ${(usage.token_count / 1000 * 0.002).toFixed(2)}`
  }

  const { dataTimestamp, setDataTimestamp } = useDataTimestamp();

  const gistBackup = () => {
    store.backupData()
      .then(data => {
        fetch(`https://api.github.com/gists/${githubGistId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${githubToken}`,
            "Accept": "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            "files": {
              "openchat_data.json": {
                "content": JSON.stringify(data),
              },
            },
          }),
        })
          .then(() => alert(`Upload success`))
          .catch(() => alert("Upload error"));
      })
  }

  const gistRestore = () => {
    fetch(`https://api.github.com/gists/${githubGistId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${githubToken}`,
        "Accept": "application/vnd.github.v3+json",
      },
    })
      .then((response) => response.json())
      .then((data) => data.files["openchat_data.json"].content)
      .then((content) => store.restoreData(JSON.parse(content)))
      .then(() => {
        setDataTimestamp({ data: Date.now() })
        handleDialogClose2();
        alert("Download success");
      })
      .catch(() => alert("Download error"));
  }

  const handleDeleteAllDataClick = () => {
    if (window.confirm("Are you sure you want to delete all your data?")) {
      store.deleteData()
        .then(() => {
          handleDialogClose2();
          setDataTimestamp({ data: Date.now() })
        });
    }
  }

  const [showOpenAIAPIKey, setShowOpenAIAPIKey] = React.useState(false);
  const [showGitHubToken, setShowGitHubToken] = React.useState(false);

  const handleDialogClose2 = () => {
    setShowOpenAIAPIKey(false);
    setShowGitHubToken(false);
    props.handleDialogClose();
  }

  return (
    <Dialog
      fullWidth={true}
      open={props.dialogOpen}
      onClose={handleDialogClose2}
    >
      <DialogTitle>
        {"Settings"}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <SettingsItem
          title={"Theme"}
        >
          <ButtonGroup
            size={"small"}
          >
            <Button
              variant={props.theme === "system" ? "contained" : "outlined"}
              onClick={() => props.setTheme("system")}
              sx={{
                textTransform: "none",
              }}
            >
              {"System"}
            </Button>
            <Button
              variant={props.theme === "light" ? "contained" : "outlined"}
              onClick={() => props.setTheme("light")}
              sx={{
                textTransform: "none",
              }}
            >
              {"Light"}
            </Button>
            <Button
              variant={props.theme === "dark" ? "contained" : "outlined"}
              onClick={() => props.setTheme("dark")}
              sx={{
                textTransform: "none",
              }}
            >
              {"Dark"}
            </Button>
          </ButtonGroup>
          <FormControlLabel
            control={<Checkbox
              checked={darkThemeForCodeBlock}
              onChange={(event) => setDarkThemeForCodeBlock(event.target.checked)}
            />}
            label="Dark theme for code block"
          />
        </SettingsItem>
        <SettingsItem
          title={"Send message"}
        >
          <ButtonGroup
            size={"small"}
          >
            <Button
              variant={sendOnEnter ? "contained" : "outlined"}
              onClick={() => setSendOnEnter(true)}
              sx={{
                textTransform: "none",
              }}
            >
              {"Enter"}
            </Button>
            <Button
              variant={sendOnEnter ? "outlined" : "contained"}
              onClick={() => setSendOnEnter(false)}
              sx={{
                textTransform: "none",
              }}
            >
              {"Command+Enter"}
            </Button>
          </ButtonGroup>
        </SettingsItem>
        <SettingsItem
          title={"Startup page"}
        >
          <FormControlLabel
            control={<Checkbox
              checked={reopenChat}
              onChange={(event) => setReopenChat(event.target.checked)}
            />}
            label={"Reopen chat on startup"}
          />
        </SettingsItem>
        <SettingsItem
          title={"OPENAI_API_KEY"}
          description={
            <>
              Visit your&nbsp;
              <Link
                href={'https://platform.openai.com/account/api-keys'}
                target={'_blank'}
              >
                API key
              </Link>
              &nbsp;page to retrieve the API key you'll use in your requests
            </>
          }
        >
          <FormControl
            fullWidth={true}
            variant={"outlined"}
            size={"small"}>
            <OutlinedInput
              size={"small"}
              fullWidth={true}
              placeholder={"OPENAI_API_KEY"}
              value={openAIApiKey}
              onChange={(event) => {
                setOpenAIApiKey(event.target.value);
              }}
              type={showOpenAIAPIKey ? "text" : "password"}
              endAdornment={
                <InputAdornment
                  position="end"
                >
                  <IconButton
                    onClick={() => setShowOpenAIAPIKey(!showOpenAIAPIKey)}
                    edge={"end"}
                  >
                    {showOpenAIAPIKey ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </SettingsItem>
        <SettingsItem
          title={"Backup and restore"}
        >
          <FormControl
            fullWidth={true}
            variant={"outlined"}
            size={"small"}
            sx={{
              marginTop: "16px",
            }}
          >
            <InputLabel>
              {"GitHub token"}
            </InputLabel>
            <OutlinedInput
              label={"GitHub token"}
              size={"small"}
              fullWidth={true}
              value={githubToken}
              onChange={(event) => {
                setGithubToken(event.target.value);
              }}
              type={showGitHubToken ? "text" : "password"}
              endAdornment={
                <InputAdornment
                  position="end"
                >
                  <IconButton
                    onClick={() => setShowGitHubToken(!showGitHubToken)}
                    edge={"end"}
                  >
                    {showGitHubToken ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl
            fullWidth={true}
            variant={"outlined"}
            size={"small"}
            sx={{
              marginTop: "16px",
            }}
          >
            <InputLabel>
              {"GitHub gist id"}
            </InputLabel>
            <OutlinedInput
              label={"GitHub gist id"}
              size={"small"}
              fullWidth={true}
              value={githubGistId}
              onChange={(event) => {
                setGithubGistId(event.target.value);
              }}
            />
          </FormControl>
          <Button
            onClick={gistBackup}
            sx={{
              marginTop: "8px",
            }}
          >
            {"Backup"}
          </Button>
          <Button
            onClick={gistRestore}
            sx={{
              marginTop: "8px",
            }}
          >
            {"Restore"}
          </Button>
        </SettingsItem>
        <SettingsItem
          title={"OpenAI API Usage"}
          description={usageText()}
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
          onClick={handleDialogClose2}
        >
          {"OK"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
