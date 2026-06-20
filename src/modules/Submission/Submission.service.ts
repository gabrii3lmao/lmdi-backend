import type { ExamRepository } from "../Exams/Exam.repository.js";
import type { SubmissionRepository } from "./Submission.repository.js";
import { submissionQueue } from "./Submission.queue.js";
import { HttpException } from "../../config/errorHandler.js";
import type { ISubmission } from "./Submission.model.js";
import type { PaginatedResponse } from "../common/dto/pagination.dto.js";
import ExcelJS from "exceljs";

export class SubmissionService {
  constructor(
    private readonly _examRepo: ExamRepository,
    private readonly _submissionRepo: SubmissionRepository,
  ) {}

  async processSubmissions(
    examId: string,
    teacherId: string,
    submissions: { studentName: string; imageUrl: string }[],
  ) {
    const exam = await this._examRepo.findByIdAndTeacher(examId, teacherId);

    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    const processedFilePaths = submissions.map((s) =>
      s.imageUrl.replace("/upload/", "/upload/e_grayscale,e_contrast:100/"),
    );

    const pendingSubmissions = await Promise.all(
      submissions.map((sub, index) =>
        this._submissionRepo.create({
          examId,
          classId: exam.classId,
          userId: teacherId,
          studentName: sub.studentName,
          imageUrl: processedFilePaths[index],
          status: "pending",
        }),
      ),
    );

    const jobs = pendingSubmissions.map((submission, index) => ({
      name: `submission-${submission._id}`,
      data: {
        submissionId: submission._id.toString(),
        examId,
        imageUrl: submissions[index].imageUrl,
        answerKey: exam.answerKey,
        questionsCount: exam.questionsCount,
      },
      opts: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    }));

    await submissionQueue.addBulk(jobs);

    return pendingSubmissions.map((sub) => JSON.parse(JSON.stringify(sub)));
  }

  async getSubmissionsByClass(classId: string) {
    return await this._submissionRepo.findByClass(classId);
  }

