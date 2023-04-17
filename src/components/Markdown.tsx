import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {Box, Button, Typography, useTheme} from "@mui/material";
import {copy} from "../utils/utils";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css"
import {ContentCopyRounded} from "@mui/icons-material";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string,
}

function Markdown(props: MarkdownProps) {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const style: any = isDarkMode ? oneDark : oneLight;

  const handleCopyClick = async (text: string) => {
    await copy(text, null);
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Box
        sx={{
          width: "0px",
          flexGrow: 1,
        }}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            a: ({ ...props }) => {
              return (
                <a
                  target={"_blank"}
                  style={{
                    color: theme.palette.text.primary,
                    fontWeight: "bold",
                  }}
                  {...props}
                />
              )
            },
            code: ({ inline, className, children, ...props }) => {
              const language = /language-(\w+)/.exec(className ?? "")?.[1];
              const code = String(children).replace(/\n$/, "");
              return inline ? (
                <code
                  className={className}
                  style={{
                    fontWeight: "bold",
                  }}
                  {...props}
                >
                  {children}
                </code>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      marginBottom: "-8px",
                      paddingX: "16px",
                      borderTopLeftRadius: "4px",
                      borderTopRightRadius: "4px",
                      alignItems: "center",
                      bgcolor: theme.palette.action.selected,
                    }}
                  >
                    <Typography
                      variant={"subtitle2"}
                      sx={{
                        flexGrow: 1,
                        align: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {language}
                    </Typography>
                    <Button
                      color={"inherit"}
                      startIcon={<ContentCopyRounded/>}
                      size={"small"}
                      onClick={() => handleCopyClick(code)}
                      style={{
                        textTransform: "none",
                      }}
                    >
                      {"Copy"}
                    </Button>
                  </Box>
                  <SyntaxHighlighter
                    language={language}
                    style={style}
                    {...props}
                  >
                    {code}
                  </SyntaxHighlighter>
                </Box>
              );
            },
            img: ({ ...props }) => {
              return (
                <img
                  style={{
                    maxWidth: "100%",
                  }}
                  {...props}
                />
              )
            },
          }}
        >
          {props.content}
        </ReactMarkdown>
      </Box>
    </Box>
  );
}

export default React.memo(Markdown);
