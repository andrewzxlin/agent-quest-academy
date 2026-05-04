import {
  beginnerGlossary,
  course,
  flattenInterviewQuestions,
  flattenLessons,
  flattenQuestions,
  jobReadinessSkills,
  jobScenarioCards
} from "./course.js";

const STORAGE_KEY = "agentQuestProgress:v1";

const LEARNER_PROFILES = [
  {
    id: "beginner",
    title: "完全新手",
    description: "我想從 0 開始，不想先碰專案或複雜術語。",
    coachLine: "今天只要完成一個 micro-lesson，先把 agent 的直覺建立起來。"
  },
  {
    id: "ai-user",
    title: "會用 AI，但不懂 Agent",
    description: "我用過 ChatGPT 或工具，但還不懂 workflow、tool、RAG。",
    coachLine: "把你熟悉的 AI 使用經驗，拆成 workflow、tool、state、guardrail。"
  },
  {
    id: "interview",
    title: "準備面試",
    description: "我想把 Agentic Workflow 轉成能在面試中說清楚的能力。",
    coachLine: "優先練 Boss、面試情境題和 60 秒 pitch，讓概念變成可表達的答案。"
  }
];

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
    learnerProfile: null,
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

export function onboardingState(progress) {
  const selected = LEARNER_PROFILES.find((profile) => profile.id === progress.learnerProfile) ?? null;
  return {
    completed: Boolean(selected),
    selected,
    options: LEARNER_PROFILES,
    headline: selected ? selected.title : "先選你的起點",
    guidance: selected?.coachLine ?? "不用先做專案，先用低阻力題目建立 Agentic Workflow 的直覺。"
  };
}

export function beginnerGlossaryCards(chapterId) {
  const chapter = course.chapters.find((item) => item.id === chapterId);
  const glossary = beginnerGlossary.find((item) => item.chapterId === chapterId);
  return {
    chapterId,
    chapterTitle: chapter?.title ?? chapterId,
    terms: glossary?.terms ?? []
  };
}

export function jobScenarioCard(chapterId) {
  const chapter = course.chapters.find((item) => item.id === chapterId);
  const scenario = jobScenarioCards.find((item) => item.chapterId === chapterId);
  return {
    chapterId,
    chapterTitle: chapter?.title ?? chapterId,
    ...scenario
  };
}

export function selectLearnerProfile(progress, profileId) {
  const profile = LEARNER_PROFILES.find((item) => item.id === profileId);
  progress.learnerProfile = profile ? profile.id : null;
  return progress;
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
      matches,
      missing: question.keywords.filter((keyword) => !matches.includes(keyword))
    };
  }
  throw new Error(`Unknown question type: ${question.type}`);
}

