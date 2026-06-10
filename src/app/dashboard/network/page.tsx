"use client";

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Search, UserPlus, Check, Users, Ghost, Clock3 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Avatar } from '@/components/ui/Avatar';
import { useRouter } from 'next/navigation';
import { CommandHero } from '@/components/layout/CommandHero';
import { fetchWithAuth, readApiError } from '@/lib/client-api';

type PublicUser = {
  _id: string;
  name: string;
  department?: string;
  studentId?: string;
  profilePicture?: string;
  admissionYear?: number;
  currentSemesterId?: string;
};

type PeerUser = PublicUser;

type FriendshipConnection = {
  _id: string;
  requester?: PeerUser | null;
  recipient?: PeerUser | null;
};

type PendingFriendship = {
  _id: string;
  requester?: PeerUser | null;
};

type OutgoingFriendship = {
  _id: string;
  recipient?: PeerUser | null;
};

function maskStudentId(studentId?: string) {
  if (!studentId) return 'Student ID hidden';
  if (studentId.length <= 4) return studentId;
  return `${studentId.slice(0, 2)}•••${studentId.slice(-2)}`;
}

function hasUser(value?: PeerUser | null): value is PeerUser {
  return Boolean(value?._id);
}

function getConnectionPeer(friendship: FriendshipConnection, myId: string) {
  if (friendship.requester?._id === myId) return friendship.recipient;
  if (friendship.recipient?._id === myId) return friendship.requester;
  return friendship.requester || friendship.recipient || null;
}

function hasRequester(item: PendingFriendship): item is PendingFriendship & { requester: PeerUser } {
  return hasUser(item.requester);
}

function hasRecipient(item: OutgoingFriendship): item is OutgoingFriendship & { recipient: PeerUser } {
  return hasUser(item.recipient);
}

