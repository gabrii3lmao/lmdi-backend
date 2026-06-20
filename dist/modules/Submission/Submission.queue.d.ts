import "dotenv/config";
import { Queue } from "bullmq";
export interface ProcessSubmissionJob {
    submissionId: string;
    examId: string;
    imageUrl: string;
    answerKey: string[];
    questionsCount: number;
}
export declare const submissionQueue: Queue<any, any, string, any, any, string>;
//# sourceMappingURL=Submission.queue.d.ts.map