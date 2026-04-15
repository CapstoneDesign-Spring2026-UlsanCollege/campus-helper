import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILostItem extends Document {
  title: string;
  description: string;
  locationFound: string;
  imageUrls: string[];
  reportedBy: mongoose.Types.ObjectId;
  type: 'lost' | 'found';
  status: 'active' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const lostItemSchema = new Schema<ILostItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  locationFound: { type: String, default: 'Unknown location' },
  imageUrls: [{ type: String }],
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['lost', 'found'], required: true },
  status: { type: String, enum: ['active', 'resolved'], default: 'active' },
}, { timestamps: true });

const LostItem: Model<ILostItem> = mongoose.models?.LostItem || mongoose.model<ILostItem>('LostItem', lostItemSchema);

export default LostItem;
