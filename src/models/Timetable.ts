import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  day: string;
  subject: string;
  time: string;
}

const TimetableSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  subject: { type: String, required: true },
  time: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);
