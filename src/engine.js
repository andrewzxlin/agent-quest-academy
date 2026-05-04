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
const QUESTION_TYPE_ORDER = { single: 0, multi: 1, short: 2 };
const ROLE_FIT_TRACKS = [
  {
    id: "ai-app-builder",
    title: "AI App Builder",
    description: "能把 agent、tool、RAG 和框架選型說成可落地的產品流程。",
    chapterIds: ["agent-basics", "tools", "rag", "frameworks"]
  },
  {
    id: "agent-workflow-builder",
    title: "Agent Workflow Builder",
    description: "能拆解多步任務、狀態、記憶、人工核准和 graph workflow。",
    chapterIds: ["agent-basics", "memory", "guardrails", "frameworks"]
  },
  {
    id: "agent-reliability-builder",
    title: "Agent Reliability Builder",
    description: "能用 guardrails、evals、observability 和 grounded retrieval 提升可靠度。",
    chapterIds: ["rag", "guardrails", "evals", "observability"]
  }
];

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

const PROFILE_QUEST_STEPS = {
  beginner: [
    "先用詞卡和提示理解 agent / tool / state 的意思。",
    "每天完成一個 micro-lesson，答錯就進錯題複習。",
    "通過 Boss 後再練 60 秒口頭說明，不急著做專案。"
  ],
  "ai-user": [
    "把熟悉的 ChatGPT 用法拆成 workflow、tool、RAG、memory。",
    "用選擇題判斷哪些步驟需要工具、狀態或 guardrail。",
    "用工作情境卡練習把 AI 使用經驗轉成 agent 設計判斷。"
  ],
  interview: [
    "先看工作情境卡，抓住這章在面試裡會被問的判斷點。",
    "完成 Boss 和 interview drill，累積可口頭說明的架構語言。",
    "用 pitch 練習把問題、workflow 角色、風險取捨講成 60 秒答案。"
  ]
};

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
    questSteps: selected ? PROFILE_QUEST_STEPS[selected.id] ?? [] : [],
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

