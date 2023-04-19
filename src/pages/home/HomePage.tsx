import Box from "@mui/material/Box";
import HomeDrawer from "./HomeDrawer";
import HomeAppBar from "./HomeAppBar";
import ChatPage from "../chat/ChatPage";
import {ChatSettingsDialog} from "../chatsettings/ChatSettingsDialog";
import * as React from "react";
import {Chat} from "../../utils/types";
import {useEffect, useState} from "react";
import store from "../../utils/store";
import Logo from "../../components/Logo";
import SaveListPage from "../savelist/SaveListPage";

export const pageNewChat = 0;
export const pageSaveList = -1;

interface HomePageProps {
  handleSettingsDialogOpen: () => void;
}

export default function HomePage(props: HomePageProps) {
  const [chats, _setChats] = useState<Chat[]>([])
  const [pageId, _setPageId] = useState(pageNewChat);
  const [newChat, setNewChat] = useState(store.newChat())

  useEffect(() => {
    store.getChats()
      .then((chats) => {
        _setChats(chats)
        _setPageId(startupPage(chats))
      });
  }, []);

  const startupPage = (chats: Chat[]): number => {
    if (!store.reopenPage.get()) {
      return pageNewChat;
    }
    const reopenPageId = store.reopenPageId.get();
    if (reopenPageId === pageNewChat || reopenPageId === pageSaveList) {
      return reopenPageId;
    }
    if (chats.some((chat) => chat.id === reopenPageId)) {
      return reopenPageId;
    }
    return pageNewChat;
  }

  const createChat = (chat: Chat) => {
    store.updateChatsCreateChat(chat, [chats, _setChats]);
    updatePageId(chat.id);
  }

  const updateChat = (chatId: number, chat: Partial<Chat>) => {
    store.updateChatsUpdateChat(chatId, chat, [chats, _setChats]);
  }

  const deleteChat = (chat: Chat) => {
    handleNewChatClick();
    store.updateChatsDeleteChat(chat.id, [chats, _setChats]);
    store.updateConversationsDeleteConversations(chat.id);
    store.pinChats.set(store.pinChats.get().filter((pinChatId) => pinChatId !== chat.id));
  }

  const updatePageId = (pageId: number) => {
    _setPageId(pageId);
    store.reopenPageId.set(pageId);
    setDrawerOpen(false);
  }

  const handleNewChatClick = () => {
    setNewChat(store.newChat());
    updatePageId(pageNewChat);
  }

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [chatSettingsDialogOpen, setChatSettingsDialogOpen] = useState(false);
  const [newChatSettingsDialogOpen, setNewChatSettingsDialogOpen] = useState(false);

  const contentPage = () => {
    if (pageId === pageNewChat) {
      return (
        <ChatPage
          key={`ChatPage${newChat.id}`}
          chat={newChat}
          updateChat={updateChat}
          createChat={createChat}
        >
          <Box
            sx={{
              margin: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Logo/>
          </Box>
        </ChatPage>
      );
    }
    if (pageId === pageSaveList) {
      return (
        <SaveListPage/>
      );
    }
    const chat = chats.find((chat) => chat.id === pageId);
    if (chat === undefined) {
      return undefined;
    }
    return (
      <ChatPage
        key={`ChatPage${pageId}`}
        chat={chat}
        updateChat={updateChat}
      />
    );
  }

  const chatSettingsDialog = () => {
    if (pageId === pageNewChat) {
      return (
        <ChatSettingsDialog
          key={`ChatSettingsDialog${newChat.id}`}
          chat={newChat}
          isNew={true}
          createChat={createChat}
          dialogOpen={newChatSettingsDialogOpen}
          handleDialogClose={() => setNewChatSettingsDialogOpen(false)}
        />
      );
    }
    if (pageId === pageSaveList) {
      return undefined;
    }
    const chat = chats.find((chat) => chat.id === pageId);
    if (chat === undefined) {
      return undefined;
    }
    return (
      <ChatSettingsDialog
        key={`ChatSettingsDialog${pageId}`}
        chat={chat}
        isNew={false}
        updateChat={updateChat}
        deleteChat={deleteChat}
        dialogOpen={chatSettingsDialogOpen}
        handleDialogClose={() => setChatSettingsDialogOpen(false)}
      />
    );
  }

  return (
    <>
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <HomeAppBar
            chats={chats}
            pageId={pageId}
            handleDrawerClick={() => setDrawerOpen(true)}
            handleChatSettingsClick={(pageId: number) => {
              if (pageId === pageNewChat) {
                setNewChatSettingsDialogOpen(true)
                return;
              }
              setChatSettingsDialogOpen(true);
            }}
          />
          <Box
            style={{
              width: "100%",
              flexGrow: 1,
            }}
          >
            {contentPage()}
          </Box>
        </Box>
        <HomeDrawer
          chats={chats}
          pageId={pageId}
          drawerOpen={drawerOpen}
          handleDrawerClose={() => setDrawerOpen(false)}
          handleChatItemClick={updatePageId}
          handleNewChatClick={handleNewChatClick}
          handleSaveListClick={() => {
            updatePageId(pageSaveList);
          }}
          handleSettingsClick={() => {
            props.handleSettingsDialogOpen();
            setDrawerOpen(false);
          }}
        />
      </Box>
      {chatSettingsDialog()}
    </>
  );
}
