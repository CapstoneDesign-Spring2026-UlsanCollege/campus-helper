import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISemesterTimetableTemplate extends Document {
  semesterId: mongoose.Types.ObjectId;
  department: string;
  day: string;
  subject: string;
  time: string;
  room?: string;
}

const SemesterTimetableTemplateSchema = new Schema<ISemesterTimetableTemplate>({
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  department: { type: String, required: true, index: true },
  day: { type: String, required: true, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  subject: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, default: '' },
}, { timestamps: true });

SemesterTimetableTemplateSchema.index({ semesterId: 1, department: 1, day: 1, time: 1 });

const SemesterTimetableTemplate: Model<ISemesterTimetableTemplate> =
  mongoose.models?.SemesterTimetableTemplate || mongoose.model<ISemesterTimetableTemplate>('SemesterTimetableTemplate', SemesterTimetableTemplateSchema);

export default SemesterTimetableTemplate;
