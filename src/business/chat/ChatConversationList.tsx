import {Box, Button, Card, List, Typography, useTheme} from "@mui/material";
import ChatMessageItem from "./ChatMessageItem";
import React from "react";
import {contentWidth, ConversationEntity, ConversationEntityType} from "./ChatPage";
import {DeleteRounded, TipsAndUpdatesRounded} from "@mui/icons-material";

interface ChatConversationListProps {
  conversationEntities: ConversationEntity[];
  updateConversationEntitiesNoStore: (conversationEntities: ConversationEntity[]) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function ChatConversationList(props: ChatConversationListProps) {
  const { conversationEntities, updateConversationEntitiesNoStore, deleteConversationEntity } = props;

  const theme = useTheme();

  const updateConversationEntity = (conversationEntity: ConversationEntity) => {
    updateConversationEntitiesNoStore(conversationEntities.map((c) =>
      c.id === conversationEntity.id ? conversationEntity : c));
  }

  return (
    <List>
      {
        conversationEntities.map((conversationEntity) => (
          <Card
            key={conversationEntity.id}
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
                  height: '44px',
                  maxWidth: contentWidth,
                  margin: '0 auto',
                  display: 'flex',
                  flexDirection: 'row',
                  paddingX: '16px',
                  paddingBottom: '12px',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant={'caption'}
                  color={theme.palette.text.disabled}
                >
                  {`${new Date(conversationEntity.id).toLocaleString()}`}
                </Typography>
                <TipsAndUpdatesRounded
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
                  startIcon={<DeleteRounded />}
                  onClick={() => deleteConversationEntity(conversationEntity)}
                  sx={{
                    textTransform: 'none',
                  }}
                >
                  {'Delete'}
                </Button>
              </Box>
            </Box>
          </Card>
        ))
      }
    </List>
  );
}
