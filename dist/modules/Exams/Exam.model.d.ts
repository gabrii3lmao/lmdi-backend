import mongoose, { Document, Schema } from "mongoose";
export interface IExam extends Document {
    title: string;
    classId: Schema.Types.ObjectId | string;
    questionsCount: number;
    choicesCount: number;
    answerKey: string[];
    teacherId: Schema.Types.ObjectId | string;
}
declare const Exam: mongoose.Model<IExam, {}, {}, {}, mongoose.Document<unknown, {}, IExam, {}, mongoose.DefaultSchemaOptions> & IExam & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IExam>;
export default Exam;
//# sourceMappingURL=Exam.model.d.ts.map