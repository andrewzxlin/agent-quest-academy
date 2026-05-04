import { course, flattenInterviewQuestions, flattenLessons, flattenQuestions, jobReadinessSkills } from "./course.js";

const STORAGE_KEY = "agentQuestProgress:v1";

export function createInitialProgress(now = Date.now()) {
  return {
    currentLessonIndex: 0,
    xp: 0,
    streak: 0,
    answered: {},
    reviewQueue: [],
    completedLessons: [],
    bossResults: [],
    dailyActivity: {},
    lastActiveAt: now
  };
}

export function loadProgress(storage = globalThis.localStorage) {
  if (!storage) return createInitialProgress();
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return createInitialProgress();
  try {
    return { ...createInitialProgress(), ...JSON.parse(raw) };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress, storage = globalThis.localStorage) {
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress(storage = globalThis.localStorage) {
  if (storage) storage.removeItem(STORAGE_KEY);
}

export function gradeQuestion(question, response) {
  if (question.type === "single") {
    return {
      correct: Number(response) === question.answer,
      expected: question.answer
    };
  }
  if (question.type === "multi") {
    const expected = [...question.answer].sort((a, b) => a - b);
    const actual = [...(response ?? [])].map(Number).sort((a, b) => a - b);
    return {
      correct: JSON.stringify(expected) === JSON.stringify(actual),
      expected
    };
  }
  if (question.type === "short") {
    const text = `${response ?? ""}`.toLowerCase();
    const matches = question.keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
    return {
      correct: matches.length >= question.minMatches,
      expected: question.keywords,
      matches
    };
  }
  throw new Error(`Unknown question type: ${question.type}`);
}

export function answerQuestion(progress, question, response, now = Date.now()) {
  const result = gradeQuestion(question, response);
  const key = questionKey(question);
  const previous = progress.answered[key] ?? {
    correctCount: 0,
    wrongCount: 0,
    nextReviewAt: 0,
    lastResult: null
  };
  const correctCount = result.correct ? previous.correctCount + 1 : previous.correctCount;
  const wrongCount = result.correct ? previous.wrongCount : previous.wrongCount + 1;
  const nextReviewAt = nextReviewTime({ correct: result.correct, correctCount, wrongCount, now });

  progress.answered[key] = {
    correctCount,
    wrongCount,
    nextReviewAt,
    lastResult: result.correct ? "correct" : "wrong",
    lastAnsweredAt: now
  };
  progress.xp += result.correct ? 10 : 2;
  progress.lastActiveAt = now;
  recordDailyActivity(progress, now, {
    answers: 1,
    correctAnswers: result.correct ? 1 : 0
  });

  if (!result.correct) {
    progress.reviewQueue = upsertReview(progress.reviewQueue, {
      questionKey: key,
      lessonId: question.lessonId,
      dueAt: now,
      priority: 100 + wrongCount,
      reason: "wrong_answer"
    });
  } else {
    progress.reviewQueue = upsertReview(progress.reviewQueue, {
      questionKey: key,
      lessonId: question.lessonId,
      dueAt: nextReviewAt,
      priority: Math.max(10, 80 - correctCount * 10),
      reason: "spaced_review"
    });
  }

  return { progress, result };
}

export function completeLesson(progress, lessonId, now = Date.now()) {
  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
    progress.streak += 1;
  }
  recordDailyActivity(progress, now, { lessonsCompleted: 1 });
  const lessons = flattenLessons();
  progress.currentLessonIndex = Math.min(progress.currentLessonIndex + 1, lessons.length - 1);
  return progress;
}

export function completeBossQuiz(progress, chapterId, score, total, now = Date.now()) {
  const passed = total > 0 && score / total >= 0.8;
  const previous = progress.bossResults ?? [];
  progress.bossResults = [
    ...previous.filter((item) => item.chapterId !== chapterId),
    { chapterId, score, total, passed, completedAt: now }
  ];
  progress.xp += passed ? 50 : 15;
  progress.lastActiveAt = now;
  recordDailyActivity(progress, now, {
    bossAttempts: 1,
    bossPasses: passed ? 1 : 0
  });
  return progress;
}

export function getDueReviewQuestions(progress, now = Date.now(), limit = 3) {
  const questionsByKey = new Map(reviewableQuestions().map((question) => [questionKey(question), question]));
  return [...progress.reviewQueue]
    .filter((item) => item.dueAt <= now)
    .sort((a, b) => b.priority - a.priority || a.dueAt - b.dueAt)
    .slice(0, limit)
    .map((item) => questionsByKey.get(item.questionKey))
    .filter(Boolean);
}

export function buildSessionQuestions(progress, lesson, now = Date.now()) {
  const due = getDueReviewQuestions(progress, now, 2);
  const dueKeys = new Set(due.map(questionKey));
  const fresh = lesson.questions
    .map((question) => withLessonMetadata(question, lesson))
    .filter((question) => !dueKeys.has(questionKey(question)));
  return [...due, ...fresh].slice(0, 7);
}

export function buildReviewSessionQuestions(progress, now = Date.now(), limit = 7) {
  return getDueReviewQuestions(progress, now, limit);
}

export function reviewStats(progress, now = Date.now()) {
  const dueCount = progress.reviewQueue.filter((item) => item.dueAt <= now).length;
  const wrongCount = Object.values(progress.answered).filter((item) => item.lastResult === "wrong").length;
  return {
    dueCount,
    scheduledCount: progress.reviewQueue.length,
    wrongCount
  };
}

export function mistakeNotebook(progress, now = Date.now(), limit = 6) {
  const questionsByKey = new Map(reviewableQuestions().map((question) => [questionKey(question), question]));
  const reviewByKey = new Map(progress.reviewQueue.map((item) => [item.questionKey, item]));
  return Object.entries(progress.answered)
    .filter(([, state]) => state.wrongCount > 0)
    .sort(([, a], [, b]) => b.lastAnsweredAt - a.lastAnsweredAt)
    .slice(0, limit)
    .map(([key, state]) => {
      const question = questionsByKey.get(key);
      const review = reviewByKey.get(key);
      return {
        key,
        question,
        lessonTitle: question?.lessonTitle ?? "Unknown lesson",
        chapterTitle: question?.chapterTitle ?? "Unknown chapter",
        wrongCount: state.wrongCount,
        correctCount: state.correctCount,
        lastResult: state.lastResult,
        dueAt: review?.dueAt ?? state.nextReviewAt,
        due: (review?.dueAt ?? state.nextReviewAt) <= now
      };
    })
    .filter((item) => item.question);
}

export function chapterMap(progress) {
  const lessons = flattenLessons();
  return course.chapters.map((chapter) => {
    const chapterLessons = lessons.filter((lesson) => lesson.chapterId === chapter.id);
    const completedLessons = chapterLessons.filter((lesson) => progress.completedLessons.includes(lesson.id)).length;
    const bossResult = (progress.bossResults ?? []).find((item) => item.chapterId === chapter.id);
    const lessonPercent = chapterLessons.length === 0 ? 0 : Math.round((completedLessons / chapterLessons.length) * 100);
    const status = bossResult?.passed ? "cleared" : completedLessons > 0 ? "in_progress" : "new";
    return {
      chapterId: chapter.id,
      title: chapter.title,
      theme: chapter.theme,
      completedLessons,
      totalLessons: chapterLessons.length,
      lessonPercent,
      bossPassed: bossResult?.passed ?? false,
      bossScore: bossResult ? `${bossResult.score}/${bossResult.total}` : null,
      status
    };
  });
}

export function jobReadinessMap(progress) {
  const chaptersById = new Map(chapterMap(progress).map((chapter) => [chapter.chapterId, chapter]));
  return jobReadinessSkills.map((skill) => {
    const chapter = chaptersById.get(skill.chapterId);
    const lessonPercent = chapter?.lessonPercent ?? 0;
    const bossPassed = chapter?.bossPassed ?? false;
    const status = bossPassed ? "job_ready" : lessonPercent > 0 ? "learning" : "new";
    const evidence = bossPassed
      ? "Boss cleared"
      : chapter?.bossScore
        ? `Boss ${chapter.bossScore}`
        : lessonPercent > 0
          ? `${lessonPercent}% lessons complete`
          : "Not started";

    return {
      ...skill,
      chapterTitle: chapter?.title ?? "Unknown chapter",
      lessonPercent,
      bossPassed,
      bossScore: chapter?.bossScore ?? null,
      status,
      evidence
    };
  });
}

export function dailyMissions(progress, now = Date.now()) {
  const activity = getDailyActivity(progress, now);
  return [
    {
      id: "answer-five",
      title: "答 5 題",
      current: Math.min(activity.answers, 5),
      target: 5,
      done: activity.answers >= 5
    },
    {
      id: "finish-lesson",
      title: "完成 1 課",
      current: Math.min(activity.lessonsCompleted, 1),
      target: 1,
      done: activity.lessonsCompleted >= 1
    },
    {
      id: "beat-boss",
      title: "通關 1 個 Boss Quiz",
      current: Math.min(activity.bossPasses, 1),
      target: 1,
      done: activity.bossPasses >= 1
    }
  ];
}

export function achievements(progress) {
  const passedBosses = (progress.bossResults ?? []).filter((item) => item.passed).length;
  const wrongAnswers = Object.values(progress.answered).filter((item) => item.wrongCount > 0).length;
  return [
    {
      id: "first-lesson",
      title: "踏出第一步",
      description: "完成任一 micro-lesson",
      unlocked: progress.completedLessons.length > 0
    },
    {
      id: "mistake-hunter",
      title: "錯題獵人",
      description: "至少留下 1 題可複習的錯題",
      unlocked: wrongAnswers > 0
    },
    {
      id: "boss-clear",
      title: "章節通關",
      description: "通過任一章節 Boss Quiz",
      unlocked: passedBosses > 0
    },
    {
      id: "hundred-xp",
      title: "100 XP",
      description: "累積 100 XP",
      unlocked: progress.xp >= 100
    }
  ];
}

export function masteryForLesson(progress, lesson) {
  const total = lesson.questions.length;
  const correct = lesson.questions.filter((question) => {
    const state = progress.answered[questionKey({ ...question, lessonId: lesson.id })];
    return state?.correctCount > 0;
  }).length;
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export function questionKey(question) {
  return `${question.lessonId}:${question.id}`;
}

function upsertReview(queue, item) {
  const without = queue.filter((existing) => existing.questionKey !== item.questionKey);
  return [...without, item];
}

function withLessonMetadata(question, lesson) {
  return {
    ...question,
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    chapterId: lesson.chapterId,
    chapterTitle: lesson.chapterTitle
  };
}

function recordDailyActivity(progress, now, patch) {
  const key = dailyKey(now);
  const activity = getDailyActivity(progress, now);
  progress.dailyActivity = {
    ...(progress.dailyActivity ?? {}),
    [key]: {
      answers: activity.answers + (patch.answers ?? 0),
      correctAnswers: activity.correctAnswers + (patch.correctAnswers ?? 0),
      lessonsCompleted: activity.lessonsCompleted + (patch.lessonsCompleted ?? 0),
      bossAttempts: activity.bossAttempts + (patch.bossAttempts ?? 0),
      bossPasses: activity.bossPasses + (patch.bossPasses ?? 0)
    }
  };
}

function reviewableQuestions() {
  return [...flattenQuestions(), ...flattenInterviewQuestions()];
}

function getDailyActivity(progress, now) {
  return {
    answers: 0,
    correctAnswers: 0,
    lessonsCompleted: 0,
    bossAttempts: 0,
    bossPasses: 0,
    ...((progress.dailyActivity ?? {})[dailyKey(now)] ?? {})
  };
}

function dailyKey(now) {
  return new Date(now).toISOString().slice(0, 10);
}

function nextReviewTime({ correct, correctCount, wrongCount, now }) {
  if (!correct) return now;
  const day = 24 * 60 * 60 * 1000;
  if (correctCount <= 1 || wrongCount > 0) return now + day;
  if (correctCount === 2) return now + 3 * day;
  if (correctCount === 3) return now + 7 * day;
  return now + 14 * day;
}
