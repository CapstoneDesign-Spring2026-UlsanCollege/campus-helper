import mongoose, { Schema, Document } from "mongoose";

export interface INote extends Document {
  title: string;
  fileUrl: string;
  fileName?: string;
  fileType?: string;
  thumbnailUrl?: string;
  department: string;
  uploadedBy: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileType: { type: String },
  thumbnailUrl: { type: String },
  department: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model<INote>("Note", NoteSchema);
