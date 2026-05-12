import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookOpen,
  Calendar,
  Home,
  MapPin,
  MessageCircle,
  MessageSquare,
  ShoppingBag,
  Users,
} from 'lucide-react';

export type AppNavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
};

// Single source of truth for primary dashboard navigation.
export const dashboardNavItems: AppNavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Calendar, label: 'Timetable', href: '/dashboard/timetable' },
  { icon: BookOpen, label: 'Notes', href: '/dashboard/notes' },
  { icon: ShoppingBag, label: 'Marketplace', href: '/dashboard/market' },
  { icon: MapPin, label: 'Lost & Found', href: '/dashboard/lost-found' },
  { icon: Users, label: 'Network', href: '/dashboard/network' },
  { icon: MessageCircle, label: 'Chat', href: '/dashboard/chat' },
  { icon: MessageSquare, label: 'AI Assistant', href: '/dashboard/ai' },
];
