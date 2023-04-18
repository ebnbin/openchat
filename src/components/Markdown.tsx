import React from "react";
import ReactMarkdown from "react-markdown";
import {Box, useTheme} from "@mui/material";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css"
import remarkGfm from "remark-gfm";
import MarkdownCode from "./MarkdownCode";

interface MarkdownProps {
  content: string,
}

function Markdown(props: MarkdownProps) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          "a": (props) => {
            return (
              <a
                {...props}
                target={"_blank"}
                style={{
                  color: theme.palette.text.primary,
                  fontWeight: "bold",
                }}
              />
            );
          },
          "code": ({inline, ...props}) => {
            return inline ? (
              <code
                {...props}
                style={{
                  fontWeight: "bold",
                }}
              >
                {props.children}
              </code>
            ) : (
              <MarkdownCode
                props={props}
              />
            );
          },
          "img": (props) => {
            return (
              <img
                {...props}
                style={{
                  maxWidth: "100%",
                }}
              />
            )
          },
        }}
      >
        {props.content}
      </ReactMarkdown>
    </Box>
  );
}

export default React.memo(Markdown);
