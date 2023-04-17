import {Box, Button, Card, Typography, useMediaQuery, useTheme} from "@mui/material";
import {contentWidth} from "../chat/ChatPage";
import {BookmarkRemoveRounded} from "@mui/icons-material";
import React from "react";
import ConversationMessageItem from "../conversation/ConversationMessageItem";
import {ConversationEntity} from "../chat/ConversationList";

interface LikesConversationItemProps {
  conversationEntity: ConversationEntity;
  updateConversationEntity: (conversationEntity: ConversationEntity) => void;
  unlikeConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function LikesConversationItem(props: LikesConversationItemProps) {
  const theme = useTheme();

  const isNotSmallPage = useMediaQuery(`(min-width:600px)`)

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: '0px',
        marginBottom: '16px',
      }}
    >
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntityNoStore={props.updateConversationEntity}
        isUser={true}
      />
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntityNoStore={props.updateConversationEntity}
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
            paddingX: isNotSmallPage ? '32px' : '16px',
            paddingBottom: '12px',
            alignItems: 'center',
          }}
        >
          <Typography
            variant={'caption'}
            color={theme.palette.text.disabled}
          >
            {`${new Date(props.conversationEntity.id).toLocaleString()}`}
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
            }}
          />
          <Button
            variant={'text'}
            size={'small'}
            color={'error'}
            startIcon={<BookmarkRemoveRounded />}
            onClick={() => props.unlikeConversationEntity(props.conversationEntity)}
            sx={{
              textTransform: 'none',
            }}
          >
            {'Remove'}
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
