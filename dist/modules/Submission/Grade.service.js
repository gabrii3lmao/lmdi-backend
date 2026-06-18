export const gradeExam = (answerKey, studentAnswers, totalQuestions) => {
    let totalCorrect = 0;
    const details = answerKey.map((correctAnswer, index) => {
        const questionNum = (index + 1).toString();
        const marked = studentAnswers[questionNum] ?? null;
        const isCorrect = marked === correctAnswer;
        if (isCorrect)
            totalCorrect++;
        return {
            question: index + 1,
            marked,
            correct: correctAnswer,
            status: isCorrect ? "correct" : "incorrect",
        };
    });
    const safeTotalQuestions = totalQuestions || answerKey.length || 1;
    const rawScore = (totalCorrect / safeTotalQuestions) * 10;
    const finalScore = Number.isNaN(rawScore) || !Number.isFinite(rawScore)
        ? 0
        : Number(rawScore.toFixed(2));
    return {
        totalCorrect,
        score: finalScore,
        details,
    };
};
//# sourceMappingURL=Grade.service.js.map