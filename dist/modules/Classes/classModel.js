import mongoose, { Document, Schema } from "mongoose";
const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
const Class = mongoose.model("Class", classSchema);
export default Class;
//# sourceMappingURL=classModel.js.map