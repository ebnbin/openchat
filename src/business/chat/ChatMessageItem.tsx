import {Avatar, Button, CircularProgress, Typography, useTheme} from "@mui/material";
import {
  ContentCopyRounded,
  FaceRounded, NotesRounded
} from "@mui/icons-material";
import Box from "@mui/material/Box";
import React from "react";
import {contentWidth, ConversationEntity, ConversationEntityType} from "./ChatPage";
import ChatMarkdownMessage from "../../component/Markdown";
import {copy} from "../../util/util";
import {ReactComponent as ChatGPTLogo} from './../../chatgpt_logo.svg';

interface ChatMessageItemProps {
  conversationEntity: ConversationEntity,
  updateConversationEntity: (conversationEntity: ConversationEntity) => void,
  isUser: boolean,
}

export default function ChatMessageItem(props: ChatMessageItemProps) {
  const { conversationEntity, updateConversationEntity, isUser } = props;

  const message = isUser ? conversationEntity.userMessage : conversationEntity.assistantMessage;
  const markdown = isUser ? conversationEntity.userMessageMarkdown : conversationEntity.assistantMessageMarkdown;
  const isLoading = !isUser && conversationEntity.type === ConversationEntityType.Requesting;

  const theme = useTheme();

  const handleMarkdownClick = () => {
    updateConversationEntity({
      ...conversationEntity,
      userMessageMarkdown: isUser ? !markdown : conversationEntity.userMessageMarkdown,
      assistantMessageMarkdown: isUser ? conversationEntity.assistantMessageMarkdown : !markdown,
    });
  }

  const handleCopyClick = async (text: string) => {
    await copy(text, null);
  }

  return (
    <Box
      sx={{
        bgcolor: isUser ? undefined : theme.palette.action.hover,
      }}
    >
      <Box
        sx={{
          maxWidth: contentWidth,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          paddingX: '16px',
        }}
      >
        <Box
          sx={{
            height: '44px',
            display: 'flex',
            flexDirection: 'row',
            placeItems: 'center',
            paddingTop: '12px',
          }}
        >
          <Avatar
            sx={{
              width: '24px',
              height: '24px',
              marginRight: '8px',
              bgcolor: theme.palette.primary.main,
            }}
          >
            {isUser ? <FaceRounded /> : <ChatGPTLogo />}
          </Avatar>
          <Typography
            variant={'caption'}
            sx={{
              fontWeight: 'bold',
            }}
          >
            {isUser ? 'You' : 'ChatGPT'}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
            }}
          />
          {isLoading ? undefined : (
            <Button
              variant={'text'}
              size={'small'}
              color={'info'}
              startIcon={<NotesRounded />}
              onClick={handleMarkdownClick}
              sx={{
                textTransform: 'none',
              }}
            >
              {markdown ? 'Markdown' : 'Raw text'}
            </Button>
          )}
          {isLoading ? undefined : (
            <Button
              variant={'text'}
              size={'small'}
              color={'info'}
              startIcon={<ContentCopyRounded />}
              onClick={() => handleCopyClick(message)}
              sx={{
                textTransform: 'none',
              }}
            >
              {'Copy'}
            </Button>
          )}
        </Box>
        <Box>
          {isLoading ? (
            <Box
              sx={{
                height: '56px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <CircularProgress
                size={'32px'}
              />
            </Box>
          ) : (
            markdown ? (
              <ChatMarkdownMessage
                content={message}
              />
            ) : (
              <Typography
                sx={{
                  paddingY: '16px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message}
              </Typography>
            )
          )}
        </Box>
      </Box>
    </Box>
  );
}
