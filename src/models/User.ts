import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'admin';
  department: string;
  studentId: string;
  isVerified: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  refreshToken?: string;
  gender: 'male' | 'female';
  profilePicture?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  department: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  isVerified: { type: Boolean, default: false },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshToken: { type: String },
  gender: { type: String, enum: ['male', 'female'], required: true },
  profilePicture: { type: String, default: '' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
