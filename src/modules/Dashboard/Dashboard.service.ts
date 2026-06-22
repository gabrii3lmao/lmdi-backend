import { ClassRepository } from "../Classes/Class.repository.js";
import { ExamRepository } from "../Exams/Exam.repository.js";
import { SubmissionRepository } from "../Submission/Submission.repository.js";

export class DashboardService {
  constructor(
    private readonly _classRepo: ClassRepository,
    private readonly _examRepo: ExamRepository,
    private readonly _submissionRepo: SubmissionRepository,
  ) {}

  async getDashboard(teacherId: string) {
    const [
      totalClasses,
      totalExams,
      totalSubmissions,
      submissionsByStatus,
      averageScore,
      recentClasses,
      recentActivity,
    ] = await Promise.all([
      this._classRepo.countByTeacher(teacherId),
      this._examRepo.countByTeacher(teacherId),
      this._submissionRepo.countByTeacher(teacherId),
      this._submissionRepo.countByStatus(teacherId),
      this._submissionRepo.getAverageScore(teacherId),
      this.getRecentClassesWithCounts(teacherId),
      this._submissionRepo.findRecentByTeacher(teacherId, 5),
    ]);

    return {
      stats: {
        totalClasses,
        totalExams,
        totalSubmissions,
        submissionsByStatus,
        averageScore: averageScore ? Number(averageScore.toFixed(1)) : 0,
      },
      recentClasses,
      recentActivity: recentActivity.map((s: any) => ({
        studentName: s.studentName,
        examTitle: s.examId?.title ?? "Desconhecido",
        className: s.classId?.name ?? "Desconhecida",
        score: s.score,
        status: s.status,
        createdAt: s.createdAt,
      })),
    };
  }

  private async getRecentClassesWithCounts(teacherId: string) {
    const classes = await this._classRepo.findRecentByTeacher(teacherId, 5);
    const result = await Promise.all(
      classes.map(async (c) => ({
        _id: c._id,
        name: c.name,
        examCount: await this._examRepo.countByClassId(c._id.toString()),
        submissionCount: await this._submissionRepo.countByClassId(
          c._id.toString(),
        ),
      })),
    );
    return result;
  }
}
