import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface IChatHistory extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const ChatHistorySchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true }
  }],
}, { timestamps: true });

export default mongoose.models.ChatHistory || mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
