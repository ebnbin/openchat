import {Box, Button, MenuItem, Select, Typography, useTheme} from "@mui/material";
import {ContentCopyRounded} from "@mui/icons-material";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import React from "react";
import {oneDark, oneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {copy} from "../utils/utils";
import store from "../utils/store";

interface MarkdownCodeProps {
  props: any;
}

// https://github.com/remarkjs/react-markdown#use-custom-components-syntax-highlight
export default function MarkdownCode(props: MarkdownCodeProps) {
  const theme = useTheme();

  const defaultLanguage = /language-(\w+)/.exec(props.props.className ?? "")?.[1] ?? "";
  const code = String(props.props.children).replace(/\n$/, "");
  const style = theme.palette.mode === "dark" || store.darkThemeForCodeBlock.get() ? oneDark : oneLight;

  const [language, setLanguage] = React.useState(defaultLanguage);

  return (
    <Box
      {...props.props}
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          height: "32px",
          marginBottom: "-8px",
          paddingX: "16px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
          alignItems: "center",
          bgcolor: theme.palette.action.hover,
        }}
      >
        {defaultLanguage === "" ? (
          <Select
            variant={"standard"}
            size={"small"}
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            disableUnderline
            sx={{
              fontSize: theme.typography.subtitle2.fontSize,
            }}
          >
            {["", ...SyntaxHighlighter.supportedLanguages].map((language) => (
              <MenuItem
                key={language}
                value={language}
                sx={{
                  height: "32px",
                  fontSize: theme.typography.subtitle2.fontSize,
                }}
              >
                {language}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Typography
            variant={"subtitle2"}
          >
            {defaultLanguage}
          </Typography>
        )}
        <Box
          sx={{
            flexGrow: 1,
          }}
        />
        <Button
          color={"inherit"}
          startIcon={<ContentCopyRounded/>}
          size={"small"}
          onClick={() => copy(code)}
          style={{
            textTransform: "none",
          }}
        >
          {"Copy"}
        </Button>
      </Box>
      <SyntaxHighlighter
        {...props.props}
        language={language}
        style={style}
        customStyle={{
          borderRadius: "0px",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </Box>
  );
}
