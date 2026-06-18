import mongoose, { Schema, Document } from "mongoose";
interface ISubmissionDetail {
    question: number;
    marked: string | null;
    correct: string;
    status: "correct" | "incorrect" | "invalid";
}
export interface ISubmission extends Document {
    examId: Schema.Types.ObjectId | string;
    studentName: string;
    classId: Schema.Types.ObjectId | string;
    imageUrl: string;
    score: number;
    totalCorrect: number;
    status: "pending" | "success" | "error";
    details: ISubmissionDetail[];
}
declare const Submission: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}, mongoose.DefaultSchemaOptions> & ISubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
export default Submission;
//# sourceMappingURL=Submission.model.d.ts.map