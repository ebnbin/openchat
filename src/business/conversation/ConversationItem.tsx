import ConversationMessageItem from "./ConversationMessageItem";
import {Box, Button, Card, Typography, useTheme} from "@mui/material";
import {contentWidth} from "../chat/ChatPage";
import {DeleteRounded, TipsAndUpdatesRounded} from "@mui/icons-material";
import React from "react";
import {ConversationEntity, ConversationEntityType} from "./ConversationList";

interface ConversationItemProps {
  conversationEntity: ConversationEntity;
  updateConversationEntity: (conversationEntity: ConversationEntity) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function ConversationItem(props: ConversationItemProps) {
  const theme = useTheme();

  return (
    <Card
      key={props.conversationEntity.id}
      elevation={1}
      sx={{
        borderRadius: '0px',
        marginBottom: '1px',
      }}
    >
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntity={props.updateConversationEntity}
        isUser={true}
      />
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntity={props.updateConversationEntity}
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
            {`${new Date(parseInt(props.conversationEntity.id, 10)).toLocaleString()}`}
          </Typography>
          <TipsAndUpdatesRounded
            color={'disabled'}
            sx={{
              marginLeft: '8px',
              width: '16px',
              height: '16px',
              visibility: props.conversationEntity.type !== ConversationEntityType.Default ? 'visible' : 'hidden',
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
            onClick={() => props.deleteConversationEntity(props.conversationEntity)}
            sx={{
              textTransform: 'none',
              visibility: props.conversationEntity.type !== ConversationEntityType.Requesting ? 'visible' : 'hidden',
            }}
          >
            {'Delete'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
