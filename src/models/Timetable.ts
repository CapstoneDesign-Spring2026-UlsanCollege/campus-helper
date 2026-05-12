import mongoose, { Schema, Document } from "mongoose";

export interface ITimetable extends Document {
  userId: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  day: string;
  subject: string;
  time: string;
  room?: string;
}

const TimetableSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, default: '' },
}, { timestamps: true });

TimetableSchema.index({ userId: 1, semesterId: 1, day: 1, time: 1 });

export default mongoose.models.Timetable || mongoose.model<ITimetable>("Timetable", TimetableSchema);
