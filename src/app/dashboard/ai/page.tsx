"use client";

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { Button } from '@/components/ui/Button';
import { Bot, Loader2, Paperclip, Send, Sparkles, Trash, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

function getStoredUserId() {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).id || 'anonymous' : 'anonymous';
  } catch {
    return 'anonymous';
  }
}

function getMessageText(message: UIMessage) {
  return message.parts
    ?.map((part) => (part.type === 'text' ? part.text : ''))
    .filter(Boolean)
    .join('\n')
    .trim();
}

export default function AIPage() {
  const [input, setInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [userId, setUserId] = useState('anonymous');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: '/api/ai/chat',
        headers: () => ({
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        }),
        prepareSendMessagesRequest: ({ messages, id, headers }) => ({
          body: {
            id,
            messages,
            userId: getStoredUserId(),
          },
          headers,
        }),
      }),
    []
  );

  const { messages, sendMessage, setMessages, status, error, clearError } = useChat<UIMessage>({
    transport,
    onError: (chatError) => {
      toast.error(chatError.message || 'The assistant could not respond.');
    },
  });

  const isBusy = status === 'submitted' || status === 'streaming';

  useEffect(() => {
    const loadHistory = async () => {
      const nextUserId = getStoredUserId();
      setUserId(nextUserId);

      try {
        const res = await fetch(`/api/ai/chat?userId=${nextUserId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
          },
        });
        const data = await res.json();

        if (res.ok && Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
      } catch {
        toast.error('Could not load your previous AI chat.');
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, status]);

  const clearChat = async () => {
    setMessages([]);
    clearError();

    try {
      await fetch(`/api/ai/chat?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      });
      toast.success('AI history cleared.');
    } catch {
      toast.error('History cleared locally, but the database did not update.');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = input.trim();
    if (!text || isBusy || isUploading) return;

    clearError();
    setInput('');
    await sendMessage({ text });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.url) {
        setInput((prev) => `${prev}${prev.trim() ? '\n' : ''}[Attached File: ${data.url}] `);
        toast.success('File attached.');
      } else {
        toast.error(data.error || 'Failed to upload file.');
      }
    } catch {
      toast.error('Network error during upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex h-[calc(100vh-112px)] max-w-6xl flex-col gap-4 pb-2 md:h-[calc(100vh-132px)]"
    >
      <header className="grid gap-4 overflow-hidden rounded-lg border border-white/10 bg-black/55 p-4 shadow-2xl shadow-black/40 md:grid-cols-[1fr_auto] md:p-5">
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            <Sparkles size={14} />
            Campus intelligence online
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">AI Assistant</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Ask for study help, summarize notes, plan your week, or attach a file. Your conversation is saved to your campus account.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={clearChat}
          className="h-11 self-start rounded-lg border border-white/10 bg-white/[0.03] px-4 text-slate-300 hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-200"
        >
          <Trash size={16} className="mr-2" />
          Clear
        </Button>
      </header>

      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#07100f]/80 shadow-2xl shadow-black/40">
        <div className="absolute inset-0 bg-[url('/campus_bg.png')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,12,11,0.84),rgba(3,7,7,0.96))]" />

        <div className="relative flex-1 overflow-y-auto p-4 md:p-6">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-300">
              <Loader2 size={18} className="mr-2 animate-spin text-emerald-200" />
              Loading your AI workspace...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/20 bg-emerald-300/10 text-emerald-100">
                  <Bot size={30} />
                </div>
                <h2 className="text-xl font-semibold text-white">What should we work on?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Try asking for an exam plan, a code explanation, a note summary, or campus workflow help.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((message, index) => {
                  const isUser = message.role === 'user';
                  const text = getMessageText(message);
                  if (!text) return null;

                  return (
                    <motion.div
                      key={message.id || index}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                          isUser
                            ? 'border-cyan-200/30 bg-cyan-300/15 text-cyan-100'
                            : 'border-emerald-200/30 bg-emerald-300/15 text-emerald-100'
                        }`}
                      >
                        {isUser ? <User size={17} /> : <Bot size={17} />}
                      </div>
                      <div className={`max-w-[86%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-lg border px-4 py-3 text-sm leading-6 shadow-xl md:text-[15px] ${
                            isUser
                              ? 'border-cyan-200/20 bg-cyan-300/15 text-cyan-50'
                              : 'border-white/10 bg-black/45 text-slate-100'
                          } prose prose-sm prose-invert max-w-none prose-p:my-2 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/60`}
                        >
                          <ReactMarkdown>{text}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {isBusy && (
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-emerald-200/30 bg-emerald-300/15 text-emerald-100">
                    <Bot size={17} />
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/45 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-200 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {error && (
          <div className="relative border-t border-red-300/20 bg-red-500/10 px-4 py-2 text-sm text-red-100">
            {error.message || 'Something went wrong while contacting the assistant.'}
          </div>
        )}

        <div className="relative border-t border-white/10 bg-black/50 p-3 backdrop-blur-xl md:p-4">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isBusy}
              className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-white/[0.03] p-0 text-slate-200 hover:border-emerald-200/30 hover:bg-emerald-300/10"
              title="Attach file"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </Button>

            <textarea
              className="min-h-12 flex-1 resize-none rounded-lg border border-white/10 bg-black/45 px-4 py-3 text-sm leading-6 text-white outline-none transition focus:border-emerald-200/40 focus:bg-black/65 placeholder:text-slate-500"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  event.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Ask a question, paste notes, or attach a file..."
              disabled={isBusy}
              rows={1}
            />

            <Button
              type="submit"
              disabled={!input.trim() || isUploading || isBusy}
              className="h-12 shrink-0 rounded-lg bg-emerald-300 px-4 font-semibold text-black hover:bg-cyan-200 md:px-5"
            >
              {isBusy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="md:mr-2" />}
              <span className="hidden md:inline">Send</span>
            </Button>
          </form>
        </div>
      </section>
    </motion.div>
  );
}
