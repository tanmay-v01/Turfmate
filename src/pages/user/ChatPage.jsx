import { useState, useMemo } from 'react';
import { MessageSquare, Users, History, ShieldAlert, Gamepad2, Search, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import PageHeader from '../../components/ui/PageHeader';
import ActiveChatRoom from '../../components/chat/ActiveChatRoom';
import ChatInboxRow from '../../components/chat/ChatInboxRow';
import FriendRequestList from '../../components/chat/FriendRequestList';
import EmptyState from '../../components/ui/EmptyState';
import { IMAGES } from '../../data/images';
import { filterChats, countUnreadByType } from '../../utils/chatHelpers';

const TABS = [
  { id: 'games', label: 'games', icon: MessageSquare, types: ['game'] },
  { id: 'lobbies', label: 'lobbies', icon: Gamepad2, types: ['lobby'] },
  { id: 'dms', label: 'dms', icon: Users, types: ['dm'] },
  { id: 'requests', label: 'requests', icon: ShieldAlert, types: [] },
];

export default function ChatPage() {
  const app = useApp();
  const [activeTab, setActiveTab] = useState('games');
  const [showPastGames, setShowPastGames] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const activeChat = app.chats.find((c) => c.id === app.activeChatId);

  const filteredChats = useMemo(
    () => filterChats(app.chats, searchQuery),
    [app.chats, searchQuery]
  );

  const gameChats = filteredChats.filter((c) => c.type === 'game' && c.isActive !== false);
  const pastGames = filteredChats.filter((c) => c.type === 'game' && c.isActive === false);
  const lobbyChats = filteredChats.filter((c) => c.type === 'lobby');
  const dms = filteredChats.filter((c) => c.type === 'dm');

  const tabUnread = (tabId) => {
    if (tabId === 'requests') return app.friendRequests?.length || 0;
    const types = TABS.find((t) => t.id === tabId)?.types || [];
    return types.reduce((sum, type) => sum + countUnreadByType(app.chats, type), 0);
  };

  const openChat = (id) => app.setActiveChatId(id);

  const renderList = (list, emptyProps) => {
    if (list.length === 0) {
      if (!emptyProps?.title) return null;
      return (
        <EmptyState
          emoji={emptyProps.emoji}
          title={emptyProps.title}
          description={emptyProps.description}
          actionLabel={emptyProps.actionLabel}
          onAction={emptyProps.onAction}
          image={emptyProps.image}
        />
      );
    }
    return (
      <div className="tm-chat-inbox-list">
        {list.map((c) => (
          <ChatInboxRow
            key={c.id}
            chat={c}
            userProfile={app.userProfile}
            active={app.activeChatId === c.id}
            onClick={() => openChat(c.id)}
          />
        ))}
      </div>
    );
  };

  const inboxPanel = (
    <div className="tm-chat-inbox">
      <div className="tm-chat-inbox__header">
        <PageHeader
          title="chat"
          subtitle="squad comms & game rooms"
          onBack={() => app.setView('home')}
          badge="inbox"
          icon={MessageSquare}
        />

        <div className="relative mb-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats…"
            className="tm-chat-search"
          />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => {
            const unread = tabUnread(tab.id);
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`tm-chip shrink-0 relative ${activeTab === tab.id ? 'tm-chip-active' : ''}`}
              >
                <tab.icon className="w-3 h-3" /> {tab.label}
                {unread > 0 && (
                  <span className="tm-chat-tab-badge">{unread > 9 ? '9+' : unread}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="tm-chat-inbox__body">
        {activeTab === 'games' && (
          <>
            {renderList(gameChats, {
              emoji: '⚽',
              title: 'no game chats yet',
              description: 'Join a split game — a room opens automatically.',
              actionLabel: 'browse locker room',
              onAction: () => app.setView('locker_room'),
              image: IMAGES.locker,
            })}
            {pastGames.length > 0 && (
              <button
                type="button"
                onClick={() => setShowPastGames(!showPastGames)}
                className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
              >
                <History className="w-4 h-4" /> {showPastGames ? 'hide' : 'show'} archived games ({pastGames.length})
              </button>
            )}
            {showPastGames && (
              <div className="mt-3 opacity-75">{renderList(pastGames, { title: 'none' })}</div>
            )}
          </>
        )}

        {activeTab === 'lobbies' &&
          renderList(lobbyChats, {
            emoji: '🏟️',
            title: 'no community lobbies',
            description: 'Sport lobbies appear when players join your area.',
            actionLabel: 'find players',
            onAction: () => app.setView('radar'),
          })}

        {activeTab === 'dms' &&
          renderList(dms, {
            emoji: '💬',
            title: 'no direct messages',
            description: 'Message friends from Player Radar or My Squad.',
            actionLabel: 'open squad',
            onAction: () => app.setView('squad'),
            image: '/images/empty_chats.png'
          })}

        {activeTab === 'requests' && (
          <FriendRequestList
            requests={app.friendRequests || []}
            onAccept={app.acceptFriendRequest}
            onDecline={app.declineFriendRequest}
          />
        )}
      </div>
    </div>
  );

  const roomPanel = activeChat ? (
    <ActiveChatRoom
      chat={activeChat}
      onBack={() => app.setActiveChatId(null)}
      embedded
    />
  ) : (
    <div className="tm-chat-room-placeholder hidden lg:flex">
      <div className="text-center max-w-xs px-6">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-7 h-7 text-indigo-500" />
        </div>
        <p className="font-display font-extrabold text-slate-800 lowercase text-lg">pick a conversation</p>
        <p className="text-sm text-slate-500 mt-2">
          Game rooms, community lobbies, and DMs with your squad — all in one place.
        </p>
      </div>
    </div>
  );

  return (
    <div className={`tm-chat-layout ${activeChat ? 'tm-chat-layout--open' : ''}`}>
      <aside className={`tm-chat-inbox-wrap ${activeChat ? 'tm-chat-inbox-wrap--hidden-mobile' : ''}`}>
        {inboxPanel}
      </aside>
      <main className={`tm-chat-room-wrap ${activeChat ? 'tm-chat-room-wrap--visible-mobile' : ''}`}>
        {roomPanel}
      </main>
    </div>
  );
}