export function lessonSkillCard(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const skill = jobReadinessSkills.find((item) => item.chapterId === lesson.chapterId);
  const total = lesson.questions.length;
  const attempted = lesson.questions.filter((question) => progress.answered[questionKey({ ...question, lessonId })]).length;
  const correct = lesson.questions.filter((question) => {
    const state = progress.answered[questionKey({ ...question, lessonId })];
    return state?.correctCount > 0;
  }).length;
  const mix = ["single", "multi", "short"]
    .map((type) => ({
      type,
      label: type === "single" ? "選擇題" : type === "multi" ? "複選題" : "一句話簡答",
      count: lesson.questions.filter((question) => question.type === type).length
    }))
    .filter((item) => item.count > 0);

  return {
    lessonId,
    chapterId: lesson.chapterId,
    title: lesson.title,
    focus: lesson.focus?.length >= 20 ? lesson.focus : lesson.concept,
    jobSkill: skill?.title ?? lesson.chapterTitle,
    jobSignal: skill?.signal ?? lesson.chapterTheme,
    answerLens: "先找題目裡的 workflow 線索：state、tool、risk、feedback、human gate。",
    practicePromise: "本課只用選擇、複選與一句話簡答，先練判斷，不要求寫程式。",
    attempted,
    correct,
    total,
    mastery: masteryForLesson(progress, lesson),
    mix
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
      correct: isAnswerReady(question, response) && Number(response) === question.answer,
      expected: question.answer
    };
  }
  if (question.type === "multi") {
    const expected = [...question.answer].sort((a, b) => a - b);
    const actual = [...(response ?? [])].map(Number).sort((a, b) => a - b);
    return {
      correct: isAnswerReady(question, response) && JSON.stringify(expected) === JSON.stringify(actual),
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

export function isAnswerReady(question, response) {
  if (question.type === "single") {
    return response !== null && response !== undefined && response !== "";
  }
  if (question.type === "multi") {
    return Array.isArray(response) && response.length > 0;
  }
  if (question.type === "short") {
    return `${response ?? ""}`.trim().length > 0;
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

export function shortAnswerSupport(question) {
  if (question.type !== "short") return null;
  const concepts = question.keywords.slice(0, Math.max(1, question.minMatches));
  return {
    title: "概念積木",
    prompt: "先選 1-2 個概念放進答案，再用自己的話補成一句完整說明。",
    concepts: question.keywords,
    needed: question.minMatches,
    sentenceTemplate: `我會先看 ${concepts.join(" 和 ")}，因為 agentic workflow 需要把任務、工具和風險說清楚。`
  };
}

export function answerRecallCue(question, result) {
  if (question.type === "single") {
    const expected = question.choiceFeedback?.[result.expected];
    return {
      title: "下次先抓這個線索",
      body: expected ? `看到類似題目時，先找會影響 workflow 的核心選項：${expected.choice}。` : "看到類似題目時，先找真正會改變 workflow 行動或風險的選項。"
    };
  }
  if (question.type === "multi") {
    const coreChoices = (question.choiceFeedback ?? []).filter((item) => item.correct).map((item) => item.choice);
    return {
      title: "下次逐一檢查",
      body: `把選項拆成零件檢查：${coreChoices.slice(0, 3).join(" / ")}。只選真的會影響 agent workflow 的部分。`
    };
  }
  if (question.type === "short") {
    const anchor = (result.matches?.[0] ?? question.keywords[0]) || "核心概念";
    return {
      title: "下次先說一個概念",
      body: `先講出 ${anchor}，再補一句它如何幫助 agentic workflow 判斷任務、工具或風險。`
    };
  }
  throw new Error(`Unknown question type: ${question.type}`);
}

export function mistakeRescuePrompt(question, result) {
  if (result.correct) return null;
  if (question.type === "single") {
    return {
      title: "下次先找核心任務",
      body: "重看題目時，先問：哪個選項真的會改變 agent workflow 的行動、狀態或風險？"
    };
  }
  if (question.type === "multi") {
    return {
      title: "下次逐一檢查每個零件",
      body: "把每個選項都問一次：它是不是 workflow 必須追蹤、呼叫、檢索、評估或保護的部分？"
    };
  }
  if (question.type === "short") {
    const missing = (result.missing ?? question.keywords).slice(0, 3);
    return {
      title: "下次補上關鍵詞",
      body: `先不用寫長，下一次只要補進這些概念之一：${missing.join(" / ")}。`
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
  const newlyCompleted = !progress.completedLessons.includes(lessonId);
  if (!newlyCompleted) return progress;

  progress.completedLessons.push(lessonId);
  progress.streak += 1;
  const lessons = flattenLessons();
  progress.currentLessonIndex = Math.min(progress.currentLessonIndex + 1, lessons.length - 1);
  progress.lastActiveAt = now;
  recordDailyActivity(progress, now, { lessonsCompleted: 1 });
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
  return [...due, ...lowFrictionQuestionOrder(fresh)].slice(0, 7);
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
        rescue: question ? mistakeRescuePrompt(question, { correct: false, missing: question.keywords ?? [] }) : null,
        wrongCount: state.wrongCount,
        correctCount: state.correctCount,
        lastResult: state.lastResult,
        dueAt: review?.dueAt ?? state.nextReviewAt,
        due: (review?.dueAt ?? state.nextReviewAt) <= now
      };
    })
    .filter((item) => item.question);
}

export function mistakeFocusCard(progress, now = Date.now()) {
  const mistakes = mistakeNotebook(progress, now, 20);
  if (mistakes.length === 0) return null;
  const focus = [...mistakes].sort((a, b) => Number(b.due) - Number(a.due) || b.wrongCount - a.wrongCount)[0];
  const dueCount = mistakes.filter((item) => item.due).length;
  const totalWrong = mistakes.reduce((sum, item) => sum + item.wrongCount, 0);
  return {
    key: focus.key,
    chapterTitle: focus.chapterTitle,
    lessonTitle: focus.lessonTitle,
    prompt: focus.question.prompt,
    due: focus.due,
    dueCount,
    totalWrong,
    wrongCount: focus.wrongCount,
    rescue: focus.rescue,
    nextAction: focus.due
      ? "先做這題的複習，不急著往下一課衝。"
      : "先讀提示，等排程到期後再回來複習。"
  };
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

export function learningPuzzleBoard(progress) {
  const gatesByChapter = new Map(chapterGateMap(progress).map((gate) => [gate.chapterId, gate]));
  const proofsByChapter = new Map(abilityProofCards(progress).map((proof) => [proof.chapterId, proof]));
  const skillsByChapter = new Map(jobReadinessSkills.map((skill) => [skill.chapterId, skill]));

  return chapterMap(progress).map((chapter, index) => {
    const gate = gatesByChapter.get(chapter.chapterId);
    const proof = proofsByChapter.get(chapter.chapterId);
    const skill = skillsByChapter.get(chapter.chapterId);
    const interviewReady = proof?.status === "interview_ready";
    const lessonDone = chapter.completedLessons === chapter.totalLessons;
    const locked = gate?.lessonsUnlocked === false;
    const percent = locked
      ? 0
      : Math.min(100, Math.round(chapter.lessonPercent * 0.6) + (chapter.bossPassed ? 25 : 0) + (interviewReady ? 15 : 0));
    const status = locked
      ? "locked"
      : interviewReady
        ? "complete"
        : chapter.bossPassed
          ? "proven"
          : lessonDone
            ? "boss_ready"
            : chapter.completedLessons > 0
              ? "learning"
              : "new";
    const nextAction = locked
      ? "先通過前一章 Boss，這塊拼圖就會解鎖。"
      : interviewReady
        ? "已補上這塊拼圖；用 60 秒 pitch 把它講順。"
        : chapter.bossPassed
          ? "做面試情境題，把 Boss 能力轉成口語判斷。"
          : lessonDone
            ? "挑戰 Boss Quiz，確認這塊能力能穩定判斷。"
            : chapter.completedLessons > 0
              ? "完成下一個 micro-lesson，先把小判斷練熟。"
              : "從第一個 micro-lesson 開始，只先做選擇與簡答。";

    return {
      chapterId: chapter.chapterId,
      order: index + 1,
      title: skill?.title ?? chapter.title,
      chapterTitle: chapter.title,
      status,
      percent,
      whyItMatters: skill?.signal ?? chapter.theme,
      nextAction,
      stages: [
        {
          label: "Micro-lessons",
          done: lessonDone,
          progress: `${chapter.completedLessons}/${chapter.totalLessons}`
        },
        {
          label: "Boss proof",
          done: chapter.bossPassed,
          progress: chapter.bossScore ?? "not yet"
        },
        {
          label: "Interview drill",
          done: interviewReady,
          progress: proof?.interviewProgress ?? "0/3 interview drill"
        }
      ]
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

export function abilityProofCards(progress) {
  const skillsByChapter = new Map(jobReadinessSkills.map((skill) => [skill.chapterId, skill]));
  const interviewByChapter = flattenInterviewQuestions().reduce((groups, question) => {
    const list = groups.get(question.chapterId) ?? [];
    list.push(question);
    groups.set(question.chapterId, list);
    return groups;
  }, new Map());

  return chapterMap(progress).map((chapter) => {
    const skill = skillsByChapter.get(chapter.chapterId);
    const interviewQuestions = interviewByChapter.get(chapter.chapterId) ?? [];
    const answeredInterviewCount = interviewQuestions.filter((question) => progress.answered[questionKey(question)]).length;
    const interviewDone = interviewQuestions.length > 0 && answeredInterviewCount === interviewQuestions.length;
    const status = interviewDone ? "interview_ready" : chapter.bossPassed ? "proven" : chapter.completedLessons > 0 ? "practicing" : "new";
    const proof = interviewDone
      ? "已完成 Boss 與面試情境題，可以練習完整說明。"
      : chapter.bossPassed
        ? "Boss 已通過，下一步是把判斷說成面試答案。"
        : chapter.completedLessons > 0
          ? `${chapter.lessonPercent}% micro-lessons completed，正在累積判斷力。`
          : "尚未開始，先用詞卡和第一個 micro-lesson 建立直覺。";

    return {
      chapterId: chapter.chapterId,
      title: chapter.title,
      status,
      abilityStatement: skill ? `我能判斷：${skill.signal}` : `我能說明：${chapter.theme}`,
      proof,
      interviewProgress: `${answeredInterviewCount}/${interviewQuestions.length} interview drill`
    };
  });
}

export function careerReadinessSnapshot(progress, now = Date.now()) {
  const proofs = abilityProofCards(progress);
  const counts = proofs.reduce(
    (total, card) => {
      total[card.status] = (total[card.status] ?? 0) + 1;
      return total;
    },
    { new: 0, practicing: 0, proven: 0, interview_ready: 0 }
  );
  const provenCount = counts.proven + counts.interview_ready;
  const percent = proofs.length === 0 ? 0 : Math.round((provenCount / proofs.length) * 100);
  const next = nextPracticeRecommendation(progress, now);
  const level =
    counts.interview_ready >= 6
      ? "Interview-ready track"
      : provenCount >= 4
        ? "Explanation signal track"
        : counts.practicing > 0 || provenCount > 0
          ? "Skill-building track"
          : "Fresh start";

  return {
    level,
    percent,
    total: proofs.length,
    provenCount,
    interviewReadyCount: counts.interview_ready,
    practicingCount: counts.practicing,
    nextGap: next.type === "done" ? "All current chapters are cleared." : next.title,
    nextAction: next.cta
  };
}

export function jobRoleFitCard(progress) {
  const proofsByChapter = new Map(abilityProofCards(progress).map((proof) => [proof.chapterId, proof]));
  const chaptersById = new Map(chapterMap(progress).map((chapter) => [chapter.chapterId, chapter]));
  const gatesByChapter = new Map(chapterGateMap(progress).map((gate) => [gate.chapterId, gate]));
  const tracks = ROLE_FIT_TRACKS.map((track) => {
    const pieces = track.chapterIds.map((chapterId) => proofsByChapter.get(chapterId)).filter(Boolean);
    const readyPieces = pieces.filter((piece) => ["proven", "interview_ready"].includes(piece.status));
    const practicingPieces = pieces.filter((piece) => piece.status === "practicing");
    const next = pieces.find((piece) => !["proven", "interview_ready"].includes(piece.status)) ?? null;
    const level =
      readyPieces.length === pieces.length
        ? "interview-ready"
        : readyPieces.length > 0
          ? "building evidence"
          : practicingPieces.length > 0
            ? "warming up"
            : "starter";

    return {
      ...track,
      readyCount: readyPieces.length,
      practicingCount: practicingPieces.length,
      total: pieces.length,
      level,
      nextGap: next?.title ?? "All role signals are ready",
      recommendedPractice: roleFitRecommendedPractice(progress, next, chaptersById, gatesByChapter),
      nextAction: next
        ? `Next: make ${next.title} Boss-proven, then explain it in interview practice.`
        : "Next: rehearse the strongest 60-second pitch."
    };
  });

  const strongest = [...tracks].sort((a, b) => b.readyCount - a.readyCount || b.practicingCount - a.practicingCount)[0];

  return {
    headline: "Role Fit Map",
    summary: strongest.readyCount > 0 ? `Strongest path now: ${strongest.title}` : "Start with any path; all begin with low-friction drills.",
    tracks
  };
}

function roleFitRecommendedPractice(progress, next, chaptersById, gatesByChapter) {
  if (!next) return { type: "pitch", chapterId: progress.bossResults?.find((item) => item.passed)?.chapterId ?? "agent-basics", cta: "練 60 秒 pitch" };
  const chapter = chaptersById.get(next.chapterId);
  const gate = gatesByChapter.get(next.chapterId);
  if (gate?.lessonsUnlocked === false) {
    return roleFitPrerequisitePractice(progress, next.chapterId, chaptersById);
  }
  if (chapter && chapter.completedLessons < chapter.totalLessons) {
    const lessonIndex = flattenLessons().findIndex((lesson) => lesson.chapterId === next.chapterId && !progress.completedLessons.includes(lesson.id));
    return { type: "lesson", chapterId: next.chapterId, lessonIndex: Math.max(0, lessonIndex), cta: "練這條路線" };
  }
  if (!chapter?.bossPassed) {
    return { type: "boss", chapterId: next.chapterId, cta: "挑戰 Boss" };
  }
  return { type: "interview", chapterId: next.chapterId, cta: "練面試情境" };
}

function roleFitPrerequisitePractice(progress, targetChapterId, chaptersById) {
  const targetIndex = course.chapters.findIndex((chapter) => chapter.id === targetChapterId);
  const prerequisite = course.chapters.slice(0, Math.max(0, targetIndex)).find((chapter) => !chaptersById.get(chapter.id)?.bossPassed);
  if (!prerequisite) return { type: "locked", chapterId: targetChapterId, cta: "先解鎖前置章節" };

  const chapter = chaptersById.get(prerequisite.id);
  if (chapter.completedLessons < chapter.totalLessons) {
    const lessonIndex = flattenLessons().findIndex((lesson) => lesson.chapterId === prerequisite.id && !progress.completedLessons.includes(lesson.id));
    return { type: "lesson", chapterId: prerequisite.id, lessonIndex: Math.max(0, lessonIndex), cta: "先補前置短課" };
  }
  return { type: "boss", chapterId: prerequisite.id, cta: "先通過前置 Boss" };
}

export function jobEvidenceBrief(progress, now = Date.now()) {
  const proofs = abilityProofCards(progress);
  const next = nextPracticeRecommendation(progress, now);
  const rank = { interview_ready: 4, proven: 3, practicing: 2, new: 1 };
  const strongest = [...proofs].sort((a, b) => rank[b.status] - rank[a.status])[0] ?? null;
  if (!strongest) return null;
  const readyCount = proofs.filter((item) => ["interview_ready", "proven"].includes(item.status)).length;
  const practiceCount = proofs.filter((item) => item.status === "practicing").length;
  const headline =
    strongest.status === "interview_ready"
      ? "You have interview-ready evidence"
      : strongest.status === "proven"
        ? "You have Boss-proven evidence"
        : strongest.status === "practicing"
          ? "You have practice evidence"
          : "Start your first evidence block";

  return {
    headline,
    strongestTitle: strongest.title,
    strongestStatus: strongest.status,
    proof: strongest.proof,
    interviewLine: `我能說明 ${strongest.title} 在 agentic workflow 裡的作用，並用 ${strongest.interviewProgress} 作為目前練習證據。`,
    scriptParts: [
      `問題：${strongest.title} 幫我判斷 agentic workflow 的哪一塊能力。`,
      `角色：我會說明它如何影響 state、tool、retrieval、guardrail 或 feedback loop。`,
      `風險：我會補一句實務取捨，避免只背名詞。`
    ],
    readyCount,
    practiceCount,
    total: proofs.length,
    nextGap: next.type === "done" ? "All current evidence blocks are complete." : next.title,
    nextAction: next.cta
  };
}

export function exerciseScopeCard() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  const counts = questions.reduce(
    (total, question) => {
      total[question.type] = (total[question.type] ?? 0) + 1;
      return total;
    },
    { single: 0, multi: 0, short: 0 }
  );

  return {
    headline: "先練判斷，不先寫專案",
    description: "本階段只用單選、複選、少量簡答建立 Agentic Workflow 直覺，讓初學者先會分辨、會解釋、會修正錯題。",
    formats: [
      { label: "單選", count: counts.single, tone: "primary" },
      { label: "複選", count: counts.multi, tone: "primary" },
      { label: "簡答", count: counts.short, tone: "primary" },
      { label: "專案實作", count: 0, tone: "muted" }
    ],
    guardrails: ["不用建立 repo", "不用寫 LangGraph 程式", "簡答只練口頭解釋"]
  };
}

export function dailyQuestSnapshot(progress, now = Date.now()) {
  const missions = dailyMissions(progress, now);
  const completedCount = missions.filter((mission) => mission.done).length;
  const totalCurrent = missions.reduce((sum, mission) => sum + mission.current, 0);
  const totalTarget = missions.reduce((sum, mission) => sum + mission.target, 0);
  const active = missions.find((mission) => !mission.done) ?? missions[missions.length - 1];
  const remaining = active ? Math.max(0, active.target - active.current) : 0;
  const percent = totalTarget === 0 ? 0 : Math.round((totalCurrent / totalTarget) * 100);

  return {
    completedCount,
    totalCount: missions.length,
    percent,
    activeTitle: active?.title ?? "今日任務",
    nextStep: completedCount === missions.length ? "今日任務已完成，接著可以複習錯題或練 pitch。" : `${active.title} 還差 ${remaining} 步。`
  };
}

export function dailyMomentum(progress, now = Date.now()) {
  const activity = getDailyActivity(progress, now);
  const activeToday = isActiveDay(activity);
  const streakDays = countActiveDays(progress.dailyActivity ?? {}, now);
  const correctRate = activity.answers === 0 ? 0 : Math.round((activity.correctAnswers / activity.answers) * 100);
  const level =
    streakDays >= 7
      ? "Weekly rhythm"
      : activeToday && activity.answers >= 5
        ? "Daily quest live"
        : activeToday
          ? "Started today"
          : "Fresh start";
  const nextNudge = !activeToday
    ? "先答 1 題，把今天的學習迴圈啟動。"
    : activity.answers < 5
      ? `再答 ${5 - activity.answers} 題，就完成今日答題任務。`
      : activity.lessonsCompleted < 1
        ? "完成目前 micro-lesson，讓今天有一個清楚進度。"
        : "今天節奏已經成立；有空再補錯題或 Boss。";

  return {
    activeToday,
    streakDays,
    answersToday: activity.answers,
    correctAnswersToday: activity.correctAnswers,
    correctRate,
    lessonsCompletedToday: activity.lessonsCompleted,
    bossPassesToday: activity.bossPasses,
    level,
    nextNudge
  };
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

function lowFrictionQuestionOrder(questions) {
  return [...questions].sort((a, b) => (QUESTION_TYPE_ORDER[a.type] ?? 99) - (QUESTION_TYPE_ORDER[b.type] ?? 99));
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

function countActiveDays(dailyActivity, now) {
  let cursor = startOfLocalDay(now);
  const today = dailyActivity[dailyKey(cursor)];
  if (!isActiveDay(today)) {
    cursor = addLocalDays(cursor, -1);
  }

  let count = 0;
  while (isActiveDay(dailyActivity[dailyKey(cursor)])) {
    count += 1;
    cursor = addLocalDays(cursor, -1);
  }
  return count;
}

function isActiveDay(activity = {}) {
  return (activity.answers ?? 0) > 0 || (activity.lessonsCompleted ?? 0) > 0 || (activity.bossAttempts ?? 0) > 0;
}

function startOfLocalDay(now) {
  const date = new Date(now);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function addLocalDays(dayStart, offset) {
  const date = new Date(dayStart);
  date.setDate(date.getDate() + offset);
  return date.getTime();
}

function dailyKey(now) {
  const date = new Date(now);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextReviewTime({ correct, correctCount, wrongCount, now }) {
  if (!correct) return now;
  const day = 24 * 60 * 60 * 1000;
  if (correctCount <= 1 || wrongCount > 0) return now + day;
  if (correctCount === 2) return now + 3 * day;
  if (correctCount === 3) return now + 7 * day;
  return now + 14 * day;
}