export function questionCoachHint(question) {
  if (question.type === "single") {
    return {
      title: "先抓決策線索",
      body: "找最能完成任務、降低風險、符合 agent workflow 的選項；太像裝飾或情緒反應的答案通常不是核心。",
      starter: null
    };
  }
  if (question.type === "multi") {
    return {
      title: "先拆成流程零件",
      body: "只選真的會影響流程的元件，例如模型、工具、狀態、檢索、評估或安全邊界。",
      starter: null
    };
  }
  if (question.type === "short") {
    const keywords = question.keywords.slice(0, 3);
    return {
      title: "不用寫長，先套一句",
      body: `先用 1 句話回答目的，再補 1 個 agent workflow 角色。可用詞：${keywords.join(" / ")}。`,
      starter: `這是在處理 ${keywords.slice(0, 2).join(" / ")}，讓 agent workflow 可以...`
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

export function chapterGateMap(progress) {
  const chapters = chapterMap(progress);
  return chapters.map((chapter, index) => {
    const previous = index === 0 ? null : chapters[index - 1];
    const chapterUnlocked = index === 0 || previous?.bossPassed === true;
    const lessonsUnlocked = chapterUnlocked;
    const bossUnlocked = chapterUnlocked && chapter.completedLessons === chapter.totalLessons;
    const interviewUnlocked = chapterUnlocked && chapter.bossPassed;
    const pitchUnlocked = interviewUnlocked;
    const gate = !chapterUnlocked ? "locked" : chapter.bossPassed ? "cleared" : "current";
    const gateLabel = !chapterUnlocked
      ? "先通關前一章 Boss"
      : chapter.bossPassed
        ? "已解鎖面試練習"
        : chapter.completedLessons === chapter.totalLessons
          ? "可挑戰 Boss"
          : "先完成本章短課";

    return {
      chapterId: chapter.chapterId,
      gate,
      gateLabel,
      lessonsUnlocked,
      bossUnlocked,
      interviewUnlocked,
      pitchUnlocked
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

export function chapterSummaryCards(progress) {
  const skillsByChapter = new Map(jobReadinessSkills.map((skill) => [skill.chapterId, skill]));
  const wrongByChapter = wrongAnswerCountsByChapter(progress);
  return chapterMap(progress).map((chapter) => {
    const skill = skillsByChapter.get(chapter.chapterId);
    const wrongCount = wrongByChapter.get(chapter.chapterId) ?? 0;
    const interviewPitch = skill
      ? `我能說明 ${skill.title} 在 agentic workflow 中的角色，並用具體風險或取捨解釋設計。`
      : `我能說明 ${chapter.title} 在 agentic workflow 中的角色。`;
    const nextAction = chapter.bossPassed
      ? "用面試情境題練 60 秒口頭說明。"
      : chapter.completedLessons > 0
        ? "完成剩餘 micro-lessons，再挑戰 Boss Quiz。"
        : "先完成本章第一個 micro-lesson。";

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      status: chapter.status,
      ability: skill?.signal ?? chapter.theme,
      interviewPitch,
      commonMistake: wrongCount > 0 ? `目前有 ${wrongCount} 個錯題需要複習。` : "目前沒有累積錯題。",
      nextAction
    };
  });
}

export function completionCard(progress, event) {
  const summariesByChapter = new Map(chapterSummaryCards(progress).map((item) => [item.chapterId, item]));
  const summary = event.chapterId ? summariesByChapter.get(event.chapterId) : null;
  const titleByType = {
    lesson: "Micro-lesson cleared",
    boss: event.passed ? "Boss cleared" : "Boss needs another run",
    interview: "Interview drill complete",
    review: "Review session complete"
  };

  return {
    type: event.type,
    title: titleByType[event.type] ?? "Session complete",
    headline: event.title ?? summary?.title ?? "Progress saved",
    ability: summary?.ability ?? "你正在把 agentic workflow 拆成可判斷、可解釋、可複習的能力。",
    result:
      event.type === "boss"
        ? `${event.score}/${event.total}，${event.passed ? "已達通關線" : "還沒到 80% 通關線"}`
        : event.type === "review"
          ? "錯題與間隔複習已更新"
          : "進度、XP 與複習排程已更新",
    nextAction: summary?.nextAction ?? "繼續下一個低阻力練習。"
  };
}

export function nextPracticeRecommendation(progress, now = Date.now()) {
  const stats = reviewStats(progress, now);
  if (stats.dueCount > 0) {
    return {
      type: "review",
      title: "先清到期複習",
      reason: `有 ${stats.dueCount} 題已到期，先重刷最能防止遺忘。`,
      cta: "開始複習"
    };
  }

  const lessons = flattenLessons();
  const chapters = chapterMap(progress);
  const bossCandidate = chapters.find((chapter) => chapter.completedLessons === chapter.totalLessons && !chapter.bossPassed);
  if (bossCandidate) {
    return {
      type: "boss",
      chapterId: bossCandidate.chapterId,
      title: "挑戰章節 Boss",
      reason: `${bossCandidate.title} 的短課已完成，現在適合用低阻力題檢查整章理解。`,
      cta: "挑戰 Boss"
    };
  }

  const interviewCandidate = chapters.find((chapter) => {
    if (!chapter.bossPassed) return false;
    return flattenInterviewQuestions()
      .filter((question) => question.chapterId === chapter.chapterId)
      .some((question) => !progress.answered[questionKey(question)]);
  });
  if (interviewCandidate) {
    return {
      type: "interview",
      chapterId: interviewCandidate.chapterId,
      title: "練一組面試情境題",
      reason: `${interviewCandidate.title} 已通關，現在把概念轉成面試時說得出口的判斷。`,
      cta: "練面試題"
    };
  }

  const lesson = lessons[progress.currentLessonIndex] ?? lessons.find((item) => !progress.completedLessons.includes(item.id));
  const chapter = chapters.find((item) => item.chapterId === lesson?.chapterId);
  if (lesson && chapter && !progress.completedLessons.includes(lesson.id)) {
    return {
      type: "lesson",
      chapterId: chapter.chapterId,
      lessonIndex: lessons.indexOf(lesson),
      title: "繼續下一個 micro-lesson",
      reason: `${chapter.title} 還有 ${chapter.totalLessons - chapter.completedLessons} 個短課未完成。`,
      cta: "繼續學"
    };
  }

  const nextChapterLesson = lessons.find((item) => !progress.completedLessons.includes(item.id));
  if (nextChapterLesson) {
    return {
      type: "lesson",
      chapterId: nextChapterLesson.chapterId,
      lessonIndex: lessons.indexOf(nextChapterLesson),
      title: "前進下一章",
      reason: `${nextChapterLesson.chapterTitle} 還沒開始，接著補下一塊能力拼圖。`,
      cta: "開始下一章"
    };
  }

  return {
    type: "done",
    title: "今天改練口頭總結",
    reason: "主線短課都已完成，可以用章節總結卡練 60 秒面試回答。",
    cta: "查看總結"
  };
}

export function pitchPracticeCard(progress, chapterId) {
  const summary = chapterSummaryCards(progress).find((item) => item.chapterId === chapterId);
  if (!summary) return null;
  return {
    chapterId,
    title: `60 秒回答：${summary.title}`,
    prompt: `請用 3 句話說明你如何理解 ${summary.title}，以及它在 agentic workflow 中解決什麼問題。`,
    outline: ["這章在解決什麼問題", "它在 agentic workflow 中扮演什麼角色", "實務上要注意哪個風險或取捨"],
    sampleAnswer: summary.interviewPitch,
    checks: [
      { id: "agent", label: "提到 agent / workflow", terms: ["agent", "workflow", "流程"] },
      { id: "risk", label: "提到風險或取捨", terms: ["風險", "取捨", "tradeoff", "邊界"] },
      { id: "detail", label: "至少 40 個字", minLength: 40 }
    ]
  };
}

export function gradePitchPractice(card, response) {
  const text = `${response ?? ""}`.trim().toLowerCase();
  const checks = card.checks.map((check) => {
    const done = check.minLength ? text.length >= check.minLength : check.terms.some((term) => text.includes(term.toLowerCase()));
    return { id: check.id, label: check.label, done };
  });
  return {
    checks,
    doneCount: checks.filter((check) => check.done).length,
    total: checks.length,
    ready: checks.every((check) => check.done)
  };
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

function wrongAnswerCountsByChapter(progress) {
  const questionsByKey = new Map(reviewableQuestions().map((question) => [questionKey(question), question]));
  return Object.entries(progress.answered).reduce((counts, [key, state]) => {
    if (state.wrongCount <= 0) return counts;
    const question = questionsByKey.get(key);
    if (!question) return counts;
    counts.set(question.chapterId, (counts.get(question.chapterId) ?? 0) + 1);
    return counts;
  }, new Map());
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
