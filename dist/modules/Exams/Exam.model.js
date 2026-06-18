import mongoose, { Document, Schema, model } from "mongoose";
const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    questionsCount: Number,
    choicesCount: Number,
    answerKey: [String],
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });
const Exam = mongoose.model("Exam", examSchema);
export default Exam;
//# sourceMappingURL=Exam.model.js.map