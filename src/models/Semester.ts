import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISemester extends Document {
  name: string;
  year: number;
  term: 'spring' | 'summer' | 'fall' | 'winter';
  registrationStart?: Date;
  registrationEnd?: Date;
  classStart?: Date;
  classEnd?: Date;
  examStart?: Date;
  examEnd?: Date;
  status: 'upcoming' | 'active' | 'archived';
}

const SemesterSchema = new Schema<ISemester>({
  name: { type: String, required: true },
  year: { type: Number, required: true, index: true },
  term: { type: String, enum: ['spring', 'summer', 'fall', 'winter'], required: true },
  registrationStart: { type: Date },
  registrationEnd: { type: Date },
  classStart: { type: Date },
  classEnd: { type: Date },
  examStart: { type: Date },
  examEnd: { type: Date },
  status: { type: String, enum: ['upcoming', 'active', 'archived'], default: 'upcoming', index: true },
}, { timestamps: true });

SemesterSchema.index({ year: 1, term: 1 }, { unique: true });

const Semester: Model<ISemester> = mongoose.models?.Semester || mongoose.model<ISemester>('Semester', SemesterSchema);

export default Semester;
