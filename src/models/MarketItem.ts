import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMarketItem extends Document {
  title: string;
  description: string;
  price: number;
  imageUrls: string[];
  sellerId: mongoose.Types.ObjectId;
  status: 'available' | 'sold';
  createdAt: Date;
  updatedAt: Date;
}

const marketItemSchema = new Schema<IMarketItem>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  imageUrls: [{ type: String }],
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'sold'], default: 'available' },
}, { timestamps: true });

const MarketItem: Model<IMarketItem> = mongoose.models?.MarketItem || mongoose.model<IMarketItem>('MarketItem', marketItemSchema);

export default MarketItem;
