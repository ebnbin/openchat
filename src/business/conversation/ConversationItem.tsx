import ConversationMessageItem from "./ConversationMessageItem";
import {Box, Button, Card, Typography, useMediaQuery, useTheme} from "@mui/material";
import {contentWidth} from "../chat/ChatPage";
import {DeleteRounded, FavoriteBorderRounded, FavoriteRounded} from "@mui/icons-material";
import React from "react";
import {ConversationEntity, ConversationEntityType} from "./ConversationList";

interface ConversationItemProps {
  conversationEntity: ConversationEntity;
  updateConversationEntityNoStore: (conversationEntity: ConversationEntity) => void;
  updateConversationEntityLike: (conversationEntity: ConversationEntity) => void;
  deleteConversationEntity: (conversationEntity: ConversationEntity) => void;
}

export default function ConversationItem(props: ConversationItemProps) {
  const theme = useTheme();

  const handleLikeClick = () => {
    props.updateConversationEntityLike({
      ...props.conversationEntity,
      likeTimestamp: props.conversationEntity.likeTimestamp === 0 ? Date.now() : 0,
    });
  }

  const isNotSmallPage = useMediaQuery(`(min-width:600px)`)

  return (
    <Card
      elevation={1}
      sx={{
        borderRadius: '0px',
        marginBottom: '1px',
      }}
    >
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntityNoStore={props.updateConversationEntityNoStore}
        isUser={true}
      />
      <ConversationMessageItem
        conversationEntity={props.conversationEntity}
        updateConversationEntityNoStore={props.updateConversationEntityNoStore}
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
            color={'info'}
            startIcon={props.conversationEntity.likeTimestamp === 0 ? <FavoriteBorderRounded /> : <FavoriteRounded />}
            onClick={handleLikeClick}
            sx={{
              textTransform: 'none',
              visibility: props.conversationEntity.type !== ConversationEntityType.Requesting ? 'visible' : 'hidden',
            }}
          >
            {props.conversationEntity.likeTimestamp === 0 ? 'Like' : 'Liked'}
          </Button>
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
