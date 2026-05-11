import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAcademicEvent extends Document {
  semesterId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  category: 'registration' | 'classes' | 'exams' | 'break' | 'general';
  startDate: Date;
  endDate?: Date;
}

const AcademicEventSchema = new Schema<IAcademicEvent>({
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['registration', 'classes', 'exams', 'break', 'general'], default: 'general' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
}, { timestamps: true });

AcademicEventSchema.index({ semesterId: 1, startDate: 1 });

const AcademicEvent: Model<IAcademicEvent> = mongoose.models?.AcademicEvent || mongoose.model<IAcademicEvent>('AcademicEvent', AcademicEventSchema);

export default AcademicEvent;
