import React, {useState} from "react";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment, InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent
} from "@mui/material";
import store from "../../util/store";
import {Chat, Settings} from "../../util/data";
import SettingsItem from "../../component/SettingsItem";
import {useDataTimestamp} from "../app/AppPage";
import {BookmarksRounded, DeleteRounded, VisibilityOffRounded, VisibilityRounded} from "@mui/icons-material";
import ChatIcon from "../../component/ChatIcon";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {contentLatest, contentLikes, contentNewChat} from "../home/HomePage";

interface SettingsDialogProps {
  theme: string;
  setTheme: (theme: string) => void;
  chats: Chat[];
  dialogOpen: boolean
  handleDialogClose: () => void
}

export function SettingsDialog(props: SettingsDialogProps) {
  const [openAIApiKey, setOpenAIApiKey] = useState(store.getOpenAIApiKey())
  const [githubToken, setGithubToken] = useState(store.getGithubToken())
  const [githubGistId, setGithubGistId] = useState(store.getGithubGistId())

  const [settings, _setSettings] = useState(store.getSettings())

  const updateSettings = (settingsPartial: Partial<Settings>) => {
    _setSettings({
      ...settings,
      ...settingsPartial,
    })
    store.updateSettings(settingsPartial)
  }

  const usageText = () => {
    const usage = store.getUsage()
    return `Tokens: ${usage.tokens}\nConversation count: ${usage.conversation_count}\nEstimated price: ${(usage.tokens / 1000 * 0.002).toFixed(2)}`
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
        handleDialogClose2();
        alert('Download success');
      })
      .catch(() => alert('Download error'));
  }

  const handleDeleteAllDataClick = () => {
    if (window.confirm('Are you sure you want to delete all your data?')) {
      store.deleteAllData();
      handleDialogClose2();
      setDataTimestamp({ data: Date.now() })
    }
  }

  const handleStartupPageChange = (event: SelectChangeEvent<number>) => {
    updateSettings({
      startup_page_id: event.target.value as number,
    });
  };

  const startupPageIds = [contentNewChat, contentLikes, contentLatest, ...props.chats.map((chat) => chat.id)];

  const chatById = (chatId: number) => {
    return props.chats.find((chat) => chat.id === chatId)!;
  }

  const startupPageValue = () => {
    const value = settings.startup_page_id;
    if (value === contentNewChat || value === contentLikes || value === contentLatest) {
      return value;
    }
    if (props.chats.some((chat) => chat.id === value)) {
      return value;
    }
    return contentNewChat;
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
        {'Settings'}
      </DialogTitle>
      <DialogContent
        dividers={true}
      >
        <SettingsItem
          title={'Theme'}
        >
          <ButtonGroup
            size={'small'}
          >
            <Button
              variant={props.theme === 'system' ? 'contained' : 'outlined'}
              onClick={() => props.setTheme('system')}
              sx={{
                textTransform: 'none',
              }}
            >
              {'System'}
            </Button>
            <Button
              variant={props.theme === 'light' ? 'contained' : 'outlined'}
              onClick={() => props.setTheme('light')}
              sx={{
                textTransform: 'none',
              }}
            >
              {'Light'}
            </Button>
            <Button
              variant={props.theme === 'dark' ? 'contained' : 'outlined'}
              onClick={() => props.setTheme('dark')}
              sx={{
                textTransform: 'none',
              }}
            >
              {'Dark'}
            </Button>
          </ButtonGroup>
        </SettingsItem>
        <SettingsItem
          title={'Send message'}
        >
          <ButtonGroup
            size={'small'}
          >
            <Button
              variant={settings.send_on_enter ? 'contained' : 'outlined'}
              onClick={() => updateSettings({
                send_on_enter: true,
              })}
              sx={{
                textTransform: 'none',
              }}
            >
              {'Enter'}
            </Button>
            <Button
              variant={settings.send_on_enter ? 'outlined' : 'contained'}
              onClick={() => updateSettings({
                send_on_enter: false,
              })}
              sx={{
                textTransform: 'none',
              }}
            >
              {'Command+Enter'}
            </Button>
          </ButtonGroup>
        </SettingsItem>
        <SettingsItem
          title={'Startup page'}
        >
          <Select
            value={startupPageValue()}
            onChange={handleStartupPageChange}
            variant={'outlined'}
            size={'small'}
            fullWidth={true}
          >
            {startupPageIds.map((chatId) => (
              <MenuItem
                value={chatId}
              >
                <Box
                  key={chatId}
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: '40px',
                  }}
                >
                  <Box
                    sx={{
                      marginRight: '16px',
                      alignItems: 'center',
                      display: 'flex',
                    }}
                  >
                    {
                      chatId !== contentNewChat && chatId !== contentLikes && chatId !== contentLatest ? (
                        <ChatIcon
                          iconText={chatById(chatId).icon_text}
                          iconTextSize={chatById(chatId).icon_text_size}
                          iconColor={chatById(chatId).icon_color}
                        />
                      ) : (
                        chatId === contentNewChat || chatId === contentLatest ? (
                          <></>
                          ) : (
                          <BookmarksRounded
                            sx={{
                              marginX: '8px',
                            }}
                          />
                        )
                      )
                    }
                  </Box>
                  <Typography
                    variant={'body1'}
                    noWrap={true}
                  >
                    {
                      chatId === contentNewChat ? 'Welcome page' :
                        chatId === contentLikes ? 'Save list' :
                          chatId === contentLatest ? 'Most recently chat' :
                          (chatById(chatId).title === '' ? 'New chat' : chatById(chatId).title)
                    }
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </SettingsItem>
        <SettingsItem
          title={'OPENAI_API_KEY'}
        >
          <FormControl
            fullWidth={true}
            variant={'outlined'}
            size={'small'}>
            <OutlinedInput
              size={'small'}
              fullWidth={true}
              placeholder={'OPENAI_API_KEY'}
              value={openAIApiKey}
              onChange={(event) => {
                setOpenAIApiKey(event.target.value);
                store.setOpenAIApiKey(event.target.value);
              }}
              type={showOpenAIAPIKey ? 'text' : 'password'}
              endAdornment={
                <InputAdornment
                  position="end"
                >
                  <IconButton
                    onClick={() => setShowOpenAIAPIKey(!showOpenAIAPIKey)}
                    edge={'end'}
                  >
                    {showOpenAIAPIKey ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
        </SettingsItem>
        <SettingsItem
          title={'Backup and restore'}
        >
          <FormControl
            fullWidth={true}
            variant={'outlined'}
            size={'small'}
            sx={{
              marginTop: '16px',
            }}
          >
            <InputLabel>
              {'GitHub token'}
            </InputLabel>
            <OutlinedInput
              label={'GitHub token'}
              size={'small'}
              fullWidth={true}
              value={githubToken}
              onChange={(event) => {
                setGithubToken(event.target.value);
                store.setGithubToken(event.target.value);
              }}
              type={showGitHubToken ? 'text' : 'password'}
              endAdornment={
                <InputAdornment
                  position="end"
                >
                  <IconButton
                    onClick={() => setShowGitHubToken(!showGitHubToken)}
                    edge={'end'}
                  >
                    {showGitHubToken ? <VisibilityOffRounded /> : <VisibilityRounded />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl
            fullWidth={true}
            variant={'outlined'}
            size={'small'}
            sx={{
              marginTop: '16px',
            }}
          >
            <InputLabel>
              {'GitHub gist id'}
            </InputLabel>
            <OutlinedInput
              label={'GitHub gist id'}
              size={'small'}
              fullWidth={true}
              value={githubGistId}
              onChange={(event) => {
                setGithubGistId(event.target.value);
                store.setGithubGistId(event.target.value);
              }}
            />
          </FormControl>
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
          description={usageText()}
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
          onClick={handleDialogClose2}
        >
          {'OK'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
