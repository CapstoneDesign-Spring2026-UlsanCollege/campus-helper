import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  priority: 'normal' | 'important' | 'urgent';
  pinned: boolean;
  publishAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal', index: true },
  pinned: { type: Boolean, default: false, index: true },
  publishAt: { type: Date, index: true },
  expiresAt: { type: Date },
}, { timestamps: true });

AnnouncementSchema.index({ pinned: -1, publishAt: -1, createdAt: -1 });

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
