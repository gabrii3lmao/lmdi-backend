import mongoose, { Schema, model, Document } from "mongoose";

interface ISubmissionDetail {
  question: number;
  marked: string | null;
  correct: string;
  status: "correct" | "incorrect" | "invalid";
}

export interface ISubmission extends Document {
  examId: Schema.Types.ObjectId | string;
  userId: Schema.Types.ObjectId | string;
  studentName: string;
  classId: Schema.Types.ObjectId | string;
  imageUrl: string;
  score: number;
  totalCorrect: number;
  status: "pending" | "success" | "error";
  details: ISubmissionDetail[];
}

const submissionSchema = new mongoose.Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    examId: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    studentName: { type: String, required: true },
    imageUrl: { type: String },

    score: { type: Number },
    totalCorrect: { type: Number },
    status: {
      type: String,
      enum: ["pending", "success", "error"],
      default: "pending",
    },

    details: [
      {
        question: { type: Number },
        marked: { type: String },
        correct: { type: String },
        status: {
          type: String,
          enum: ["correct", "incorrect", "invalid"],
        },
      },
    ],
  },
  { timestamps: true },
);

const Submission = mongoose.model<ISubmission>("Submission", submissionSchema);

export default Submission;
