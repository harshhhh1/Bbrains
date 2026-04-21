"use client";

import { ChannelHeader } from "@/features/chat/components/ChannelHeader";
import { ProfileDialog } from "@/features/chat/components/ProfileDialog";
import { ChatMembersPanels } from "./components/ChatMembersPanels";
import { ChatMessagePane } from "./components/ChatMessagePane";
import { ChatMobileSearch } from "./components/ChatMobileSearch";
import { useChatPage } from "./hooks/use-chat-page";

export default function ChatPage() {
  const { state, refs, actions } = useChatPage();

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-card md:rounded-xl md:border md:shadow-sm">
      <ChannelHeader
        channelName="Global Chat"
        showMembers={state.membersPanelOpen}
        messageCount={state.messages.length}
        isConnected={state.isConnected}
        onToggleMembers={actions.onToggleMembers}
        onSearch={actions.handleSearchChange}
        onClearSearch={actions.handleClearSearch}
        searchQuery={state.searchQuery}
        onOpenSearch={actions.handleOpenMobileSearch}
      />

      {state.isMobileSearchOpen ? (
        <ChatMobileSearch
          inputRef={refs.mobileSearchInputRef}
          searchQuery={state.searchQuery}
          isSearching={state.isSearching}
          searchResults={state.searchResults}
          onSearchChange={actions.handleSearchChange}
          onClearSearch={actions.handleClearSearch}
          onSelectSearchResult={actions.handleSelectSearchResult}
        />
      ) : null}

      <div className="flex min-h-0 flex-1">
        <ChatMessagePane
          loading={state.loading}
          messages={state.messages}
          groupedMessages={state.groupedMessages}
          isSearchMode={state.isSearchMode}
          isSearching={state.isSearching}
          searchResults={state.searchResults}
          searchQuery={state.searchQuery}
          loadingMore={state.loadingMore}
          hasNewMessages={state.hasNewMessages}
          isMounted={state.isMounted}
          currentUserId={state.currentUserId}
          currentUsername={state.currentUsername}
          message={state.message}
          editingMsgId={state.editingMsgId}
          replyingMsg={state.replyingMsg}
          pendingAttachments={state.pendingAttachments}
          mentionSuggestions={state.mentionSuggestions}
          isUploading={state.isUploading}
          uploadError={state.uploadError}
          mentionQuery={state.mentionQuery}
          mentionIndex={state.mentionIndex}
          scrollViewportRef={refs.scrollViewportRef}
          messagesEndRef={refs.messagesEndRef}
          onSelectSearchResult={actions.handleSelectSearchResult}
          onReply={actions.handleReply}
          onCopy={actions.handleCopy}
          onCopyLink={actions.handleCopyLink}
          onMention={actions.handleMention}
          onEdit={actions.handleEdit}
          onDelete={actions.deleteMessage}
          onOpenProfile={actions.handleOpenProfile}
          onMessageChange={actions.handleMessageChange}
          onSend={actions.handleSend}
          onKeyDown={actions.handleKeyDown}
          onEmojiSelect={actions.onEmojiSelect}
          onCancelEdit={actions.onCancelEdit}
          onCancelReply={actions.onCancelReply}
          onFileSelect={actions.handleFileSelect}
          onRemoveAttachment={actions.handleRemoveAttachment}
          onMentionSelect={actions.handleMentionSelect}
          setMentionIndex={actions.setMentionIndex}
          onScrollToBottom={() => actions.scrollToBottom("smooth")}
        />

        <ChatMembersPanels
          isMounted={state.isMounted}
          open={state.membersPanelOpen}
          members={state.membersList}
          currentUserId={state.currentUserId || ""}
          onSelectUser={(user) => actions.handleOpenProfile(user.id)}
          onCloseMobile={actions.onMembersSidebarClose}
          onOpenProfileMobile={actions.onMembersSidebarOpenProfile}
        />
      </div>

      <ProfileDialog open={state.showProfile} onOpenChange={actions.setShowProfile} member={state.profileUser} />
    </div>
  );
}
