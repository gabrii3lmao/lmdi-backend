import mongoose, { Document, Schema } from "mongoose";

export interface IClass extends Document {
  name: string;
  teacherId: string | Schema.Types.ObjectId;
}

const classSchema = new mongoose.Schema<IClass>(
  {
    name: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const Class = mongoose.model<IClass>("Class", classSchema);

export default Class;