import mongoose, { Document, Schema } from "mongoose";
export interface IClass extends Document {
    name: string;
    teacherId: string | Schema.Types.ObjectId;
}
declare const Class: mongoose.Model<IClass, {}, {}, {}, mongoose.Document<unknown, {}, IClass, {}, mongoose.DefaultSchemaOptions> & IClass & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClass>;
export default Class;
//# sourceMappingURL=classModel.d.ts.map