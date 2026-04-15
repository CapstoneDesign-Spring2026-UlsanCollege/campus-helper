import mongoose, { Schema, Document } from "mongoose";

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AnnouncementSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model<IAnnouncement>("Announcement", AnnouncementSchema);
