import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBusSchedule extends Document {
  semesterId: mongoose.Types.ObjectId;
  campus: 'east' | 'west' | 'intercampus';
  routeName: string;
  weekday: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  departureTime: string;
  arrivalNote?: string;
  active: boolean;
}

const BusScheduleSchema = new Schema<IBusSchedule>({
  semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
  campus: { type: String, enum: ['east', 'west', 'intercampus'], required: true },
  routeName: { type: String, required: true },
  weekday: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], required: true },
  departureTime: { type: String, required: true },
  arrivalNote: { type: String, default: '' },
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

BusScheduleSchema.index({ semesterId: 1, campus: 1, weekday: 1, departureTime: 1 });

const BusSchedule: Model<IBusSchedule> = mongoose.models?.BusSchedule || mongoose.model<IBusSchedule>('BusSchedule', BusScheduleSchema);

export default BusSchedule;
