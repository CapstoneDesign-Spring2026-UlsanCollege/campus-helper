"use client";

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock3, MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth, readApiError } from '@/lib/client-api';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';

type PeerUser = {
  _id: string;
  name: string;
  department?: string;
  profilePicture?: string;
  source?: 'friend' | 'message' | 'listing';
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount?: number;
};

type ChatEntryContext = 'market' | 'lost-found' | 'notes' | 'network-search' | 'network-friend';

type ChatMessage = {
  _id: string;
  sender: string;
  content: string;
  createdAt: string;
  read?: boolean;
};

function readMyId() {
  try {
    const user = localStorage.getItem('user');
    if (!user) return '';
    return String(JSON.parse(user).id ?? '');
  } catch {
    return '';
  }
}

function getContextLabel(context: ChatEntryContext | null) {
  switch (context) {
    case 'market':
      return 'Came from Marketplace';
    case 'lost-found':
      return 'Came from Lost & Found';
    case 'notes':
      return 'Came from Notes';
    case 'network-search':
      return 'Came from Network Search';
    case 'network-friend':
      return 'Came from My Friends';
    default:
      return '';
  }
}

function formatRelativeTime(value?: string) {
  if (!value) return '';
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return '';

  const diffMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(value).toLocaleDateString();
}

