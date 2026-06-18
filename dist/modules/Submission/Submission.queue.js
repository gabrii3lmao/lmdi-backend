import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { processarGabaritoUnico } from "./Template.service.js";
import { gradeExam } from "./Grade.service.js";
import { SubmissionRepository } from "./Submission.repository.js";
const redisConnection = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379", { maxRetriesPerRequest: null });
export const submissionQueue = new Queue("process-submissions", {
    connection: redisConnection,
});
const submissionRepo = new SubmissionRepository();
const worker = new Worker("process-submissions", async (job) => {
    const { submissionId, imageUrl, answerKey, questionsCount } = job.data;
    try {
        const studentMarks = await processarGabaritoUnico(imageUrl);
        const gradeResult = gradeExam(answerKey, studentMarks, questionsCount);
        await submissionRepo.updateStatusAndScore(submissionId, {
            status: "success",
            totalCorrect: gradeResult.totalCorrect,
            score: gradeResult.score,
            details: gradeResult.details,
        });
    }
    catch (error) {
        console.error(`Erro ao processar job ${job.id}:`, error);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 2,
});
worker.on("failed", async (job, err) => {
    if (job) {
        if (job.attemptsMade === job.opts.attempts) {
            console.log(`Job ${job.id} esgotou as tentativas e falhou.`);
            await submissionRepo.updateStatusAndScore(job.data.submissionId, {
                status: "error",
            });
        }
        else {
            console.log(`Job ${job.id} falhou (tentativa ${job.attemptsMade}). Tentando novamente...`);
        }
    }
});
//# sourceMappingURL=Submission.queue.js.map