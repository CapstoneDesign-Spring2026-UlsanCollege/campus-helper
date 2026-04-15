import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFriendship extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted';
  createdAt: Date;
}

const friendshipSchema = new Schema<IFriendship>({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
}, { timestamps: true });

// Ensure unique bidirectional ties
friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const Friendship: Model<IFriendship> = mongoose.models?.Friendship || mongoose.model<IFriendship>('Friendship', friendshipSchema);

export default Friendship;
