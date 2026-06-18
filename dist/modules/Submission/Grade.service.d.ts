interface IGraderResult {
    totalCorrect: number;
    score: number;
    details: any[];
}
export declare const gradeExam: (answerKey: string[], studentAnswers: Record<string, string | null>, totalQuestions: number) => IGraderResult;
export {};
//# sourceMappingURL=Grade.service.d.ts.map