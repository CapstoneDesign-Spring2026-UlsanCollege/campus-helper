import Notification from '@/models/Notification';

type NotificationPayload = {
  userId: string;
  type: 'friend_request' | 'friend_accept' | 'announcement';
  title: string;
  body: string;
  link: string;
};

export async function createNotification(payload: NotificationPayload) {
  return Notification.create(payload);
}

export async function createNotifications(payloads: NotificationPayload[]) {
  if (payloads.length === 0) return [];
  return Notification.insertMany(payloads, { ordered: false });
}
