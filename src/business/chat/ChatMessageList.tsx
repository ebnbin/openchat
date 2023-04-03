import {Box, Button, Card, List, Typography, useTheme} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {contentWidth, ConversationEntity, ConversationEntityType} from "./ChatPage";
import {DeleteRounded, SendRounded} from "@mui/icons-material";

interface MessageListProps {
  conversationEntities: ConversationEntity[];
  setConversationEntities: (conversationEntities: ConversationEntity[]) => void;
}

export default function ChatMessageList(props: MessageListProps) {
  const { conversationEntities, setConversationEntities } = props

  const theme = useTheme()

  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    setConversationEntities(conversationEntities.map((c) => c.id === conversationEntity.id ? conversationEntity : c))
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
                  conversationEntity={conversationEntity}
                  updateConversationEntity={updateConversationEntity}
                  isUser={true}
                />
                <ChatMessageItem
                  conversationEntity={conversationEntity}
                  updateConversationEntity={updateConversationEntity}
                  isUser={false}
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
                      paddingX: '16px',
                      paddingBottom: '8px',
                      alignItems: 'center',
                    }}
                  >
                    <Typography
                      variant={'caption'}
                      color={theme.palette.text.disabled}
                    >
                      {`${new Date(conversationEntity.id).toLocaleString()}`}
                    </Typography>
                    <SendRounded
                      color={'disabled'}
                      sx={{
                        marginLeft: '8px',
                        width: '16px',
                        height: '16px',
                        visibility: conversationEntity.type !== ConversationEntityType.Default ? 'visible' : 'hidden',
                      }}
                    />
                    <Box
                      sx={{
                        flexGrow: 1,
                      }}
                    />
                    <Button
                      variant={'text'}
                      size={'small'}
                      color={'error'}
                      startIcon={<DeleteRounded/>}
                      sx={{
                        textTransform: 'none',
                      }}
                    >
                      {'Delete conversation'}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Box>
          ))
      }
    </List>
  )
}
