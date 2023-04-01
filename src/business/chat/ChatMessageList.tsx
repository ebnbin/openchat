import {Box, Card, IconButton, List, Typography, useTheme} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {contentWidth, ConversationEntity, ConversationEntityType} from "./ChatPage";
import {ChatCompletionRequestMessageRoleEnum} from "openai";
import {MoreHorizRounded} from "@mui/icons-material";

interface MessageListProps {
  conversationEntities: ConversationEntity[];
  setConversationEntities: (conversationEntities: ConversationEntity[]) => void;
}

export default function ChatMessageList(props: MessageListProps) {
  const { conversationEntities, setConversationEntities } = props

  const theme = useTheme()

  const setRaw = (id: number, isUser: boolean, raw: boolean) => {
    const foundIndex = conversationEntities.findIndex((c) => c.id === id)
    if (foundIndex === -1) {
      return
    }
    const foundConversationEntity = conversationEntities[foundIndex]
    const copyConversationEntity = {
      ...foundConversationEntity,
      userMessageRaw: isUser ? raw : foundConversationEntity.userMessageRaw,
      assistantMessageRaw: isUser ? foundConversationEntity.assistantMessageRaw : raw,
    } as ConversationEntity
    const copyConversationEntities = [
      ...conversationEntities,
    ]
    copyConversationEntities[foundIndex] = copyConversationEntity
    setConversationEntities(copyConversationEntities)
  }

  return (
    <List>
      {
        conversationEntities
          .map((conversationEntity) => (
            <Box
              key={conversationEntity.id}
            >
              <Card
                elevation={1}
                sx={{
                  borderRadius: '0px',
                  marginBottom: '1px',
                }}
              >
                <ChatMessageItem
                  id={conversationEntity.id}
                  role={ChatCompletionRequestMessageRoleEnum.User}
                  message={conversationEntity.userMessage}
                  context={conversationEntity.type !== ConversationEntityType.DEFAULT}
                  isLoading={conversationEntity.type === ConversationEntityType.REQUESTING}
                  raw={conversationEntity.userMessageRaw}
                  setRaw={setRaw}
                />
                <ChatMessageItem
                  id={conversationEntity.id}
                  role={ChatCompletionRequestMessageRoleEnum.Assistant}
                  message={conversationEntity.assistantMessage}
                  context={conversationEntity.type !== ConversationEntityType.DEFAULT}
                  isLoading={conversationEntity.type === ConversationEntityType.REQUESTING}
                  raw={conversationEntity.assistantMessageRaw}
                  setRaw={setRaw}
                />
                <Box
                  sx={{
                    bgcolor: theme.palette.action.hover,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: contentWidth,
                      margin: '0 auto',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'row',
                      paddingLeft: '16px',
                      paddingRight: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant={'caption'}
                      color={theme.palette.text.disabled}
                      sx={{
                        flexGrow: 1,
                      }}
                    >
                      {`${new Date(conversationEntity.id).toLocaleString()}`}
                    </Typography>
                    <IconButton
                      size={'small'}
                    >
                      <MoreHorizRounded/>
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Box>
          ))
      }
    </List>
  )
}
