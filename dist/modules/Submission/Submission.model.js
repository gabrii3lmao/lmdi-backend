import mongoose, { Schema, model, Document } from "mongoose";
const submissionSchema = new mongoose.Schema({
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
}, { timestamps: true });
const Submission = mongoose.model("Submission", submissionSchema);
export default Submission;
//# sourceMappingURL=Submission.model.js.map