import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'friend_request' | 'friend_accept' | 'announcement';
  title: string;
  body: string;
  link: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['friend_request', 'friend_accept', 'announcement'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  link: { type: String, required: true, default: '/dashboard' },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true });

NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
