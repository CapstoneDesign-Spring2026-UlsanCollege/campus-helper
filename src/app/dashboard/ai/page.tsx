"use client";
// @ts-nocheck

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bot, User, Trash, Paperclip, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

export default function AIPage() {
  const [token, setToken] = useState('');
  const [myId, setMyId] = useState('anonymous');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract auth credentials on mount securely to bypass middleware blocks
  useEffect(() => {
    if(typeof window !== 'undefined') {
       setToken(localStorage.getItem('accessToken') || '');
       const userStr = localStorage.getItem('user');
       if(userStr) setMyId(JSON.parse(userStr).id);
    }
  }, []);

  const { messages, input, setInput, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: '/api/ai/chat',
    fetch: async (url, options) => {
      // Dynamically resolve auth and identity at call-time rather than hook-mount time
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : 'anonymous';
      
      const reqBody = JSON.parse(options?.body as string || '{}');
      reqBody.userId = userId;

      return fetch(url, {
         ...options,
         body: JSON.stringify(reqBody),
         headers: {
            ...options?.headers,
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
         }
      });
    },
    initialMessages: [
      { id: '1', role: 'assistant', content: 'Hello! I am your Ulsan Campus AI Assistant. How can I assist you today? You can use the paperclip to upload files or images for me to analyze.' }
    ]
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const clearChat = () => {
    setMessages([]);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
         method: 'POST',
         body: formData
      });
      const data = await res.json();
      if(res.ok) {
         // Silently embed the Cloudinary Image URL directly into the prompt so GPT-4o logic can extract it!
         setInput((prev) => prev + (prev.trim() ? '\n' : '') + `[Attached File: ${data.url}] `);
         toast.success("File attached successfully!");
      } else {
         toast.error("Failed to upload file.");
      }
    } catch(err) {
      toast.error("Network error during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">AI Assistant</h1>
          <p className="text-gray-400">Context-aware, streaming intelligence.</p>
        </div>
        <Button variant="ghost" onClick={clearChat} className="text-gray-400 hover:text-red-400 bg-white/5 border border-white/5">
          <Trash size={16} className="mr-2" /> Clear History
        </Button>
      </header>

      <Card className="flex-1 flex flex-col overflow-hidden p-0 border border-white/10 bg-black/20 shadow-2xl">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((m, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={m.id || index} 
              className={`flex items-start gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg
                ${m.role === 'user' ? 'gradient-bg text-white' : 'glass-panel text-brand-accent border border-brand-accent/20'}`}
              >
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              
              <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-brand-indigo/90 text-white rounded-tr-none shadow-xl' : 'glass-panel text-gray-200 rounded-tl-none border border-white/5 shadow-lg'} prose prose-sm md:prose-base prose-invert prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 break-words w-full`}>
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-lg glass-panel text-brand-accent border border-brand-accent/20">
                <Bot size={20} />
              </div>
              <div className="p-4 rounded-2xl glass-panel rounded-tl-none flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '0ms' }} />
                 <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '150ms' }} />
                 <span className="w-2 h-2 rounded-full bg-brand-accent animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isLoading}
              className={`px-3 border border-transparent transition-all ${isUploading ? 'text-brand-purple' : 'hover:bg-white/10'}`}
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </Button>

            <div className="flex-1 relative">
              <input 
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-white placeholder-gray-400 outline-none focus:bg-black/60 focus:border-brand-purple focus:shadow-[0_0_15px_rgba(139,92,246,0.2)] transition-all"
                value={input}
                onChange={handleInputChange}
                placeholder="Ask a question or request a summary..."
                disabled={isLoading}
              />
            </div>
            <Button type="submit" isLoading={isLoading} disabled={!(input || '').trim() || isUploading} className="px-5 bg-brand-indigo hover:shadow-[0_0_15px_rgba(102,126,234,0.4)]">
               <Send size={18} className="mr-2" /> Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
