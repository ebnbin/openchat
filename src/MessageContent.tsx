import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Box, Chip, Typography, useTheme} from "@mui/material";
import {copy} from "./util";

interface MessageContentProps {
  content: string
}

export function MessageContent({ content }: MessageContentProps) {
  const theme = useTheme()
  const style: any = theme.palette.mode === 'dark' ? oneDark : oneLight

  const handleCopyCodeClick = (text: string) => {
    copy(text)
  }

  return (
    <ReactMarkdown
      children={content}
      components={{
        code({node, inline, className, children, ...props}) {
          const match = /language-(\w+)/.exec(className || '')
          return !inline ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginBottom: '-8px',
                  paddingX: '16px',
                  borderTopLeftRadius: '8px',
                  borderTopRightRadius: '8px',
                  alignItems: 'center',
                  bgcolor: theme.palette.divider,
                }}
              >
                <Typography
                  variant={'subtitle2'}
                  sx={{
                    flexGrow: 1,
                    align: 'center',
                  }}
                >
                  {match?.[1]}
                </Typography>
                <Chip
                  label={'Copy code'}
                  onClick={() => handleCopyCodeClick(String(children).replace(/\n$/, ''))}
                />
              </Box>
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={style}
                language={match?.[1]}
                PreTag="div"
                showLineNumbers={true}
                {...props}
              />
            </Box>
          ) : (
            <code
              className={className}
              {...props}
              style={{
                borderRadius: '2px',
                padding: '1px',
                backgroundColor: theme.palette.action.selected,
              }}
            >
              {children}
            </code>
          )
        },
      }}
    />
  )
}
