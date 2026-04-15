"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageCircle, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const [friends, setFriends] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [myId, setMyId] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if(user) setMyId(JSON.parse(user).id);
    fetchFriends();
  }, []);

  useEffect(() => {
    let interval: any;
    if(activeChat) {
      fetchMessages(activeChat._id);
      interval = setInterval(() => fetchMessages(activeChat._id), 2500);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends', { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }});
      const data = await res.json();
      if(res.ok) setFriends(data.connections || []);
    } catch(e) {}
  };

  const fetchMessages = async (targetId: string) => {
    try {
      const res = await fetch(`/api/chat?targetId=${targetId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }});
      if(res.ok) setMessages(await res.json());
    } catch(e) {}
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!content.trim() || !activeChat) return;
    try {
      await fetch('/api/chat', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
         body: JSON.stringify({ targetId: activeChat._id, content })
      });
      setContent('');
      fetchMessages(activeChat._id);
    } catch(e) {}
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 pb-4">
      <Card className="w-80 flex flex-col p-4 bg-black/40 border-white/5 backdrop-blur-xl shrink-0">
         <h2 className="text-sm tracking-widest uppercase font-bold text-gray-400 mb-6 flex items-center gap-2"><MessageCircle size={18} className="text-brand-purple" /> Messages</h2>
         <div className="flex-1 overflow-y-auto space-y-2 pr-2">
           {friends.map(f => {
              const peer = f.requester._id === myId ? f.recipient : f.requester;
              const isActive = activeChat?._id === peer._id;
              return (
                 <div 
                   key={f._id} 
                   onClick={() => setActiveChat(peer)}
                   className={`p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 ${isActive ? 'bg-brand-purple/20 border border-brand-purple/50' : 'hover:bg-white/5 border border-transparent'}`}
                 >
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${isActive ? 'gradient-bg shadow-brand-indigo/50' : 'bg-white/10'}`}>{peer.name.charAt(0)}</div>
                   <div className="truncate">
                     <p className={`font-bold text-sm leading-tight truncate ${isActive ? 'text-white' : 'text-gray-300'}`}>{peer.name}</p>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest truncate">{peer.department}</p>
                   </div>
                 </div>
              )
           })}
         </div>
      </Card>

      <Card className="flex-1 flex flex-col p-0 bg-black/20 border-white/5 relative overflow-hidden backdrop-blur-2xl">
         {activeChat ? (
            <>
              <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between z-10 shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xl uppercase shadow-[0_0_15px_rgba(102,126,234,0.3)]">
                       {activeChat.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-white leading-tight">{activeChat.name}</h3>
                       <span className="text-[10px] text-brand-accent tracking-widest uppercase flex items-center gap-1">
                         <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse block"></span> Secure Chat Active
                       </span>
                    </div>
                 </div>
              </div>
              
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth z-10 relative">
                 <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                       const isMe = msg.sender === myId;
                       return (
                          <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} 
                            key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                             <div className={`max-w-[70%] p-3.5 px-5 rounded-2xl ${isMe ? 'bg-gradient-to-r from-brand-indigo to-brand-purple text-white rounded-br-sm shadow-xl' : 'bg-black/60 text-gray-200 rounded-bl-sm border border-white/10 backdrop-blur-md shadow-lg'}`}>
                               <p className="text-[15px] leading-relaxed">{msg.content}</p>
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

              <div className="p-4 bg-black/60 border-t border-white/5 z-10 shrink-0">
                 <form onSubmit={sendMessage} className="flex gap-3">
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 text-white outline-none focus:border-brand-purple transition-colors placeholder-gray-600"
                      placeholder="Type a message..."
                      value={content}
                      onChange={e => setContent(e.target.value)}
                    />
                    <Button type="submit" disabled={!content.trim()} className="bg-brand-purple shrink-0 h-14 w-14 p-0 flex items-center justify-center rounded-xl hover:shadow-[0_0_20px_rgba(102,126,234,0.4)] transition-all">
                       <Send size={20} className="ml-1" />
                    </Button>
                 </form>
              </div>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
               <MessageCircle size={72} className="mb-6 opacity-10" />
               <p className="text-xl font-bold text-white mb-2">No Conversation Selected</p>
               <p className="text-sm">Select a friend's name from the sidebar to chat.</p>
            </div>
         )}
      </Card>
    </div>
  );
}