export default function NetworkPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PublicUser[]>([]);
  const [pending, setPending] = useState<PendingFriendship[]>([]);
  const [outgoing, setOutgoing] = useState<OutgoingFriendship[]>([]);
  const [friends, setFriends] = useState<FriendshipConnection[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [myId, setMyId] = useState('');
  const [profileSnapshot, setProfileSnapshot] = useState<{ name?: string; department?: string; studentId?: string; admissionYear?: number; profilePicture?: string }>({});

  const fetchNetwork = useCallback(async () => {
    try {
      const res = await fetchWithAuth('/api/friends');
      const data = await res.json();
      if (res.ok) {
        setPending(data.pending || []);
        setOutgoing(data.outgoing || []);
        setFriends(data.connections || []);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not load your network.');
    }
  }, []);

  useEffect(() => {
    void fetchNetwork();
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored) as {
          id?: string;
          name?: string;
          department?: string;
          studentId?: string;
          admissionYear?: number;
          profilePicture?: string;
        };
        setMyId(String(parsed.id ?? ''));
        setProfileSnapshot(parsed);
      }
    } catch {
      // ignore
    }
  }, [fetchNetwork]);

  const validPending = useMemo(() => pending.filter(hasRequester), [pending]);
  const validOutgoing = useMemo(() => outgoing.filter(hasRecipient), [outgoing]);
  const validFriends = useMemo(
    () => friends.filter((friendship) => hasUser(getConnectionPeer(friendship, myId))),
    [friends, myId]
  );

  const outgoingIds = useMemo(() => new Set(validOutgoing.map((item) => item.recipient._id)), [validOutgoing]);
  const incomingIds = useMemo(() => new Set(validPending.map((item) => item.requester._id)), [validPending]);
  const friendIds = useMemo(() => new Set(
    validFriends
      .map((friendship) => getConnectionPeer(friendship, myId)?._id)
      .filter((id): id is string => Boolean(id))
  ), [validFriends, myId]);

  const openChatForUser = (user: PublicUser, context: 'network-search' | 'network-friend') => {
    if (!user?._id || user._id === myId) return;

    const params = new URLSearchParams({
      userId: user._id,
      name: user.name || 'Campus user',
      context,
    });

    if (user.department) params.set('department', user.department);
    if (user.profilePicture) params.set('profilePicture', user.profilePicture);

    router.push(`/dashboard/chat?${params.toString()}`);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if(!query) return;
    setIsSearching(true);
    try {
       const res = await fetchWithAuth(`/api/friends?action=search&q=${encodeURIComponent(query)}`);
       const data = await res.json();
       if(res.ok) setResults(data);
       else toast.error(data.error || "Search failed");
    } catch { toast.error("Search failed"); } finally { setIsSearching(false); }
  };

  const sendRequest = async (targetId: string) => {
    try {
      const res = await fetchWithAuth('/api/friends', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetId })
      });
      if(res.ok) {
         toast.success("Friend request sent!");
         void fetchNetwork();
      }
      else toast.error(await readApiError(res, "Failed to send request"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send request');
    }
  };

  const handleAction = async (friendshipId: string, action: 'accept'|'reject') => {
    try {
      const res = await fetchWithAuth('/api/friends', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friendshipId, action })
      });
      if(res.ok) {
         toast.success(action === 'accept' ? "Friend added" : "Request declined");
         void fetchNetwork();
      }
      else {
        toast.error(await readApiError(res, 'Could not update the request.'));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not update the request.');
    }
  };

  const getRelationshipState = useCallback((userId: string) => {
    if (userId === myId) return 'self';
    if (friendIds.has(userId)) return 'friend';
    if (incomingIds.has(userId)) return 'incoming';
    if (outgoingIds.has(userId)) return 'outgoing';
    return 'available';
  }, [friendIds, incomingIds, myId, outgoingIds]);

  return (
    <div className="space-y-8 pb-12">
      <CommandHero
        eyebrow="People Graph"
        title="Student Network"
        description="Find classmates, understand connection state quickly, and message people from a social space that feels more trustworthy."
        icon={Users}
        stats={[
          { label: 'Active friends', value: validFriends.length, tone: 'mint' },
          { label: 'Pending requests', value: validPending.length, tone: 'accent' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Node */}
          <Card className="bg-black/40 border border-white/5 backdrop-blur-xl">
             <form onSubmit={handleSearch} className="flex flex-col gap-4 md:flex-row md:items-end">
                <div className="flex-1">
                   <label className="text-xs text-brand-indigo mb-2 block font-bold uppercase tracking-widest">Search Students (Name or Major)</label>
                   <Input icon={Search} placeholder="e.g. Computer Science..." value={query} onChange={e => setQuery(e.target.value)} />
                </div>
                <Button type="submit" isLoading={isSearching} className="w-full bg-brand-indigo text-white shadow-brand-indigo/30 hover:shadow-[0_0_20px_rgba(102,126,234,0.4)] md:mb-1 md:w-auto">Search</Button>
             </form>
             
             {results.length > 0 && (
               <div className="mt-8 space-y-3">
                 <h3 className="text-xs font-bold text-brand-accent uppercase tracking-widest pl-2">Search Results</h3>
                 {results.map((user, i) => (
                   <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{delay: i*0.05}} key={user._id} className="flex flex-col gap-4 rounded-xl border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                         <Avatar src={user.profilePicture} name={user.name} className="h-11 w-11 text-base" />
                         <div className="min-w-0">
                           <div className="flex flex-wrap items-center gap-2">
                             <h4 className="truncate font-bold text-white text-lg tracking-tight">{user.name}</h4>
                             <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                               {getRelationshipState(user._id)}
                             </span>
                           </div>
                           <span className="block truncate text-xs text-brand-purple tracking-widest uppercase">{user.department}</span>
                           <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                             <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">{maskStudentId(user.studentId)}</span>
                             {user.admissionYear ? (
                               <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Admit {user.admissionYear}</span>
                             ) : null}
                           </div>
                         </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => openChatForUser(user, 'network-search')}
                          className="h-10 px-3 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 text-white hover:bg-brand-indigo/20"
                        >
                          Message
                        </Button>
                        {getRelationshipState(user._id) === 'available' ? (
                          <button onClick={() => sendRequest(user._id)} className="p-3 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent hover:text-black hover:shadow-brand-accent transition-all duration-300">
                             <UserPlus size={20} />
                          </button>
                        ) : getRelationshipState(user._id) === 'incoming' ? (
                          <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-100">
                            Incoming request
                          </div>
                        ) : getRelationshipState(user._id) === 'outgoing' ? (
                          <div className="rounded-lg border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-100">
                            Request sent
                          </div>
                        ) : getRelationshipState(user._id) === 'friend' ? (
                          <div className="rounded-lg border border-violet-300/20 bg-violet-400/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100">
                            Connected
                          </div>
                        ) : null}
                      </div>
                   </motion.div>
                 ))}
               </div>
             )}
          </Card>

          {/* Established Connections */}
          <div>
             <h3 className="text-lg font-bold text-white mb-4 block pl-2">My Friends</h3>
             {validFriends.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-gray-500">
                  <Ghost size={48} className="mx-auto mb-4 opacity-20" />
                  You haven&apos;t added any friends yet. Search above to find classmates!
                </div>
             ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {validFriends.map((f, i) => {
                    const peer = getConnectionPeer(f, myId);
                    if (!peer) return null;
                    return (
                      <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{delay: i * 0.1}} key={f._id}>
                        <Card className="group flex flex-col gap-4 p-5 transition-colors hover:border-brand-indigo/50 hover:bg-brand-indigo/5 sm:flex-row sm:items-center">
                           <Avatar src={peer.profilePicture} name={peer.name} className="h-14 w-14 text-xl group-hover:shadow-[0_0_20px_rgba(102,126,234,0.4)] transition-all" />
                           <div className="flex flex-col flex-1 min-w-0 truncate">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-white text-lg leading-tight truncate">{peer.name}</h4>
                                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-slate-400">
                                  Connected
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-500 font-mono tracking-widest uppercase truncate">{peer.department}</span>
                              <div className="mt-2 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">{maskStudentId(peer.studentId)}</span>
                                {peer.admissionYear ? (
                                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1">Admit {peer.admissionYear}</span>
                                ) : null}
                              </div>
                           </div>
                           <Button
                             type="button"
                             variant="ghost"
                             onClick={() => openChatForUser(peer, 'network-friend')}
                             className="h-10 shrink-0 px-3 text-[10px] uppercase tracking-widest border border-white/10 bg-white/5 text-white hover:bg-brand-indigo/20"
                           >
                             Message
                           </Button>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
             )}
          </div>
        </div>

        {/* Action Center - Sidebar */}
        <div className="space-y-6">
           <Card className="border border-white/10 bg-black/40">
             <div className="flex items-start gap-3">
               <Avatar src={profileSnapshot.profilePicture} name={profileSnapshot.name || 'You'} className="h-14 w-14 text-lg" />
               <div className="min-w-0">
                 <div className="flex flex-wrap items-center gap-2">
                   <h3 className="truncate text-lg font-bold text-white">{profileSnapshot.name || 'Your profile'}</h3>
                   <span className="rounded-full border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-emerald-100">
                     Campus verified
                   </span>
                 </div>
                 <p className="mt-1 text-[10px] uppercase tracking-[0.22em] text-brand-indigo">{profileSnapshot.department || 'Department not set'}</p>
               </div>
             </div>
             <div className="mt-4 grid gap-3">
               <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                 <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Student ID</p>
                 <p className="mt-1 text-sm font-semibold text-white">{maskStudentId(profileSnapshot.studentId)}</p>
               </div>
               <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                 <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Admission year</p>
                 <p className="mt-1 text-sm font-semibold text-white">{profileSnapshot.admissionYear || 'Not set yet'}</p>
               </div>
             </div>
           </Card>

           <Card className="border border-brand-accent/20 bg-brand-accent/5 lg:sticky lg:top-24">
              <h3 className="text-sm font-bold text-brand-accent mb-4 uppercase tracking-widest flex items-center gap-2"><Check size={16}/> Friend Requests</h3>
              {validPending.length === 0 ? <p className="text-xs text-gray-500 text-center py-6">No pending requests.</p> : (
                 <div className="space-y-4">
                    {validPending.map(req => (
                       <div key={req._id} className="p-4 bg-black/40 rounded-xl border border-white/5 shadow-2xl">
                          <div className="mb-4 flex items-center gap-3">
                             <Avatar src={req.requester.profilePicture} name={req.requester.name} className="h-10 w-10 text-sm" />
                             <div className="min-w-0">
                               <p className="text-base text-white font-bold truncate">{req.requester.name}</p>
                               <p className="text-[10px] text-gray-500 font-mono uppercase truncate">{req.requester.department}</p>
                             </div>
                          </div>
                          <div className="flex gap-2">
                             <Button onClick={() => handleAction(req._id, 'accept')} className="flex-1 text-xs py-1 h-9 bg-brand-accent text-black font-bold border-none hover:shadow-brand-accent shadow-md">Accept</Button>
                             <Button onClick={() => handleAction(req._id, 'reject')} variant="ghost" className="flex-1 text-xs py-1 h-9 hover:bg-red-500/20 hover:text-red-400">Decline</Button>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </Card>

           <Card className="border border-cyan-300/15 bg-cyan-400/5">
             <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-cyan-100">
               <Clock3 size={15} />
               Outgoing Requests
             </h3>
             {validOutgoing.length === 0 ? (
               <p className="py-4 text-xs text-slate-500">No requests waiting right now.</p>
             ) : (
               <div className="space-y-3">
                 {validOutgoing.map((request) => (
                   <div key={request._id} className="rounded-xl border border-white/10 bg-black/35 p-4">
                     <div className="flex items-center gap-3">
                       <Avatar src={request.recipient.profilePicture} name={request.recipient.name} className="h-10 w-10 text-sm" />
                       <div className="min-w-0">
                         <p className="truncate text-sm font-semibold text-white">{request.recipient.name}</p>
                         <p className="truncate text-[10px] uppercase tracking-[0.18em] text-slate-500">{request.recipient.department}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </Card>
        </div>
      </div>
    </div>
  );
}
