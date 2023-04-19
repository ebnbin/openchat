import {
  Chip,
  IconButton,
  InputAdornment,
  Link,
  TextField
} from "@mui/material";
import SettingsItem from "../../components/SettingsItem";
import React, {useState} from "react";
import {VisibilityOffRounded, VisibilityRounded} from "@mui/icons-material";
import store from "../../utils/store";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function SettingsItemOpenAIAPI() {
  const [openAIAPIKey, _setOpenAIAPIKey] = useState(store.openAIAPIKey.get())
  const [visibility, setVisibility] = React.useState(false);
  const [showUsage, setShowUsage] = useState(false)

  const setOpenAIApiKey = (openAIApiKey: string) => {
    _setOpenAIAPIKey(openAIApiKey)
    store.openAIAPIKey.set(openAIApiKey)
  }

  const usage = store.usage.get();

  return (
    <SettingsItem
      title={"OpenAI API"}
      description={
        <>
          Your API key is stored on this device and never transmitted to anyone except
          OpenAI. <Link href={'https://platform.openai.com/account/api-keys'} target={'_blank'}>{"Find your API keys here"}</Link>
        </>
      }
    >
      <TextField
        variant={"outlined"}
        size={"small"}
        fullWidth={true}
        placeholder={"sk-************************************************"}
        value={openAIAPIKey}
        onChange={(event) => setOpenAIApiKey(event.target.value)}
        type={visibility ? "text" : "password"}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
            >
              <IconButton
                onClick={() => setVisibility(!visibility)}
                edge={"end"}
              >
                {visibility ? <VisibilityOffRounded/> : <VisibilityRounded/>}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Box
        sx={{
          marginTop: "8px",
        }}
      >
        <Chip
          variant={"outlined"}
          size={"small"}
          onClick={() => setShowUsage(true)}
          label={"Show API usage on this device"}
          sx={{
            display: showUsage ? "none" : undefined,
            textTransform: "none",
          }}
        />
        <Box
          sx={{
            display: showUsage ? undefined : "none",
          }}
        >
          <Typography
            variant={"body2"}
            sx={{
              whiteSpace: "pre-wrap",
            }}
          >
            {`${usage.conversation_count} conversations; ${usage.token_count} tokens\nEstimated cost: $${(usage.token_count / 1000 * 0.002).toFixed(2)}`}&nbsp;
            <Link
              variant={"body2"}
              href={'https://platform.openai.com/account/usage'}
              target={'_blank'}
            >
              {"Find your API usage here"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </SettingsItem>
  );
}