  async getSubmissionsByClassPaginated(
    classId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ISubmission>> {
    const { data, totalItems } =
      await this._submissionRepo.findByClassPaginated(classId, page, limit);
    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  async getSubmissionsByExam(examId: string) {
    return await this._submissionRepo.findByExamId(examId);
  }

  async getSubmissionsByExamPaginated(
    examId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ISubmission>> {
    const { data, totalItems } =
      await this._submissionRepo.findByExamIdPaginated(examId, page, limit);
    return {
      data,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
  }

  async getSubmissionAnswers(submissionId: string) {
    return await this._submissionRepo.getSubmissionsAnswersById(submissionId);
  }

  async updateSubmission(submissionId: string, updateData: Partial<ISubmission>) {
    const submission = await this._submissionRepo.findById(submissionId);

    if (!submission) {
      throw new HttpException("Submissão não encontrada", 404);
    }

    return await this._submissionRepo.update(submissionId, updateData);
  }

  async generateExcelReport(examId: string, teacherId: string): Promise<ExcelJS.Buffer> {
    const exam = await this._examRepo.findByIdAndTeacher(examId, teacherId);
    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    const submissions = await this._submissionRepo.findByExamIdWithDetails(examId);
    const graded = submissions.filter((s) => s.status === "success" && s.details?.length);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "LetMeDoIt";
    const sheet = workbook.addWorksheet(`Relatório - ${exam.title}`);

    const headerStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: "FFFFFFFF" }, size: 11 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF059669" } },
      alignment: { horizontal: "center", vertical: "middle", wrapText: true },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const dataStyle: Partial<ExcelJS.Style> = {
      alignment: { horizontal: "center", vertical: "middle" },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    const correctStyle: Partial<ExcelJS.Style> = {
      ...dataStyle,
      font: { color: { argb: "FF059669" }, bold: true },
    };

    const incorrectStyle: Partial<ExcelJS.Style> = {
      ...dataStyle,
      font: { color: { argb: "FFDC2626" }, bold: true },
    };

    const invalidStyle: Partial<ExcelJS.Style> = {
      ...dataStyle,
      font: { color: { argb: "FF9CA3AF" }, italic: true },
    };

    const headerRow = ["Nome do Aluno", "Nota (0-10)", "Acertos"];
    for (let i = 1; i <= exam.questionsCount; i++) {
      headerRow.push(`Q${i}`);
    }

    const header = sheet.addRow(headerRow);
    header.eachCell((cell) => {
      cell.style = headerStyle;
    });
    sheet.getRow(1).height = 30;

    graded.forEach((sub) => {
      const questionCols = (sub.details || []).map((d) => {
        const marked = d.marked || "—";
        const correct = d.correct;
        if (d.status === "correct") return `${marked} ✓`;
        if (d.status === "incorrect") return `${marked} ✗ (${correct})`;
        return `${marked} —`;
      });

      const row = sheet.addRow([
        sub.studentName,
        sub.score ?? "-",
        sub.totalCorrect ?? "-",
        ...questionCols,
      ]);

      row.eachCell((cell, colIndex) => {
        if (colIndex === 1) {
          cell.style = { ...dataStyle, alignment: { horizontal: "left", vertical: "middle" } };
        } else {
          cell.style = dataStyle;
        }
      });

      (sub.details || []).forEach((d, idx) => {
        const cell = row.getCell(4 + idx);
        if (d.status === "correct") cell.style = correctStyle;
        else if (d.status === "incorrect") cell.style = incorrectStyle;
        else if (d.status === "invalid") cell.style = invalidStyle;
      });
    });

    sheet.addRow([]);

    const sectionStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, size: 12, color: { argb: "FF059669" } },
    };

    const statsHeader = sheet.addRow(["Estatísticas"]);
    statsHeader.eachCell((cell) => {
      cell.style = sectionStyle;
    });

    if (graded.length > 0) {
      const scores = graded.map((s) => s.score ?? 0);
      const total = scores.reduce((a, b) => a + b, 0);
      const avg = total / scores.length;
      const sorted = [...scores].sort((a, b) => a - b);
      const median =
        sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      const highest = Math.max(...scores);
      const lowest = Math.min(...scores);

      const variance = scores.reduce((acc, s) => acc + (s - avg) ** 2, 0) / scores.length;
      const stdDev = Math.sqrt(variance);

      const statsLabelStyle: Partial<ExcelJS.Style> = {
        font: { bold: true },
        alignment: { horizontal: "right" },
      };
      const statsValueStyle: Partial<ExcelJS.Style> = {
        alignment: { horizontal: "center" },
      };

      sheet.addRow(["Média", avg.toFixed(1)]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });
      sheet.addRow(["Mediana", median.toFixed(1)]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });
      sheet.addRow(["Maior nota", highest.toFixed(1)]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });
      sheet.addRow(["Menor nota", lowest.toFixed(1)]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });
      sheet.addRow(["Desvio padrão", stdDev.toFixed(2)]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });
      sheet.addRow(["Total de alunos", graded.length]).eachCell((cell, col) => {
        cell.style = col === 1 ? statsLabelStyle : statsValueStyle;
      });

      sheet.addRow([]);

      const questionHeader = sheet.addRow(["Questão", "% Acerto"]);
      questionHeader.eachCell((cell) => {
        cell.style = headerStyle;
      });

      for (let q = 1; q <= exam.questionsCount; q++) {
        const correctCount = graded.filter(
          (s) => s.details?.find((d) => d.question === q)?.status === "correct",
        ).length;
        const pct = Math.round((correctCount / graded.length) * 100);
        const row = sheet.addRow([`Q${q}`, `${pct}%`]);
        row.eachCell((cell) => {
          cell.style = dataStyle;
        });
      }
    }

    sheet.columns.forEach((col) => {
      if (col.eachCell) {
        let maxLen = 12;
        col.eachCell((cell) => {
          const val = cell.value ? String(cell.value).length : 0;
          if (val > maxLen) maxLen = val;
        });
        col.width = Math.min(maxLen + 3, 40);
      }
    });

    return await workbook.xlsx.writeBuffer();
  }

  async getExamAnalytics(examId: string, teacherId: string) {
    const exam = await this._examRepo.findByIdAndTeacher(examId, teacherId);
    if (!exam) {
      throw new HttpException("Gabarito não encontrado", 404);
    }

    const submissions = await this._submissionRepo.findByExamIdWithDetails(examId);
    const graded = submissions.filter((s) => s.status === "success" && s.details?.length);

    if (graded.length === 0) {
      return {
        stats: { average: 0, highest: 0, lowest: 0, total: 0 },
        distribution: { "0-2": 0, "2-4": 0, "4-6": 0, "6-8": 0, "8-10": 0 },
        questionAccuracy: [],
        studentScores: [],
      };
    }

    const scores = graded.map((s) => s.score ?? 0);
    const total = scores.reduce((a, b) => a + b, 0);
    const avg = total / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    const distribution: Record<string, number> = { "0-2": 0, "2-4": 0, "4-6": 0, "6-8": 0, "8-10": 0 };
    scores.forEach((s) => {
      if (s < 2) distribution["0-2"]++;
      else if (s < 4) distribution["2-4"]++;
      else if (s < 6) distribution["4-6"]++;
      else if (s < 8) distribution["6-8"]++;
      else distribution["8-10"]++;
    });

    const questionAccuracy = [];
    for (let q = 1; q <= exam.questionsCount; q++) {
      const correctCount = graded.filter(
        (s) => s.details?.find((d) => d.question === q)?.status === "correct",
      ).length;
      questionAccuracy.push({
        question: q,
        correct: correctCount,
        total: graded.length,
        percentage: Math.round((correctCount / graded.length) * 100),
      });
    }

    const studentScores = graded.map((s) => ({
      name: s.studentName,
      score: s.score ?? 0,
    }));

    return {
      stats: { average: Number(avg.toFixed(1)), highest, lowest, total: graded.length },
      distribution,
      questionAccuracy,
      studentScores,
    };
  }
}
