import mongoose, { Schema, Document } from "mongoose";
import type { UIMessage } from "ai";

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: UIMessage[];
}

const ChatHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: { type: [Schema.Types.Mixed], default: [] },
}, { timestamps: true });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