function ChatPageContent() {
  const searchParams = useSearchParams();
  const [contacts, setContacts] = useState<PeerUser[]>([]);
  const [activeChat, setActiveChat] = useState<PeerUser | null>(null);
  const [activeContext, setActiveContext] = useState<ChatEntryContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [content, setContent] = useState('');
  const [myId] = useState(() => readMyId());
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelectChat = useCallback((peer: PeerUser, context: ChatEntryContext | null = null) => {
    setActiveChat(peer);
    setActiveContext(context);
    setContent('');
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/chat/contacts');
      const data = await res.json();
      if (res.ok) {
        setContacts(Array.isArray(data.contacts) ? data.contacts : []);
      } else {
        toast.error(data.error || 'Could not load chat contacts.');
      }
    } catch {
      toast.error('Could not load chat contacts.');
    }
  }, []);

  const fetchMessages = useCallback(async (targetId: string) => {
    try {
      const res = await fetchWithAuth(`/api/chat?targetId=${targetId}`);
      if(res.ok) {
        setMessages(await res.json());
        setContacts((current) => current.map((contact) => (
          contact._id === targetId
            ? { ...contact, unreadCount: 0 }
            : contact
        )));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void fetchContacts());
  }, [fetchContacts]);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!userId || userId === myId) return;
    const context = searchParams.get('context');
    const draft = searchParams.get('draft');
    const normalizedContext = (
      context === 'market' ||
      context === 'lost-found' ||
      context === 'notes' ||
      context === 'network-search' ||
      context === 'network-friend'
    ) ? context : null;

    setActiveChat((current) => {
      if (current?._id === userId) return current;

      return {
        _id: userId,
        name: searchParams.get('name') || 'Campus user',
        department: searchParams.get('department') || undefined,
        profilePicture: searchParams.get('profilePicture') || undefined,
        source: 'listing',
      };
    });
    setActiveContext(normalizedContext);
    if (draft) {
      setContent(draft);
    }
  }, [myId, searchParams]);

  useEffect(() => {
    if (!activeChat) return;

    setContacts((currentContacts) => {
      const matchingContact = currentContacts.find((contact) => contact._id === activeChat._id);

      if (matchingContact) {
        if (matchingContact !== activeChat) {
          setActiveChat(matchingContact);
        }
        return currentContacts;
      }

      return [activeChat, ...currentContacts];
    });
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;

    const tick = () => void fetchMessages(activeChat._id);
    queueMicrotask(tick);
    const interval = setInterval(tick, 2500);

    return () => clearInterval(interval);
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!content.trim() || !activeChat) return;
    try {
      const res = await fetchWithAuth('/api/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ targetId: activeChat._id, content })
      });
      if (!res.ok) {
        throw new Error(await readApiError(res, 'Could not send your message.'));
      }
      setContent('');
      void fetchMessages(activeChat._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send your message.');
    }
  };

  return (
    <div className="responsive-page space-y-5">
      <CommandHero
        eyebrow="Conversation Relay"
        title="Chat"
        description="Talk to classmates from listings, notes, or your network without losing context."
        icon={MessageCircle}
        stats={[
          { label: 'Active contacts', value: contacts.length, tone: 'mint' },
          { label: 'Open thread', value: activeChat?.name || 'None selected', tone: 'default' },
        ]}
      />
      <div className="flex min-h-[calc(100dvh-7rem)] min-w-0 flex-col gap-4 lg:h-[calc(100vh-140px)] lg:flex-row lg:gap-6">
      <Card className="flex shrink-0 flex-col border-white/5 bg-black/40 p-3 backdrop-blur-xl lg:w-80 lg:p-4">
         <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-gray-400 lg:mb-6 lg:text-sm"><MessageCircle size={18} className="text-brand-purple" /> Messages</h2>
         <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:flex-1 lg:space-y-2 lg:overflow-y-auto lg:pr-2">
           {contacts.map((peer) => {
              const isActive = activeChat?._id === peer._id;
              return (
                 <div 
                   key={peer._id} 
                   onClick={() => handleSelectChat(peer, null)}
                   className={`min-w-[220px] cursor-pointer rounded-xl border p-3 transition-all sm:min-w-[260px] lg:min-w-0 ${isActive ? 'border-brand-purple/50 bg-brand-purple/20' : 'border-transparent hover:bg-white/5'}`}
                 >
                   <div className="flex items-center gap-3">
                   <Avatar src={peer.profilePicture} name={peer.name} className={`h-10 w-10 text-sm ${isActive ? 'shadow-brand-indigo/50' : ''}`} />
                  <div className="min-w-0 truncate">
                     <div className="flex items-center gap-2">
                       <p className={`font-bold text-sm leading-tight truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{peer.name}</p>
                       {(peer.unreadCount || 0) > 0 && (
                         <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold text-black">
                           {peer.unreadCount! > 9 ? '9+' : peer.unreadCount}
                         </span>
                       )}
                     </div>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">
                       {peer.department || (peer.source === 'listing' ? 'Direct listing chat' : 'Campus contact')}
                     </p>
                     {peer.lastMessagePreview ? (
                       <p className="mt-1 truncate text-xs text-slate-400">{peer.lastMessagePreview}</p>
                     ) : (
                       <p className="mt-1 truncate text-xs text-slate-500">
                         {peer.source === 'listing' ? 'New listing conversation ready.' : 'Open this thread to start talking.'}
                       </p>
                     )}
                     {peer.lastMessageAt && (
                       <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                         <Clock3 size={10} />
                         {formatRelativeTime(peer.lastMessageAt)}
                       </p>
                     )}
                   </div>
                   </div>
                 </div>
              )
           })}
         </div>
      </Card>

      <Card className="relative flex min-h-[65dvh] min-w-0 flex-1 flex-col overflow-hidden border-white/5 bg-black/20 p-0 backdrop-blur-2xl lg:min-h-0">
         {activeChat ? (
            <>
              <div className="z-10 shrink-0 border-b border-white/5 bg-white/5 px-4 py-4 sm:px-5 lg:px-6">
                 <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <Avatar src={activeChat.profilePicture} name={activeChat.name} className="h-11 w-11 text-lg shadow-[0_0_15px_rgba(102,126,234,0.3)] lg:h-12 lg:w-12 lg:text-xl" />
                    <div className="min-w-0">
                       <h3 className="truncate text-lg font-bold leading-tight text-white lg:text-xl">{activeChat.name}</h3>
                       <div className="mt-1 flex flex-wrap items-center gap-2">
                       <span className="text-[10px] text-brand-accent tracking-widest uppercase flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse block"></span> Secure Chat Active
                        </span>
                        {activeContext && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-200">
                            {getContextLabel(activeContext)}
                          </span>
                        )}
                        {activeChat.lastMessageAt && (
                          <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Last active {formatRelativeTime(activeChat.lastMessageAt)}
                          </span>
                        )}
                       </div>
                    </div>
                 </div>
              </div>
              
              <div ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto p-4 scroll-smooth sm:p-5 lg:space-y-6 lg:p-6">
                 <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                       const isMe = msg.sender === myId;
                       return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} 
                            key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                             <div className={`max-w-[88%] min-w-0 rounded-2xl p-3.5 px-4 sm:max-w-[75%] sm:px-5 ${isMe ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white rounded-br-sm shadow-xl' : 'bg-black/60 text-gray-200 rounded-bl-sm border border-white/10 backdrop-blur-md shadow-lg'}`}>
                               <p className="break-words text-sm leading-relaxed sm:text-[15px]">{msg.content}</p>
                               <span className="text-[9px] opacity-70 mt-2 flex items-center gap-1 uppercase tracking-widest font-mono">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  {isMe && <span className="ml-2 font-bold text-brand-accent">{msg.read ? "Read" : "Sent"}</span>}
                               </span>
                             </div>
                          </motion.div>
                       )
                    })}
                 </AnimatePresence>
                 {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-brand-indigo/30 uppercase tracking-widest text-xs font-bold font-mono">
                       <MessageCircle size={64} className="mb-4" />
                       <p>Start the conversation.</p>
                    </div>
                 )}
              </div>

              <div className="z-10 shrink-0 border-t border-white/5 bg-black/60 p-3 sm:p-4">
                 <form onSubmit={sendMessage} className="flex items-end gap-2 sm:gap-3">
                    <input 
                      className="focus-ring min-h-[52px] min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors placeholder-gray-600 focus:border-brand-purple sm:px-5 md:text-sm"
                      placeholder="Type a message..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                    <Button type="submit" disabled={!content.trim()} className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-brand-purple p-0 transition-all hover:shadow-[0_0_20px_rgba(102,126,234,0.4)] sm:h-14 sm:w-14">
                       <Send size={20} className="ml-1" />
                    </Button>
                 </form>
              </div>
            </>
         ) : (
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center text-gray-500">
               <MessageCircle size={72} className="mb-6 opacity-10" />
               <p className="text-xl font-bold text-white mb-2">No Conversation Selected</p>
               <p className="text-sm">Select a contact from the sidebar or jump in from a listing.</p>
            </div>
         )}
      </Card>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-sm uppercase tracking-[0.24em] text-gray-500">Loading chat relay...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
