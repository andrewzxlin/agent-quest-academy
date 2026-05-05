import {
  beginnerGlossary,
  chapterVisuals,
  course,
  flattenInterviewQuestions,
  flattenLessons,
  flattenQuestions,
  interviewQuestionsForChapter,
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

const CONCEPT_DIAGRAM_NODES = {
  "agent-basics": [
    { label: "Goal", detail: "What the learner or user wants the agent to finish." },
    { label: "State", detail: "What the workflow remembers between steps." },
    { label: "Decision", detail: "How the next step is chosen instead of guessed." },
    { label: "Gate", detail: "Where risk, approval, or feedback changes the path." }
  ],
  tools: [
    { label: "Need", detail: "The user asks for something outside plain text." },
    { label: "Schema", detail: "The tool input is shaped before any call happens." },
    { label: "Call", detail: "The agent uses an API, search, database, or action." },
    { label: "Recover", detail: "Retry, fallback, or escalation handles tool failure." }
  ],
  rag: [
    { label: "Question", detail: "The agent receives a question that needs evidence." },
    { label: "Retrieve", detail: "Documents are chunked and searched for relevant context." },
    { label: "Ground", detail: "The answer is tied back to retrieved sources." },
    { label: "Check", detail: "Citations and uncertainty reduce hallucination risk." }
  ],
  memory: [
    { label: "Signal", detail: "A useful preference, fact, or history appears." },
    { label: "Store", detail: "Only durable, safe memory is kept." },
    { label: "Recall", detail: "The agent brings memory back when it matters." },
    { label: "Filter", detail: "Privacy and stale memory are checked before use." }
  ],
  guardrails: [
    { label: "Input", detail: "The user request is screened before action." },
    { label: "Policy", detail: "Rules define what is allowed, risky, or blocked." },
    { label: "Route", detail: "The workflow continues, asks for help, or refuses." },
    { label: "Output", detail: "The final response is checked before delivery." }
  ],
  evals: [
    { label: "Case", detail: "A realistic task becomes a repeatable test item." },
    { label: "Score", detail: "The system grades quality, safety, and correctness." },
    { label: "Compare", detail: "Changes are measured against a baseline." },
    { label: "Improve", detail: "Weak spots become the next practice target." }
  ],
  observability: [
    { label: "Trace", detail: "The full workflow is recorded step by step." },
    { label: "Span", detail: "Each model call, tool call, and guardrail is visible." },
    { label: "Metric", detail: "Latency, cost, and failures become measurable." },
    { label: "Debug", detail: "The team can find where the workflow broke." }
  ],
  frameworks: [
    { label: "Component", detail: "Models, tools, prompts, and retrievers are separated." },
    { label: "Graph", detail: "Nodes and edges make workflow state explicit." },
    { label: "Runtime", detail: "Execution handles retries, persistence, and handoffs." },
    { label: "Proof", detail: "The learner can explain why this structure matters." }
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
    dashboardMode: "beginner",
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

export function firstFiveMinuteStartCard(progress) {
  const lessons = flattenLessons();
  const lesson = lessons[progress.currentLessonIndex] ?? lessons[0];
  if (!lesson) return null;
  const diagram = conceptDiagramCard(lesson.id);
  const choiceQuestion =
    lesson.questions
      .map((question) => withLessonMetadata(question, lesson))
      .find((question) => question.type === "single" && !progress.answered[questionKey(question)]) ??
    lesson.questions.map((question) => withLessonMetadata(question, lesson)).find((question) => question.type === "single");
  const signal = choiceQuestion ? questionSignalPreview(choiceQuestion) : null;
  const receipts = learningReceiptReel(progress, 1).receipts;
  const started = receipts.length > 0;

  return {
    title: "First 5 Minutes",
    headline: started ? "Your first proof loop is started" : "Start with one picture and one choice",
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    chapterTitle: lesson.chapterTitle,
    status: started ? "started" : "new",
    nextAction: started ? "Read the receipt, then continue the lesson route." : "Look at the map, then answer one single-choice question.",
    steps: [
      {
        id: "map",
        label: "1 map",
        text: diagram?.bridgeLine ?? "Read the concept map before answering."
      },
      {
        id: "choice",
        label: "1 choice",
        text: signal?.tinyMove ?? "Pick one workflow signal."
      },
      {
        id: "receipt",
        label: "1 receipt",
        text: receipts[0]?.nextUse ?? "The first answer prints a proof or review seed."
      }
    ],
    guardrail: "No setup, no project task, no blank page.",
    reward: signal?.reward ?? "Decision signal"
  };
}

export function focusGuardCard(progress, now = Date.now()) {
  const onboarding = onboardingState(progress);
  const firstFive = firstFiveMinuteStartCard(progress);
  const stats = reviewStats(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const action =
    !onboarding.completed
      ? {
          kind: "profile",
          label: "Choose beginner mode",
          target: "beginner"
        }
      : firstFive?.status === "new"
        ? {
            kind: "recommend",
            label: "Start the first choice",
            target: next.type
          }
        : stats.dueCount > 0
          ? {
              kind: "review",
              label: "Rescue due review",
              target: "review"
            }
          : {
              kind: "recommend",
              label: next.cta,
              target: next.type
            };
  const mode =
    action.kind === "profile"
      ? "profile"
      : action.kind === "review"
        ? "rescue"
        : firstFive?.status === "new"
          ? "first-step"
          : next.type;

  return {
    title: "Focus Guard",
    mode,
    headline:
      mode === "profile"
        ? "Start with one beginner-safe choice"
        : mode === "rescue"
          ? "Clear the weak signal first"
          : mode === "first-step"
            ? "Do only the first visible prompt"
            : "One clear next move",
    reason:
      mode === "profile"
        ? "Pick a coach mode so the app can hide unnecessary decisions."
        : mode === "rescue"
          ? "Due review is the fastest way to stop a weak pattern from growing."
          : mode === "first-step"
            ? "The first loop is just a concept map, one choice, and one receipt."
            : next.reason,
    action,
    guardrail: "Only one primary action is shown here; no setup or project work required.",
    proof: firstFive?.status === "started" ? "Your proof loop has started." : "The next tiny action creates the next signal."
  };
}

export function startHereCard(progress, now = Date.now()) {
  const onboarding = onboardingState(progress);
  const firstFive = firstFiveMinuteStartCard(progress);
  const focus = focusGuardCard(progress, now);
  const minimum = dailyMinimumCard(progress, now);
  const stats = reviewStats(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const primaryStep =
    !onboarding.completed
      ? "Choose the beginner-safe route"
      : firstFive?.status === "new"
        ? "Answer one single-choice prompt"
        : stats.dueCount > 0
          ? "Replay the weakest due card"
          : next.cta;

  return {
    title: "Start Here",
    mode: focus.mode,
    headline: onboarding.completed ? "Today has one obvious first move" : "Pick your start, then answer one tiny choice",
    body: onboarding.completed
      ? "The page is organized into route, daily loop, and review loop so a beginner can act without deciding what to study first."
      : "No setup and no project task. Choose a coach mode, then the app turns agentic workflow into tiny choices.",
    action: focus.action,
    actionLabel: focus.action.label,
    steps: [
      {
        label: "Now",
        text: primaryStep
      },
      {
        label: "Minimum",
        text: minimum.status === "done" ? "Daily minimum is already banked" : "One answer is enough"
      },
      {
        label: "Signal",
        text: stats.dueCount > 0 ? `${stats.dueCount} review card keeps memory warm` : firstFive?.reward ?? "Decision signal"
      }
    ],
    promise: "Five minutes should produce a visible learning signal, not a vague study session."
  };
}

export function beginnerMissionDockCard(progress, now = Date.now()) {
  const start = startHereCard(progress, now);
  const minimum = dailyMinimumCard(progress, now);
  const landing = landingMissionStripCard(progress, now);
  const role = roleQuestBoardCard(progress, now);
  const packet = jobPacketPreviewCard(progress, now);
  const review = reviewOrbitCard(progress, now);
  const roleStarted = role.tracks.some((track) => track.sampled || ["started", "boss-proven", "complete"].includes(track.status));
  const activeId =
    start.action.kind === "profile" || start.mode === "first-step"
      ? "start"
      : review.mode === "due"
        ? "review"
        : minimum.status !== "done"
          ? "daily"
          : !roleStarted
            ? "role"
            : packet.status !== "ready"
              ? "packet"
              : "start";
  const lanes = [
    {
      id: "start",
      label: "Start",
      status: activeId === "start" ? "active" : landing.percent > 0 ? "done" : "open",
      value: start.steps[0].text,
      detail: start.promise
    },
    {
      id: "daily",
      label: "Daily",
      status: activeId === "daily" ? "active" : minimum.status,
      value: minimum.headline,
      detail: `${minimum.doneCount}/${minimum.totalCount} checks`
    },
    {
      id: "role",
      label: "Role",
      status: activeId === "role" ? "active" : roleStarted ? "started" : "open",
      value: role.activeRole,
      detail: role.activeMove
    },
    {
      id: "packet",
      label: "Packet",
      status: activeId === "packet" ? "active" : packet.status,
      value: packet.headline,
      detail: `${packet.readyCount}/${packet.totalCount} pieces`
    },
    {
      id: "review",
      label: "Review",
      status: activeId === "review" ? "active" : review.mode,
      value: review.headline,
      detail: review.nextAction
    }
  ];

  return {
    title: "Mission Dock",
    headline: "One glance shows the next playable move",
    summary: "Start, daily practice, role fit, job packet, and review stay in one compact control strip.",
    action: start.action,
    actionLabel: start.actionLabel,
    activeId,
    nextMove: lanes.find((lane) => lane.id === activeId)?.value ?? start.steps[0].text,
    progressLabel: `${landing.percent}% landing / ${packet.readyCount}/${packet.totalCount} packet`,
    reassurance: "The dock points to one tiny action; every other lane can wait.",
    lanes
  };
}

export function questBriefCard(progress, now = Date.now()) {
  const next = nextPracticeRecommendation(progress, now);
  const packet = jobPacketPreviewCard(progress, now);
  const minimum = dailyMinimumCard(progress, now);
  const stats = reviewStats(progress, now);
  const packetFocus = packet.items.find((item) => !item.done) ?? packet.items[packet.items.length - 1];
  const usePitchAction = next.type === "done" && packet.action.kind === "pitch";
  const action = usePitchAction
    ? { type: "pitch", chapterId: packet.action.chapterId, cta: "Open pitch practice" }
    : next;
  const rewardByType = {
    review: "Repair memory before it fades.",
    lesson: "Earn a fresh learning receipt.",
    boss: "Turn a chapter into proof.",
    interview: "Turn proof into spoken language.",
    pitch: "Rehearse one reusable answer.",
    done: "Keep the packet warm."
  };

  return {
    title: "Quest Brief",
    mode: action.type,
    headline: action.cta,
    body: next.reason,
    reward: rewardByType[action.type] ?? rewardByType.lesson,
    packetProgress: `${packet.readyCount}/${packet.totalCount}`,
    packetFocus: packetFocus.label,
    action,
    lanes: [
      {
        id: "move",
        label: "Move",
        text: action.title ?? next.title,
        done: false
      },
      {
        id: "minimum",
        label: "Minimum",
        text: minimum.status === "done" ? "Daily stop line already banked" : "One answer can be enough",
        done: minimum.status === "done"
      },
      {
        id: "packet",
        label: "Packet",
        text: `${packet.readyCount}/${packet.totalCount} pieces - ${packetFocus.label}`,
        done: packet.status === "ready"
      }
    ],
    reassurance: stats.dueCount > 0 ? "Due cards are handled first so weak memory becomes the next quest." : "One click starts the loop; one answer can leave a receipt."
  };
}

export function heroMissionPanelCard(progress, question, answerReady = false, checked = false, result = null, now = Date.now()) {
  const mission = questionMissionStrip(question, answerReady, checked, result);
  const role = questionRoleSignalCard(question);
  const shard = abilityShardCard(progress, question);
  const packet = jobPacketPreviewCard(progress, now);
  const packetFocus = packet.items.find((item) => !item.done) ?? packet.items[packet.items.length - 1];

  return {
    title: "Hero Mission",
    status: mission.status,
    headline: mission.headline,
    subline: mission.action,
    lanes: [
      {
        id: "now",
        label: "Now",
        value: mission.reward,
        text: mission.action,
        status: mission.status
      },
      {
        id: "skill",
        label: "Skill",
        value: role.skillTitle,
        text: `${role.stage} signal for ${role.roleText}.`,
        status: shard.status
      },
      {
        id: "proof",
        label: "Proof",
        value: `${packet.readyCount}/${packet.totalCount} packet`,
        text: checked ? mission.proofUse : `Next packet piece: ${packetFocus.label}.`,
        status: packet.status
      }
    ],
    reassurance: "One visible choice can become a skill shard, receipt, or review card."
  };
}

export function nowPlayingHudCard(
  progress,
  lesson,
  question,
  currentIndex = 0,
  total = 1,
  mode = "lesson",
  answerReady = false,
  checked = false,
  result = null,
  now = Date.now()
) {
  const stage = questionMasteryStage(question);
  const mission = questionMissionStrip(question, answerReady, checked, result);
  const shard = abilityShardCard(progress, question);
  const gate = chapterGateStrip(progress, question.chapterId ?? lesson?.chapterId);
  const stats = reviewStats(progress, now);
  const safeTotal = Math.max(total, 1);
  const safeIndex = Math.min(Math.max(currentIndex + 1, 1), safeTotal);
  const percent = Math.round((safeIndex / safeTotal) * 100);
  const status = checked ? (result?.correct ? "saved" : "repair") : answerReady ? "ready" : "choosing";
  const modeLabelByType = {
    lesson: "Lesson run",
    review: "Review rescue",
    boss: "Boss gate",
    interview: "Interview drill"
  };
  const activeGate =
    mode === "interview"
      ? gate?.steps.find((step) => step.id === "interview")
      : mode === "boss"
        ? gate?.steps.find((step) => step.id === "boss")
        : gate?.steps.find((step) => !step.done) ?? gate?.steps[0];

  return {
    title: "Now Playing",
    status,
    mode,
    modeLabel: modeLabelByType[mode] ?? modeLabelByType.lesson,
    chapterTitle: question.chapterTitle ?? lesson?.chapterTitle ?? "Current chapter",
    lessonTitle: question.lessonTitle ?? lesson?.title ?? "Current lesson",
    questionLabel: `${safeIndex}/${safeTotal}`,
    percent,
    headline: checked
      ? result?.correct
        ? "Signal saved to the route"
        : "Miss saved as a review seed"
      : answerReady
        ? "Ready to check"
        : "Pick the smallest clear signal",
    prompt: question.prompt,
    action: checked ? "Use the feedback, then move forward." : answerReady ? "Check the answer now." : mission.action,
    reward: checked ? mission.reward : `Collect ${shard.shard}`,
    lanes: [
      {
        id: "stage",
        label: stage.label,
        text: stage.proof,
        status: checked ? "done" : "current"
      },
      {
        id: "gate",
        label: activeGate?.label ?? "Gate",
        text: activeGate?.text ?? "Gate progress pending",
        status: activeGate?.done ? "done" : status
      },
      {
        id: "review",
        label: "Review",
        text: stats.dueCount > 0 ? `${stats.dueCount} due cards` : "No due cards",
        status: stats.dueCount > 0 ? "repair" : "calm"
      }
    ],
    nextUse:
      mode === "review"
        ? "Review turns weak memory into a cleaner route."
        : "This tiny answer becomes proof, review timing, or a gate unlock."
  };
}

export function learningHud(progress, now = Date.now()) {
  const badges = achievements(progress);
  const unlockedBadges = badges.filter((badge) => badge.unlocked);
  const nextBadge = badges.find((badge) => !badge.unlocked) ?? badges[badges.length - 1];
  const momentum = dailyMomentum(progress, now);
  const readiness = careerReadinessSnapshot(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const rank =
    readiness.percent >= 75
      ? "Landing-ready"
      : readiness.percent >= 35
        ? "Proof builder"
        : progress.completedLessons.length > 0 || progress.xp > 0
          ? "Path starter"
          : "Zero-friction start";

  return {
    title: "Learning HUD",
    rank,
    readinessPercent: readiness.percent,
    nextUnlock: nextBadge?.title ?? "Next proof",
    nextUnlockDetail: nextBadge?.description ?? "Keep one tiny learning signal warm.",
    nextAction: next.cta,
    proofLine:
      unlockedBadges.length > 0
        ? unlockedBadges[unlockedBadges.length - 1].proofLine
        : "I can start with one tiny choice before any project work.",
    meters: [
      {
        id: "xp",
        label: "XP",
        value: progress.xp
      },
      {
        id: "streak",
        label: "Streak",
        value: momentum.streakDays
      },
      {
        id: "badges",
        label: "Badges",
        value: `${unlockedBadges.length}/${badges.length}`
      }
    ]
  };
}

export function dashboardModeCard(progress) {
  const mode = progress.dashboardMode === "full" ? "full" : "beginner";
  return {
    title: "Dashboard Mode",
    mode,
    headline: mode === "beginner" ? "Beginner view: only the next useful pieces" : "Full dashboard: every signal visible",
    body:
      mode === "beginner"
        ? "Showing start, today, review rescue, and next-step cards so the page stays easy to act on."
        : "Showing the full evidence, role-fit, landing, puzzle, and lesson support dashboard.",
    nextMode: mode === "beginner" ? "full" : "beginner",
    actionLabel: mode === "beginner" ? "Show full dashboard" : "Return to beginner view",
    visibleGroups:
      mode === "beginner"
        ? ["Start", "Today", "Review rescue", "Next step"]
        : ["Evidence", "Roles", "Landing", "Review", "Lesson support"]
  };
}

export function setDashboardMode(progress, mode) {
  progress.dashboardMode = mode === "full" ? "full" : "beginner";
  return progress;
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

export function jargonShieldCard(chapterId) {
  const glossary = beginnerGlossaryCards(chapterId);
  return {
    title: "Jargon Shield",
    chapterId: glossary.chapterId,
    chapterTitle: glossary.chapterTitle,
    headline: `${glossary.chapterTitle}: 3 words before the quiz`,
    body: "Read these plain meanings first; then answer by recognition, not memorization.",
    promise: "No prior AI vocabulary required.",
    terms: glossary.terms.map((term) => ({
      term: term.term,
      plain: term.plain,
      cue: term.whyItMatters
    }))
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

export function lessonPracticePlan(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const countByType = (type) => lesson.questions.filter((question) => question.type === type).length;
  const attemptedByType = (type) =>
    lesson.questions.filter((question) => {
      if (question.type !== type) return false;
      return Boolean(progress.answered[questionKey({ ...question, lessonId })]);
    }).length;
  const formats = [
    {
      type: "single",
      label: "Single choice",
      role: "Recognize one strong workflow signal.",
      order: 1
    },
    {
      type: "multi",
      label: "Multi-select",
      role: "Connect several workflow parts.",
      order: 2
    },
    {
      type: "short",
      label: "Tiny short answer",
      role: "Explain the idea in one job-facing sentence.",
      order: 3
    }
  ]
    .map((format) => ({
      ...format,
      count: countByType(format.type),
      attempted: attemptedByType(format.type)
    }))
    .filter((format) => format.count > 0);
  const attempted = formats.reduce((sum, format) => sum + format.attempted, 0);
  const total = formats.reduce((sum, format) => sum + format.count, 0);

  return {
    lessonId,
    title: "Choice-first practice plan",
    headline: "Quick choices first, one small explanation last.",
    promise: "No coding tasks. This lesson stays focused on recognition, connection, and a tiny explanation.",
    attempted,
    total,
    formats,
    nextStep:
      attempted >= total
        ? "Replay due review or rehearse the lesson pitch."
        : "Start with single choice; save the short answer for the end."
  };
}

export function practiceDietCard(progress, lessonId, now = Date.now()) {
  const plan = lessonPracticePlan(progress, lessonId);
  if (!plan) return null;
  const next = nextPracticeRecommendation(progress, now);
  const count = (type) => plan.formats.find((format) => format.type === type)?.count ?? 0;
  const attempted = (type) => plan.formats.find((format) => format.type === type)?.attempted ?? 0;
  const choiceCount = count("single") + count("multi");
  const shortCount = count("short");
  const choicePercent = plan.total === 0 ? 0 : Math.round((choiceCount / plan.total) * 100);

  return {
    lessonId,
    title: "Practice Diet",
    headline: "Mostly choices, one tiny explanation.",
    description: `${choiceCount}/${plan.total} prompts are single choice or multi-select before the short answer appears.`,
    choicePercent,
    nextAction: next.cta,
    promise: "No build assignment, no setup, no long writing.",
    formats: [
      {
        id: "single",
        label: "Single choice",
        count: count("single"),
        attempted: attempted("single"),
        role: "Fast recognition"
      },
      {
        id: "multi",
        label: "Multi-select",
        count: count("multi"),
        attempted: attempted("multi"),
        role: "Connect signals"
      },
      {
        id: "short",
        label: "Tiny short answer",
        count: shortCount,
        attempted: attempted("short"),
        role: "One sentence only"
      }
    ],
    rules: [
      {
        id: "choice-first",
        label: "Choose first",
        detail: "Single and multi-select prompts build judgment before writing."
      },
      {
        id: "short-last",
        label: "Short last",
        detail: "Fresh lesson runs keep the short answer as the final tiny explanation."
      },
      {
        id: "review-loop",
        label: "Review returns",
        detail: "Wrong answers come back through spaced review instead of extra assignments."
      }
    ]
  };
}

export function choiceArcadeCard(progress) {
  const questions = flattenQuestions();
  const correctCount = (type) =>
    questions.filter(
      (question) => question.type === type && (progress.answered[questionKey(question)]?.correctCount ?? 0) > 0
    ).length;
  const singleCorrect = correctCount("single");
  const multiCorrect = correctCount("multi");
  const shortCorrect = correctCount("short");
  const rooms = [
    {
      id: "recognize",
      label: "Recognize Room",
      format: "Single choice",
      current: singleCorrect,
      target: 1,
      reward: "Decision coin",
      proof: "Spot one strong agentic workflow signal."
    },
    {
      id: "connect",
      label: "Connect Room",
      format: "Multi choice",
      current: multiCorrect,
      target: 1,
      reward: "Workflow link",
      proof: "Keep several correct workflow parts together."
    },
    {
      id: "explain",
      label: "Explain Room",
      format: "Tiny short answer",
      current: shortCorrect,
      target: 1,
      reward: "Interview line",
      proof: "Turn one idea into a short job-facing sentence."
    }
  ].map((room) => ({
    ...room,
    status: room.current >= room.target ? "done" : room.current > 0 ? "started" : "locked"
  }));
  const completedCount = rooms.filter((room) => room.status === "done").length;
  const active = rooms.find((room) => room.status !== "done") ?? rooms[rooms.length - 1];
  const answeredCorrect = singleCorrect + multiCorrect + shortCorrect;
  const choiceCorrect = singleCorrect + multiCorrect;

  return {
    title: "Choice Arcade",
    headline: completedCount === rooms.length ? "All rooms are open." : `Next room: ${active.label}`,
    activeId: active.id,
    activeReward: active.reward,
    completedCount,
    totalCount: rooms.length,
    choiceCorrect,
    shortCorrect,
    choicePercent: answeredCorrect === 0 ? 100 : Math.round((choiceCorrect / answeredCorrect) * 100),
    nextAction: active.id === "explain" ? "Write one tiny sentence." : "Clear one more choice prompt.",
    promise: "Choice rooms come first; short writing stays tiny.",
    rooms
  };
}

export function lessonStageRoute(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const plan = lessonPracticePlan(progress, lessonId);
  const ladder = lessonMasteryLadder(progress, lessonId);
  const activeStage = ladder.stages.find((stage) => !stage.done) ?? ladder.stages[ladder.stages.length - 1];
  const formatByStage = {
    recognize: "single",
    connect: "multi",
    explain: "short"
  };
  const moveByStage = {
    recognize: "Tap one option.",
    connect: "Keep every defensible part.",
    explain: "Write one useful sentence."
  };
  const rewardByStage = {
    recognize: "Decision signal",
    connect: "Workflow map signal",
    explain: "Interview wording signal"
  };
  const stages = ladder.stages.map((stage) => {
    const type = formatByStage[stage.id];
    const format = plan.formats.find((item) => item.type === type);
    const status = stage.done ? "done" : stage.id === activeStage.id ? "active" : "up-next";
    return {
      id: stage.id,
      label: stage.label,
      type,
      format: format?.label ?? type,
      attempted: format?.attempted ?? 0,
      count: format?.count ?? 0,
      current: stage.current,
      target: stage.target,
      status,
      done: stage.done,
      move: moveByStage[stage.id],
      reward: rewardByStage[stage.id],
      proof: stage.proof
    };
  });

  return {
    lessonId,
    title: "Tiny stage route",
    headline: "Recognize first, connect second, explain last.",
    promise: "No projects or coding tasks here: each stage is a small quiz move.",
    activeStageId: activeStage.id,
    activeLabel: activeStage.label,
    nextAction: ladder.doneCount === ladder.totalCount ? "Rehearse the short lesson pitch." : `Clear ${activeStage.label} with the next tiny prompt.`,
    stages
  };
}

export function lessonWarmupCard(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const plan = lessonPracticePlan(progress, lessonId);
  const mastery = masteryForLesson(progress, lesson);
  const firstUntried = lesson.questions.find((question) => !progress.answered[questionKey({ ...question, lessonId })]);
  const nextType = firstUntried?.type ?? "review";
  const nextLabel =
    nextType === "single"
      ? "pick one signal"
      : nextType === "multi"
        ? "connect several signals"
        : nextType === "short"
          ? "write one sentence"
          : "replay due review";

  return {
    lessonId,
    chapterId: lesson.chapterId,
    title: "Zero-friction warmup",
    headline: "Start by noticing, not building.",
    mastery,
    nextLabel,
    steps: [
      {
        id: "look",
        label: "Look",
        text: `Read the concept map for ${lesson.title} before touching the answers.`
      },
      {
        id: "choose",
        label: "Choose",
        text: `${plan.formats.find((format) => format.type === "single")?.count ?? 0} single-choice prompts train fast recognition.`
      },
      {
        id: "say",
        label: "Say",
        text: "The final short answer is only one job-facing sentence, not a build assignment."
      }
    ],
    reassurance: "No setup and no blank page. The next move is simply to answer the smallest visible question."
  };
}

export function lessonAnalogyBridge(lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const skill = jobReadinessSkills.find((item) => item.chapterId === lesson.chapterId);
  return {
    lessonId,
    chapterId: lesson.chapterId,
    title: "Analogy bridge",
    hook: lesson.analogy,
    cards: [
      {
        id: "picture",
        label: "Picture it",
        text: `Picture the idea like this: ${lesson.analogy}`
      },
      {
        id: "workflow",
        label: "Workflow meaning",
        text: `In the workflow, this means: ${lesson.focus ?? lesson.concept}`
      },
      {
        id: "job",
        label: "Job signal",
        text: `Use this idea to explain job-ready agentic workflow judgment: ${skill?.signal ?? lesson.chapterTheme}.`
      }
    ],
    prompt: "Read the analogy first, then answer the choice questions as workflow judgment practice."
  };
}

export function conceptDiagramCard(lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const visual = chapterVisuals[lesson.chapterId] ?? chapterVisuals["agent-basics"];
  return {
    lessonId,
    chapterId: lesson.chapterId,
    title: `${lesson.title} concept map`,
    mark: visual.mark,
    accent: visual.accent,
    caption: visual.caption,
    imagePrompt: visual.imagePrompt,
    bridgeLine: "Read left to right before answering: what enters the workflow, what changes, what is checked, and what proof comes out.",
    nodes: CONCEPT_DIAGRAM_NODES[lesson.chapterId] ?? CONCEPT_DIAGRAM_NODES["agent-basics"]
  };
}

export function questionMiniDiagramCard(question) {
  const visual = chapterVisuals[question.chapterId] ?? chapterVisuals["agent-basics"];
  const stage = questionMasteryStage(question);
  const nodes = CONCEPT_DIAGRAM_NODES[question.chapterId] ?? CONCEPT_DIAGRAM_NODES["agent-basics"];
  const activeIndexByStage = {
    recognize: 1,
    connect: 2,
    explain: 3
  };
  const activeIndex = Math.min(nodes.length - 1, activeIndexByStage[stage.id] ?? 1);

  return {
    title: "Question Mini Map",
    stage: stage.label,
    accent: visual.accent,
    mark: visual.mark,
    headline: `${stage.label}: ${nodes[activeIndex].label}`,
    bridge: "Read the visual route once, then answer the tiny prompt.",
    proofUse: stage.proof,
    nodes: nodes.map((node, index) => ({
      ...node,
      status: index < activeIndex ? "seen" : index === activeIndex ? "current" : "next"
    }))
  };
}

export function questionImageQuestCard(question) {
  const visual = chapterVisuals[question.chapterId] ?? chapterVisuals["agent-basics"];
  const stage = questionMasteryStage(question);
  const nodes = CONCEPT_DIAGRAM_NODES[question.chapterId] ?? CONCEPT_DIAGRAM_NODES["agent-basics"];
  const activeIndexByStage = {
    recognize: 1,
    connect: 2,
    explain: 3
  };
  const activeIndex = Math.min(nodes.length - 1, activeIndexByStage[stage.id] ?? 1);
  const activeNode = nodes[activeIndex];

  return {
    title: "Image 2.0 Brief",
    chapterTitle: question.chapterTitle,
    stage: stage.label,
    mark: visual.mark,
    accent: visual.accent,
    headline: `${visual.mark} scene: ${activeNode.label}`,
    imagePrompt: `${visual.imagePrompt}, focus on ${activeNode.label.toLowerCase()} step, beginner friendly, polished learning game UI`,
    visualCue: activeNode.detail,
    answerCue: stage.nextAction,
    proofUse: stage.proof,
    panels: [
      {
        id: "scene",
        label: "Scene",
        text: visual.caption
      },
      {
        id: "focus",
        label: activeNode.label,
        text: activeNode.detail
      },
      {
        id: "answer",
        label: "Answer",
        text: stage.nextAction
      }
    ],
    guardrail: "Use the image to recognize the workflow step, then return to the choice."
  };
}

export function lessonMasteryLadder(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const countCorrect = (type) =>
    lesson.questions.filter((question) => {
      if (question.type !== type) return false;
      const state = progress.answered[questionKey({ ...question, lessonId })];
      return state?.correctCount > 0;
    }).length;
  const countTotal = (type) => lesson.questions.filter((question) => question.type === type).length;
  const stages = [
    {
      id: "recognize",
      label: "Recognize",
      current: countCorrect("single"),
      target: countTotal("single"),
      proof: "Spot the strongest workflow signal in single choice."
    },
    {
      id: "connect",
      label: "Connect",
      current: countCorrect("multi"),
      target: countTotal("multi"),
      proof: "Link several correct workflow parts in multi-select."
    },
    {
      id: "explain",
      label: "Explain",
      current: countCorrect("short"),
      target: countTotal("short"),
      proof: "Say the idea in a short job-facing explanation."
    }
  ].map((stage) => ({
    ...stage,
    done: stage.target > 0 && stage.current >= stage.target
  }));
  const doneCount = stages.filter((stage) => stage.done).length;
  const active = stages.find((stage) => !stage.done) ?? stages[stages.length - 1];
  const level =
    doneCount === stages.length
      ? "Ready to teach"
      : doneCount === 2
        ? "Explanation forming"
        : doneCount === 1
          ? "Pattern recognized"
          : "Starting from zero";

  return {
    lessonId,
    title: "0 to mastery ladder",
    level,
    doneCount,
    totalCount: stages.length,
    nextAction: doneCount === stages.length ? "Rehearse the 60-second explanation." : `Next: ${active.label}.`,
    stages
  };
}

export function lessonLadderStrip(progress, lessonId, currentQuestion) {
  const ladder = lessonMasteryLadder(progress, lessonId);
  if (!ladder) return null;
  const currentStage = currentQuestion ? questionMasteryStage(currentQuestion) : null;
  const stages = ladder.stages.map((stage) => ({
    ...stage,
    status: stage.done ? "done" : stage.id === currentStage?.id ? "current" : "up-next"
  }));
  const active = stages.find((stage) => stage.status === "current") ?? stages.find((stage) => !stage.done) ?? stages[stages.length - 1];

  return {
    title: "Lesson Ladder",
    level: ladder.level,
    headline: `${ladder.doneCount}/${ladder.totalCount} stages ready`,
    activeStage: active.label,
    activeProof: active.proof,
    nextAction: ladder.nextAction,
    stages
  };
}

export function lessonPitchBuilder(progress, lessonId) {
  const lesson = flattenLessons().find((item) => item.id === lessonId);
  if (!lesson) return null;
  const skill = jobReadinessSkills.find((item) => item.chapterId === lesson.chapterId);
  const ladder = lessonMasteryLadder(progress, lessonId);
  const nextStage = ladder.stages.find((stage) => !stage.done) ?? null;
  const readyStages = ladder.doneCount;

  return {
    lessonId,
    chapterId: lesson.chapterId,
    title: "3-line lesson pitch",
    readiness:
      readyStages === ladder.totalCount
        ? "ready to rehearse"
        : readyStages > 0
          ? "drafting"
          : "starter",
    readyStages,
    totalStages: ladder.totalCount,
    nextAction: nextStage ? `Finish ${nextStage.label} to strengthen this pitch.` : "Read the three lines out loud once.",
    lines: [
      {
        id: "problem",
        label: "Problem",
        text: `This lesson helps me judge ${skill?.title ?? lesson.chapterTitle} in an agentic workflow.`
      },
      {
        id: "workflow",
        label: "Workflow Role",
        text: `I can connect the workflow signal to ${lesson.focus ?? lesson.concept}.`
      },
      {
        id: "tradeoff",
        label: "Risk / Tradeoff",
        text: "I can explain the risk, boundary, or next check instead of only naming the concept."
      }
    ]
  };
}

export function questionMasteryStage(question) {
  if (question.type === "single") {
    return {
      id: "recognize",
      label: "Recognize",
      proof: "This question trains you to spot the strongest workflow signal.",
      nextAction: "Pick the option that changes the agent's decision or risk."
    };
  }
  if (question.type === "multi") {
    return {
      id: "connect",
      label: "Connect",
      proof: "This question trains you to link multiple workflow parts.",
      nextAction: "Select every part that affects state, tools, retrieval, checks, or feedback."
    };
  }
  if (question.type === "short") {
    return {
      id: "explain",
      label: "Explain",
      proof: "This question trains you to turn the idea into a short job-facing explanation.",
      nextAction: "Use one concept word, then say why it matters in the workflow."
    };
  }
  throw new Error(`Unknown question type: ${question.type}`);
}

export function questionSignalPreview(question) {
  const stage = questionMasteryStage(question);
  const rewardByStage = {
    recognize: "Decision signal",
    connect: "Workflow map signal",
    explain: "Interview wording signal"
  };
  const formatByType = {
    single: "One choice",
    multi: "Several defensible choices",
    short: "One short sentence"
  };
  const tinyMoveByType = {
    single: "Choose the option that changes what the agent should do.",
    multi: "Keep each part that affects state, tools, retrieval, checks, or feedback.",
    short: "Use one concept chip, then say why it matters."
  };

  return {
    title: "Question Signal",
    stage: stage.label,
    reward: rewardByStage[stage.id],
    format: formatByType[question.type],
    tinyMove: tinyMoveByType[question.type],
    proofUse: `This answer can become a ${stage.label.toLowerCase()} receipt for ${question.chapterTitle}.`,
    steps: [
      { id: "look", label: "Look", text: "Find the workflow signal." },
      { id: "answer", label: "Answer", text: formatByType[question.type] },
      { id: "save", label: "Save", text: rewardByStage[stage.id] }
    ]
  };
}

export function questionPlainDecoderCard(question) {
  const stage = questionMasteryStage(question);
  const skill = jobReadinessSkills.find((item) => item.chapterId === question.chapterId);
  const configByType = {
    single: {
      plainAsk: "Which option changes the agent workflow most clearly?",
      notAsking: "It is not asking for the fanciest wording.",
      tinyRule: "Pick one workflow-changing signal."
    },
    multi: {
      plainAsk: "Which options are real parts of the workflow?",
      notAsking: "It is not asking you to stop after the first true option.",
      tinyRule: "Keep every real workflow part; drop nice-to-have extras."
    },
    short: {
      plainAsk: "Can you explain the workflow idea in one useful sentence?",
      notAsking: "It is not asking for an essay or a perfect interview answer.",
      tinyRule: "Use one keyword, then say why it matters."
    }
  };
  const config = configByType[question.type] ?? configByType.single;

  return {
    title: "Plain-English Decoder",
    stage: stage.label,
    headline: `${stage.label} without jargon`,
    plainAsk: config.plainAsk,
    notAsking: config.notAsking,
    tinyRule: config.tinyRule,
    skillTitle: skill?.title ?? question.chapterTitle ?? "Agentic workflow",
    chips: [
      { id: "ask", label: "Actually asking", text: config.plainAsk },
      { id: "avoid", label: "Not asking", text: config.notAsking },
      { id: "move", label: "Tiny move", text: config.tinyRule }
    ]
  };
}

export function questionRoleSignalCard(question) {
  const skill = jobReadinessSkills.find((item) => item.chapterId === question.chapterId);
  const stage = questionMasteryStage(question);
  const roleTracks = ROLE_FIT_TRACKS.filter((track) => track.chapterIds.includes(question.chapterId));
  const roles = roleTracks.map((track) => track.title);
  const roleText = roles.length > 0 ? roles.join(" / ") : "Agentic Workflow roles";

  return {
    title: "Role Signal",
    skillTitle: skill?.title ?? question.chapterTitle ?? "Agentic workflow skill",
    stage: stage.label,
    headline: `${stage.label} practice for ${skill?.title ?? "agentic workflow judgment"}`,
    jobSignal: skill?.signal ?? stage.proof,
    roleText,
    tinyProof: `This prompt can become one ${stage.label.toLowerCase()} proof line for ${roleText}.`,
    chips: [
      { id: "skill", label: "Skill", value: skill?.title ?? question.chapterTitle ?? "Workflow judgment" },
      { id: "stage", label: "Stage", value: stage.label },
      { id: "role", label: "Role path", value: roles[0] ?? "Agentic Workflow roles" }
    ]
  };
}

export function questionComfortMeterCard(question, answerReady = false, checked = false, result = null) {
  const preview = questionSignalPreview(question);
  const stage = questionMasteryStage(question);
  const typeConfig = {
    single: {
      format: "Pick 1",
      effort: "Lightest",
      meter: 1,
      move: "Choose the option that best matches the workflow signal."
    },
    multi: {
      format: "Pick signals",
      effort: "Low",
      meter: 2,
      move: "Select every option that belongs in the workflow."
    },
    short: {
      format: "One sentence",
      effort: "Small write",
      meter: 3,
      move: "Use the chips or template, then write one compact answer."
    }
  };
  const config = typeConfig[question.type] ?? typeConfig.single;
  const status = checked ? (result?.correct ? "saved" : "repair") : answerReady ? "ready" : "calm";
  const headlineByStatus = {
    calm: `No blank page: ${config.format}`,
    ready: "Ready to check",
    saved: "Comfort loop saved",
    repair: "No penalty: review will replay it"
  };

  return {
    title: "Comfort Meter",
    status,
    headline: headlineByStatus[status],
    stage: stage.label,
    reassurance: checked
      ? result?.correct
        ? "This answer became a saved signal."
        : "A miss becomes a review card, not a dead end."
      : "Only one tiny move is required before feedback appears.",
    bars: Array.from({ length: 3 }, (_, index) => ({
      id: `bar-${index + 1}`,
      active: index < config.meter
    })),
    lanes: [
      {
        id: "effort",
        label: "Effort",
        text: config.effort
      },
      {
        id: "move",
        label: "Move",
        text: checked ? (result?.correct ? "Continue" : "Review seed") : config.move
      },
      {
        id: "reward",
        label: "Reward",
        text: preview.reward
      }
    ]
  };
}

export function questionTimeboxCard(question, currentIndex = 0, total = 1, checked = false, result = null) {
  const typeConfig = {
    single: {
      seconds: 20,
      label: "Quick pick",
      stopLine: "Pick the strongest signal; do not reread every option twice."
    },
    multi: {
      seconds: 35,
      label: "Signal sweep",
      stopLine: "Select the options that clearly belong, then check."
    },
    short: {
      seconds: 60,
      label: "Tiny explain",
      stopLine: "One useful sentence is enough; polish comes later."
    }
  };
  const config = typeConfig[question.type] ?? typeConfig.single;
  const safeTotal = Math.max(1, total);
  const safeIndex = Math.min(Math.max(currentIndex, 0), safeTotal - 1);
  const status = checked ? (result?.correct ? "banked" : "review") : "live";

  return {
    title: "Tiny Timebox",
    status,
    headline: checked ? (result?.correct ? "Timebox banked" : "Timebox becomes review") : `Try this in ${config.seconds} seconds`,
    progressLabel: `${safeIndex + 1}/${safeTotal}`,
    modeLabel: config.label,
    stopLine: checked
      ? result?.correct
        ? "Move on while the signal is fresh."
        : "Stop here; the review loop will bring it back."
      : config.stopLine,
    lanes: [
      {
        id: "timer",
        label: "Timer",
        text: `${config.seconds}s`
      },
      {
        id: "stop",
        label: "Stop line",
        text: checked ? "Saved" : "Check after one pass"
      },
      {
        id: "after",
        label: "After",
        text: checked ? (result?.correct ? "Next prompt" : "Review later") : "Feedback appears"
      }
    ]
  };
}

export function questionMissionStrip(question, answerReady = false, checked = false, result = null) {
  const preview = questionSignalPreview(question);
  const status = checked ? (result?.correct ? "saved" : "repair") : answerReady ? "ready" : "choosing";
  const headlineByStatus = {
    choosing: `${preview.format}: find the workflow signal`,
    ready: "Ready to check this signal",
    saved: "Signal saved to the learning trail",
    repair: "Repair seed saved for review"
  };
  const actionByStatus = {
    choosing: preview.tinyMove,
    ready: "Check the answer and print a receipt.",
    saved: "Move to the next tiny prompt.",
    repair: "Read the fix, then let review bring it back."
  };

  return {
    title: "Question Mission",
    status,
    headline: headlineByStatus[status],
    reward: preview.reward,
    proofUse: preview.proofUse,
    action: actionByStatus[status],
    steps: preview.steps.map((step) => ({
      ...step,
      status:
        step.id === "look"
          ? "done"
          : step.id === "answer"
            ? answerReady || checked
              ? "done"
              : "current"
            : checked
              ? result?.correct
                ? "done"
                : "repair"
              : answerReady
                ? "current"
                : "up-next"
    }))
  };
}

export function questionActionDockCard(
  progress,
  question,
  answerReady = false,
  checked = false,
  result = null,
  currentIndex = 0,
  totalCount = 1,
  mode = "lesson",
  now = Date.now()
) {
  const mission = questionMissionStrip(question, answerReady, checked, result);
  const shard = abilityShardCard(progress, question);
  const packet = jobPacketPreviewCard(progress, now);
  const next = checked ? nextStepNudgeCard(question, result, currentIndex, totalCount, mode) : null;
  const status = checked ? (result?.correct ? "saved" : "repair") : answerReady ? "ready" : "choosing";
  const nextLabel = next?.actionLabel ?? (answerReady ? "Check answer" : mission.action);
  const lanes = [
    {
      id: "pick",
      label: "Pick",
      status: answerReady || checked ? "done" : "current",
      text: mission.steps.find((step) => step.id === "answer")?.text ?? "Choose one answer."
    },
    {
      id: "check",
      label: "Check",
      status: checked ? "done" : answerReady ? "current" : "locked",
      text: answerReady || checked ? "Answer can be checked." : "Pick first."
    },
    {
      id: "save",
      label: "Save",
      status: checked ? (result?.correct ? "done" : "repair") : "locked",
      text: checked ? mission.reward : "Receipt appears after checking."
    },
    {
      id: "next",
      label: "Next",
      status: checked ? "current" : "locked",
      text: nextLabel
    }
  ];

  return {
    title: "Action Dock",
    status,
    headline:
      status === "choosing"
        ? "Pick first, then the app checks and saves the signal"
        : status === "ready"
          ? "Ready to check without rereading everything"
          : status === "saved"
            ? "Signal saved. Move while it is fresh"
            : "Repair seed saved. Continue without restarting",
    currentAction: nextLabel,
    proofLine: checked ? mission.proofUse : shard.jobUse,
    progressLabel: `${Math.min(currentIndex + 1, totalCount)}/${Math.max(totalCount, 1)} prompt / ${packet.readyCount}/${packet.totalCount} packet`,
    lanes
  };
}

export function questionHintDeck(question) {
  const summaryByType = {
    single: "Open this only if you want a nudge before choosing one answer.",
    multi: "Open this only if you want a checklist before choosing several signals.",
    short: "Open this only if you want a nudge before writing one sentence."
  };
  const primaryByType = {
    single: "Try the choice first; hints stay optional.",
    multi: "Try the checklist first; hints stay optional.",
    short: "Try one sentence first; hints stay optional."
  };
  const cardIdsByType = {
    single: ["stage", "signal", "coach", "choice-lens", "elimination", "safety"],
    multi: ["stage", "signal", "coach", "choice-lens", "elimination", "safety"],
    short: ["stage", "signal", "coach", "safety"]
  };
  if (!summaryByType[question.type]) throw new Error(`Unknown question type: ${question.type}`);

  return {
    title: "Hint Deck",
    mode: question.type,
    summary: summaryByType[question.type],
    primaryNudge: primaryByType[question.type],
    cardIds: cardIdsByType[question.type],
    promise: "The question is still answerable without opening this deck."
  };
}

export function sessionRhythmCard(questions, currentIndex = 0) {
  const safeIndex = Math.min(Math.max(currentIndex, 0), Math.max(questions.length - 1, 0));
  const labelByType = {
    single: "Recognize",
    multi: "Connect",
    short: "Explain"
  };
  const formatByType = {
    single: "Tap one option",
    multi: "Choose several signals",
    short: "One short sentence"
  };
  const steps = questions.map((question, index) => ({
    id: `${question.lessonId ?? "session"}:${question.id}`,
    type: question.type,
    label: labelByType[question.type] ?? "Practice",
    format: formatByType[question.type] ?? "Tiny prompt",
    status: index < safeIndex ? "done" : index === safeIndex ? "current" : "up-next",
    choiceBased: ["single", "multi"].includes(question.type)
  }));
  const choiceCount = steps.filter((step) => step.choiceBased).length;
  const shortCount = steps.filter((step) => step.type === "short").length;
  const current = steps[safeIndex] ?? null;

  return {
    title: "Session Rhythm",
    headline:
      questions.length === 0
        ? "No active prompts"
        : shortCount > 0
          ? `${choiceCount} choice prompts before ${shortCount} tiny explanation.`
          : `${choiceCount} choice prompts in this run.`,
    currentLabel: current?.label ?? "Complete",
    currentFormat: current?.format ?? "No prompt",
    choiceCount,
    shortCount,
    steps,
    promise: "Choices first; the explanation stays small."
  };
}

export function abilityShardCard(progress, question) {
  const state = progress.answered[questionKey(question)];
  const stage = questionMasteryStage(question);
  const shardByStage = {
    Recognize: "Decision shard",
    Connect: "Workflow link shard",
    Explain: "Interview line shard"
  };
  const jobUseByStage = {
    Recognize: "Spot the signal that changes what an agent should do.",
    Connect: "Connect tools, state, retrieval, checks, and feedback.",
    Explain: "Turn the workflow idea into one job-facing sentence."
  };
  const status =
    state?.correctCount > 0 ? "collected" : state?.wrongCount > 0 ? "repair" : "available";
  const shard = shardByStage[stage.label] ?? "Ability shard";

  return {
    title: "Ability Shard",
    status,
    shard,
    stage: stage.label,
    chapterTitle: question.chapterTitle,
    headline:
      status === "collected"
        ? `${shard} collected`
        : status === "repair"
          ? `${shard} is ready for review`
          : `Collect a ${shard}`,
    body:
      status === "collected"
        ? "This small answer is already part of your visible ability trail."
        : status === "repair"
          ? "A missed shard becomes a review target, not extra homework."
          : "One tiny answer can add a visible job-skill signal.",
    jobUse: jobUseByStage[stage.label] ?? stage.proof,
    progressLabel: `${state?.correctCount ?? 0} clean / ${state?.wrongCount ?? 0} review`,
    nextUse:
      status === "collected"
        ? "Reuse it later in a short explanation."
        : status === "repair"
          ? "Review will bring this pattern back."
          : "Answer the current prompt to try collecting it."
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

export function choiceEliminationHint(question) {
  if (question.type === "single") {
    return {
      title: "Elimination hint",
      body: "Before choosing, cross out options that only sound helpful but do not change the agent's decision, risk, state, or feedback.",
      checks: ["Does it change the workflow?", "Does it reduce a real risk?", "Is it more than decoration?"]
    };
  }
  if (question.type === "multi") {
    return {
      title: "Elimination hint",
      body: "Before checking, remove choices that are only nice-to-have. Keep every option that changes state, tools, retrieval, checks, or human feedback.",
      checks: ["Keep all workflow parts.", "Remove nice-to-have extras.", "Do not stop after one true option."]
    };
  }
  if (question.type === "short") return null;
  throw new Error(`Unknown question type: ${question.type}`);
}

export function choiceLensCard(question) {
  if (question.type === "single") {
    return {
      title: "Choice Lens",
      mode: "single",
      body: "Use this like a tiny scanner before tapping one answer.",
      steps: [
        { id: "goal", label: "Goal", text: "What is the agent trying to decide?" },
        { id: "signal", label: "Signal", text: "Which option changes workflow state, tools, risk, or feedback most clearly?" },
        { id: "trap", label: "Trap", text: "Cross out answers that only sound polished but do not change the work." }
      ],
      checkpoint: "One defended choice is enough for this round."
    };
  }
  if (question.type === "multi") {
    return {
      title: "Choice Lens",
      mode: "multi",
      body: "Use this like a checklist before keeping multiple answers.",
      steps: [
        { id: "parts", label: "Parts", text: "Find every option that plays a real workflow role." },
        { id: "coverage", label: "Coverage", text: "Keep choices that cover state, tools, checks, retrieval, or human feedback." },
        { id: "extras", label: "Extras", text: "Remove nice-to-have ideas that do not affect the agent loop." }
      ],
      checkpoint: "Multiple small signals can be correct together."
    };
  }
  if (question.type === "short") return null;
  throw new Error(`Unknown question type: ${question.type}`);
}

export function uncertaintySafetyCard(question) {
  const stage = questionMasteryStage(question);
  const action =
    question.type === "single"
      ? "Pick the option that changes the workflow most clearly, or mark uncertainty and let review handle it."
      : question.type === "multi"
        ? "Select every workflow part you can defend, or mark uncertainty before checking."
        : question.type === "short"
          ? "Use one concept chip or the sentence template; a partial sentence is enough to create a review target."
          : null;
  if (!action) throw new Error(`Unknown question type: ${question.type}`);

  return {
    title: "Not sure is a valid move",
    stage: stage.label,
    body: `This question trains ${stage.label.toLowerCase()}. You do not need perfect confidence before answering.`,
    action,
    reviewPromise: "If you mark uncertainty, this pattern comes back through review instead of becoming a blank-page block."
  };
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

export function shortAnswerRecipe(question) {
  if (question.type !== "short") return null;
  const anchors = question.keywords.slice(0, Math.max(1, question.minMatches));
  const firstAnchor = anchors[0] ?? question.keywords[0] ?? "the key concept";
  return {
    title: "One-Sentence Recipe",
    promise: "No essay. One useful sentence is enough.",
    steps: [
      {
        id: "pick",
        label: "Pick",
        text: `Use ${firstAnchor} as the first anchor.`
      },
      {
        id: "link",
        label: "Link",
        text: "Say why it changes the workflow, tool choice, state, risk, or feedback."
      },
      {
        id: "stop",
        label: "Stop",
        text: "Stop after one complete sentence in this phase."
      }
    ]
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

export function answerMemoryHookCard(question, result) {
  const stage = questionMasteryStage(question);
  const cue = answerRecallCue(question, result);
  const status = result.correct ? "saved" : "repair";
  const anchor =
    question.type === "single"
      ? (question.choiceFeedback?.[result.expected]?.choice ?? question.choices?.[result.expected] ?? "workflow signal")
      : question.type === "multi"
        ? (question.choiceFeedback ?? [])
            .filter((item) => item.correct)
            .map((item) => item.choice)
            .slice(0, 2)
            .join(" + ") || "workflow parts"
        : (result.matches?.[0] ?? question.keywords?.[0] ?? "core concept");

  return {
    title: "Memory Hook",
    status,
    headline: result.correct ? "Keep this signal easy to recall" : "Turn the miss into a recall hook",
    stage: stage.label,
    anchor,
    cue: cue.body,
    hooks: [
      {
        id: "trigger",
        label: "Trigger",
        text: `When you see ${stage.label.toLowerCase()} practice, look for ${anchor}.`
      },
      {
        id: "shortcut",
        label: "Shortcut",
        text:
          question.type === "short"
            ? "Say one keyword, then explain why it changes the workflow."
            : "Ask whether the option changes state, tools, retrieval, risk, or feedback."
      },
      {
        id: "review",
        label: "Review",
        text: result.correct ? "Spaced review will bring it back later." : "Review will replay this pattern soon."
      }
    ]
  };
}

export function answerProofLine(question, result) {
  const stage = questionMasteryStage(question);
  if (question.type === "single") {
    const expected = question.choiceFeedback?.[result.expected]?.choice ?? question.choices?.[result.expected] ?? "the core workflow signal";
    return {
      title: `${stage.label} proof line`,
      body: `I can recognize ${expected} as the signal that changes an agentic workflow decision.`
    };
  }
  if (question.type === "multi") {
    const coreChoices = (question.choiceFeedback ?? []).filter((item) => item.correct).map((item) => item.choice);
    const proofParts = coreChoices.length > 0 ? coreChoices.slice(0, 3).join(", ") : "the connected workflow parts";
    return {
      title: `${stage.label} proof line`,
      body: `I can connect ${proofParts} and explain how they work together in an agentic workflow.`
    };
  }
  if (question.type === "short") {
    const anchor = result.matches?.[0] ?? question.keywords?.[0] ?? "the key concept";
    return {
      title: `${stage.label} proof line`,
      body: `I can explain ${anchor} in plain language and tie it to the workflow's task, tool, or risk.`
    };
  }
  throw new Error(`Unknown question type: ${question.type}`);
}

export function answerEvidenceClip(question, result) {
  const proof = answerProofLine(question, result);
  const stage = questionMasteryStage(question);
  const status = result.correct ? "saved" : "repair";
  return {
    title: "Evidence Clip",
    status,
    stage: stage.label,
    headline: result.correct ? "Saved as a reusable signal." : "Saved as a repair target.",
    line: proof.body,
    useCase: result.correct
      ? "Use this later as a short interview or portfolio explanation."
      : "Review will replay this pattern until the signal becomes clean.",
    nextAction: result.correct ? "Bank it and move to the next tiny prompt." : "Read the correction, then let review bring it back."
  };
}

export function answerJobStorySeedCard(question, result) {
  const stage = questionMasteryStage(question);
  const role = questionRoleSignalCard(question);
  const proof = answerProofLine(question, result);
  const status = result.correct ? "ready" : "draft";
  const chapter = question.chapterTitle ?? "agentic workflow";

  return {
    title: "Job Story Seed",
    status,
    headline: result.correct ? "Turn this answer into a job story seed" : "Draft the story after review repairs it",
    roleText: role.roleText,
    proofLine: proof.body,
    steps: [
      {
        id: "situation",
        label: "Situation",
        text: `A ${chapter} workflow needs a clear ${stage.label.toLowerCase()} judgment.`
      },
      {
        id: "judgment",
        label: "Judgment",
        text: result.correct
          ? proof.body
          : "I found the weak signal and saved it for review instead of guessing again."
      },
      {
        id: "signal",
        label: "Signal",
        text: result.correct
          ? `This supports ${role.roleText}.`
          : "The repair loop makes the same workflow pattern easier to explain later."
      }
    ],
    nextUse: result.correct ? "Reuse this as a tiny interview story seed." : "Revisit after review makes the signal cleaner."
  };
}

export function answerInterviewLineCard(question, result) {
  const proof = answerProofLine(question, result);
  const role = questionRoleSignalCard(question);
  const status = result.correct ? "ready" : "draft";

  return {
    title: "Answer Interview Line",
    status,
    headline: result.correct ? "Say this as a one-line signal" : "Repair this into a stronger line",
    line: proof.body,
    roleText: role.roleText,
    cue: result.correct
      ? "Use it as a short spoken proof after this run."
      : "Read the correction first; review will make this line cleaner.",
    steps: [
      { id: "read", label: "Read", text: "Say the line once." },
      { id: "role", label: "Role", text: role.chips.find((chip) => chip.id === "role")?.value ?? "Agentic Workflow roles" },
      { id: "reuse", label: "Reuse", text: result.correct ? "Bring it into pitch practice." : "Let review replay it." }
    ]
  };
}

export function answerOutcomeCard(question, result, progress) {
  const state = progress.answered[questionKey(question)];
  const clip = answerEvidenceClip(question, result);
  const stage = questionMasteryStage(question);
  const xpGain = result.correct ? 10 : 2;
  const cleanCount = state?.correctCount ?? 0;
  const reviewCount = state?.wrongCount ?? 0;

  return {
    title: "Answer Outcome",
    status: result.correct ? "proof" : "repair",
    headline: result.correct ? `+${xpGain} XP and one ${stage.label} signal` : `+${xpGain} XP and one repair loop`,
    summary: result.correct
      ? "This answer is now a small proof point, not just a score."
      : "This miss is saved so review can bring the pattern back.",
    nextAction: result.correct ? "Continue while the signal is fresh." : "Read the fix, then let review protect the weak spot.",
    lanes: [
      {
        id: "score",
        label: "Score",
        value: result.correct ? "Clean" : "Repair",
        detail: result.correct ? `${cleanCount} clean pass` : `${reviewCount} review miss`
      },
      {
        id: "memory",
        label: "Memory",
        value: result.correct ? "Scheduled" : "Due soon",
        detail: result.correct ? "Recall will check if it sticks." : "Review queue catches it quickly."
      },
      {
        id: "use",
        label: "Job use",
        value: clip.stage,
        detail: clip.useCase
      }
    ]
  };
}

export function answerGateProgressCard(progress, question, result, mode = "lesson") {
  const gate = chapterGateStrip(progress, question.chapterId);
  const stage = questionMasteryStage(question);
  const isInterview = mode === "interview" || question.lessonId?.startsWith("interview:");
  const gateId = isInterview ? "interview" : mode === "boss" ? "boss" : "lessons";
  const gateLabelById = {
    lessons: "Learn key",
    boss: "Boss key",
    interview: "Interview key"
  };
  const activeStep = gate?.steps.find((step) => step.id === gateId) ?? gate?.steps[0] ?? null;
  const status = result.correct ? "advanced" : "repair";
  const gateLabel = gateLabelById[gateId];

  return {
    title: "Gate Progress",
    status,
    chapterTitle: gate?.chapterTitle ?? question.chapterTitle,
    gateId,
    gateLabel,
    headline: result.correct ? `${gateLabel} signal charged` : `${gateLabel} repair seed saved`,
    summary: result.correct
      ? `${stage.label} practice moved this chapter route forward.`
      : "The gate is not blocked; review will bring this signal back.",
    activeProgress: activeStep?.text ?? "Gate progress pending",
    lanes:
      gate?.steps.slice(0, 3).map((step) => ({
        id: step.id,
        label: step.label,
        value: step.text,
        status: step.done ? "done" : step.id === gateId ? status : "waiting"
      })) ?? [],
    nextUse: result.correct ? "Keep going while this gate is warm." : "Read the fix, then continue without restarting."
  };
}

export function answerLootCard(question, result, progress) {
  const state = progress.answered[questionKey(question)];
  const stage = questionMasteryStage(question);
  const xpGain = result.correct ? 10 : 2;
  const cleanCount = state?.correctCount ?? 0;
  const reviewCount = state?.wrongCount ?? 0;
  const status = result.correct ? "proof" : "repair";

  return {
    title: "Answer Loot",
    status,
    headline: result.correct ? "Loot gained: proof signal saved" : "Repair loot gained: review seed saved",
    subhead: `${question.chapterTitle} / ${stage.label}`,
    nextAction: result.correct ? "Bank this signal and take the next tiny prompt." : "Read the fix, then let review bring it back.",
    badges: [
      {
        id: "xp",
        label: "XP",
        value: `+${xpGain}`,
        detail: result.correct ? "Clean answer reward" : "Repair attempt reward"
      },
      {
        id: "signal",
        label: "Signal",
        value: stage.label,
        detail: result.correct ? `${cleanCount} clean pass` : `${reviewCount} review miss`
      },
      {
        id: "loop",
        label: "Loop",
        value: result.correct ? "Recall" : "Review",
        detail: result.correct ? "Scheduled to stick" : "Queued to repair"
      }
    ]
  };
}

export function answerRunChainCard(progress, result) {
  const combo = recallComboCard(progress);
  const cleanRun = combo.cleanRun;
  const nextTarget = Math.max(0, 3 - Math.min(cleanRun, 3));
  const status = result.correct ? (cleanRun >= 3 ? "combo" : "building") : "repair";

  return {
    title: "Run Chain",
    status,
    headline:
      status === "combo"
        ? `${cleanRun} clean answers chained`
        : status === "building"
          ? `${cleanRun}/3 clean chain`
          : "Chain converted into review fuel",
    body:
      status === "repair"
        ? "A miss does not reset the route; it creates the next review target."
        : nextTarget === 0
          ? "The chain is live. Keep it warm with one more tiny prompt or stop on a win."
          : `Land ${nextTarget} more clean answer${nextTarget === 1 ? "" : "s"} to trigger a 3-answer combo.`,
    meters: [
      {
        id: "clean",
        label: "Clean",
        value: cleanRun
      },
      {
        id: "stable",
        label: "Stable",
        value: combo.stableSignals
      },
      {
        id: "repair",
        label: "Review",
        value: combo.repairedSignals
      }
    ],
    nextAction: status === "repair" ? "Read the fix, then keep moving." : combo.nextAction
  };
}

export function nextStepNudgeCard(question, result, currentIndex, totalCount, mode = "lesson") {
  const stage = questionMasteryStage(question);
  const isLast = currentIndex >= totalCount - 1;
  const finishLabelByMode = {
    lesson: "Finish this micro-lesson",
    review: "Complete review",
    boss: "Settle Boss result",
    interview: "Complete interview drill"
  };
  const nextLabelByMode = {
    lesson: "Next tiny prompt",
    review: "Next review card",
    boss: "Next Boss prompt",
    interview: "Next interview prompt"
  };
  const actionLabel = isLast ? finishLabelByMode[mode] ?? "Finish session" : nextLabelByMode[mode] ?? "Next tiny prompt";
  const status = result.correct ? "advance" : "repair";

  return {
    title: "Next Step Nudge",
    status,
    actionLabel,
    headline: result.correct ? "Signal saved. Keep the chain moving." : "Repair seed saved. Continue without restarting.",
    why: isLast
      ? `This closes the ${mode} loop and turns the ${stage.label} signal into session progress.`
      : `The next prompt keeps the ${stage.label} signal warm while the idea is still fresh.`,
    tinyRule: result.correct ? "One more small step is enough." : "Do not reread everything; just move after the fix."
  };
}

export function questionMasterySignal(progress, question) {
  const state = progress.answered[questionKey(question)];
  if (!state) return null;
  const stage = questionMasteryStage(question);
  const level =
    state.lastResult === "wrong"
      ? "review"
      : state.correctCount >= 3
        ? "stable"
        : state.correctCount >= 2
          ? "strengthening"
          : "first-pass";
  const titleByLevel = {
    review: "Review signal",
    "first-pass": "First clear pass",
    strengthening: "Recall strengthening",
    stable: "Stable signal"
  };
  const bodyByLevel = {
    review: `This ${stage.label} question is now in review, so it will come back before it becomes a weak spot.`,
    "first-pass": `You have one clean ${stage.label} pass. The next review will check whether it sticks.`,
    strengthening: `You have repeated this ${stage.label} signal correctly. Keep it short and automatic.`,
    stable: `This ${stage.label} signal is becoming stable enough to use in a job-facing explanation.`
  };

  return {
    level,
    title: titleByLevel[level],
    body: bodyByLevel[level],
    correctCount: state.correctCount,
    wrongCount: state.wrongCount,
    nextReviewAt: state.nextReviewAt
  };
}

export function proofBoosterCard(question, result, progress) {
  const proof = answerProofLine(question, result);
  const signal = questionMasterySignal(progress, question);
  const stage = questionMasteryStage(question);
  const status = result.correct ? "proof" : "review";

  return {
    title: "Proof Booster",
    status,
    headline: result.correct ? "This answer became evidence." : "This miss became a review seed.",
    stage: stage.label,
    proofLine: proof.body,
    nextUse: result.correct
      ? "Reuse this line in the one-line coach or a short interview answer."
      : "Replay this pattern later; the review loop protects the weak spot.",
    signalTitle: signal?.title ?? "Signal saved",
    correctCount: signal?.correctCount ?? 0,
    wrongCount: signal?.wrongCount ?? 0
  };
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

export function reviewRhythmCard(progress, now = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  const stats = reviewStats(progress, now);
  const dueNow = progress.reviewQueue.filter((item) => item.dueAt <= now).length;
  const next24h = progress.reviewQueue.filter((item) => item.dueAt > now && item.dueAt <= now + day).length;
  const next7d = progress.reviewQueue.filter((item) => item.dueAt > now + day && item.dueAt <= now + 7 * day).length;
  const status =
    dueNow > 0
      ? "Review ready now"
      : next24h > 0
        ? "Review coming soon"
        : stats.scheduledCount > 0
          ? "Review rhythm set"
          : "No review debt";
  const nextAction =
    dueNow > 0
      ? "Clear the due review stack before starting new lessons."
      : next24h > 0
        ? "Check back within 24 hours to replay the scheduled questions."
        : stats.scheduledCount > 0
          ? "Keep learning; the next review will reappear automatically."
          : "Answer a few questions; mistakes and correct answers will create future review.";

  return {
    headline: "Review Rhythm",
    status,
    dueNow,
    next24h,
    next7d,
    scheduledCount: stats.scheduledCount,
    wrongCount: stats.wrongCount,
    nextAction,
    proofLine: "Wrong answers return first; correct answers come back later for spaced recall."
  };
}

export function reviewOrbitCard(progress, now = Date.now()) {
  const day = 24 * 60 * 60 * 1000;
  const stats = reviewStats(progress, now);
  const counts = {
    now: progress.reviewQueue.filter((item) => item.dueAt <= now).length,
    next24h: progress.reviewQueue.filter((item) => item.dueAt > now && item.dueAt <= now + day).length,
    next7d: progress.reviewQueue.filter((item) => item.dueAt > now + day && item.dueAt <= now + 7 * day).length,
    later: progress.reviewQueue.filter((item) => item.dueAt > now + 7 * day).length
  };
  const rings = [
    {
      id: "now",
      label: "Now",
      count: counts.now,
      role: "Replay weak cards first."
    },
    {
      id: "tomorrow",
      label: "24h",
      count: counts.next24h,
      role: "Let fresh memory cool down."
    },
    {
      id: "week",
      label: "7d",
      count: counts.next7d,
      role: "Bring back stable recall."
    },
    {
      id: "later",
      label: "Later",
      count: counts.later,
      role: "Keep long-term signals alive."
    }
  ];
  const active = rings.find((ring) => ring.count > 0) ?? rings[0];
  const mode = counts.now > 0 ? "due" : stats.scheduledCount > 0 ? "scheduled" : "empty";

  return {
    title: "Review Orbit",
    mode,
    headline:
      mode === "due"
        ? "A review card is back in orbit."
        : mode === "scheduled"
          ? "Review is scheduled, not forgotten."
          : "First answers will seed the orbit.",
    activeId: active.id,
    activeLabel: mode === "empty" ? "Seed" : active.label,
    dueCount: counts.now,
    scheduledCount: stats.scheduledCount,
    wrongCount: stats.wrongCount,
    nextAction:
      mode === "due"
        ? "Start the due review queue."
        : mode === "scheduled"
          ? "Answer one fresh choice while review waits."
          : "Answer one choice to seed the orbit.",
    promise: "Reviews stay tiny: choose, connect, or write one short sentence.",
    rings: rings.map((ring) => ({
      ...ring,
      status: mode !== "empty" && ring.id === active.id ? "active" : ring.count > 0 ? "waiting" : "empty"
    }))
  };
}

export function reviewSprintCard(progress, now = Date.now()) {
  const stats = reviewStats(progress, now);
  const due = getDueReviewQuestions(progress, now, 3);
  const recentMistakes = mistakeNotebook(progress, now, 3);
  const focus = due[0] ?? recentMistakes[0]?.question ?? null;
  const mode = due.length > 0 ? "ready" : stats.scheduledCount > 0 ? "scheduled" : "empty";

  return {
    title: "Review Sprint",
    mode,
    headline:
      mode === "ready"
        ? "Replay one weak pattern now"
        : mode === "scheduled"
          ? "Review is waiting for the right time"
          : "Create the first review seed",
    queueLabel:
      mode === "ready"
        ? `${due.length} due card${due.length === 1 ? "" : "s"} ready`
        : mode === "scheduled"
          ? `${stats.scheduledCount} card${stats.scheduledCount === 1 ? "" : "s"} scheduled`
          : "No review cards yet",
    dueCount: stats.dueCount,
    scheduledCount: stats.scheduledCount,
    wrongCount: stats.wrongCount,
    focus: focus
      ? {
          prompt: focus.prompt,
          lessonTitle: focus.lessonTitle,
          chapterTitle: focus.chapterTitle,
          type: focus.type
        }
      : null,
    primaryAction:
      mode === "ready"
        ? "Start the due review queue."
        : mode === "scheduled"
          ? "Answer one new choice question while review waits."
          : "Answer one single-choice question; misses come back first.",
    proofLine: "A sprint is tiny on purpose: recognize, choose, then save the recall signal.",
    steps: [
      {
        id: "peek",
        label: "Peek",
        text: mode === "ready" ? "Look at the next due pattern." : "Let the system pick the next small prompt."
      },
      {
        id: "choose",
        label: "Choose",
        text: "Make one choice or write one short sentence."
      },
      {
        id: "loop",
        label: "Loop",
        text: "Correct answers move later; misses return sooner."
      }
    ]
  };
}

export function reviewRescueQuest(progress, now = Date.now()) {
  const mistakes = mistakeNotebook(progress, now, 6);
  const dueCount = mistakes.filter((item) => item.due).length;
  const rescuedCount = mistakes.filter((item) => !item.due && item.lastResult === "correct").length;
  const lockedCount = Math.max(0, mistakes.length - dueCount - rescuedCount);
  const mode = dueCount > 0 ? "active" : mistakes.length > 0 ? "waiting" : "empty";
  const headline =
    mode === "active"
      ? "A weak card is ready to revive"
      : mode === "waiting"
        ? "Rescue cards are cooling down"
        : "No rescue cards yet";

  return {
    title: "Rescue Quest",
    mode,
    headline,
    dueCount,
    rescuedCount,
    lockedCount,
    nextAction:
      mode === "active"
        ? "Replay the active card before starting a new lesson."
        : mode === "waiting"
          ? "Keep the streak alive with one fresh choice while rescue waits."
          : "Missed answers will become rescue cards automatically.",
    promise: "Every rescue is still a tiny quiz move: choose, connect, or write one sentence.",
    cards: mistakes.slice(0, 3).map((item) => {
      const status = item.due ? "active" : item.lastResult === "correct" ? "rescued" : "locked";
      return {
        key: item.key,
        status,
        label: status === "active" ? "Revive now" : status === "rescued" ? "Rescued" : "Cooling down",
        chapterTitle: item.chapterTitle,
        lessonTitle: item.lessonTitle,
        prompt: item.question.prompt,
        wrongCount: item.wrongCount,
        correctCount: item.correctCount,
        reward:
          status === "active"
            ? "Recover this weak signal"
            : status === "rescued"
              ? "Proof moved back into memory"
              : "Return later at the right interval"
      };
    })
  };
}

export function mistakeSafetyNetCard(progress, now = Date.now()) {
  const stats = reviewStats(progress, now);
  const quest = reviewRescueQuest(progress, now);
  const mode = quest.mode === "active" ? "rescue-now" : quest.mode === "waiting" ? "cooling" : "safe-start";
  return {
    title: "Mistake Safety Net",
    mode,
    headline:
      mode === "rescue-now"
        ? "A mistake is ready to become memory"
        : mode === "cooling"
          ? "Mistakes are safely scheduled"
          : "Wrong answers are allowed here",
    body:
      mode === "safe-start"
        ? "If you miss, the app turns it into a tiny review card instead of a dead end."
        : "The review loop decides when to bring a weak pattern back, so you only handle the next small card.",
    dueCount: stats.dueCount,
    scheduledCount: stats.scheduledCount,
    rescuedCount: quest.rescuedCount,
    nextAction:
      mode === "rescue-now"
        ? "Replay one due card."
        : mode === "cooling"
          ? "Answer one fresh choice while review waits."
          : "Try one choice; any miss becomes a rescue card.",
    steps: [
      {
        id: "miss",
        label: "Miss",
        text: "A wrong answer becomes a visible review seed."
      },
      {
        id: "return",
        label: "Return",
        text: "The weak pattern comes back when it is useful."
      },
      {
        id: "repair",
        label: "Repair",
        text: "A correct replay moves the shard back toward memory."
      }
    ]
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
      const repairClip = question ? answerEvidenceClip(question, gradeQuestion(question, wrongReplayResponse(question))) : null;
      return {
        key,
        question,
        lessonTitle: question?.lessonTitle ?? "Unknown lesson",
        chapterTitle: question?.chapterTitle ?? "Unknown chapter",
        rescue: question ? mistakeRescuePrompt(question, { correct: false, missing: question.keywords ?? [] }) : null,
        repairLine: repairClip?.line ?? "",
        repairUseCase: repairClip?.useCase ?? "",
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
    repairLine: focus.repairLine,
    repairUseCase: focus.repairUseCase,
    nextAction: focus.due
      ? "先做這題的複習，不急著往下一課衝。"
      : "先讀提示，等排程到期後再回來複習。"
  };
}

export function learningReceiptReel(progress, limit = 4) {
  const questionsByKey = new Map(
    [...flattenQuestions(), ...flattenInterviewQuestions()].map((question) => [questionKey(question), question])
  );
  const receipts = Object.entries(progress.answered)
    .map(([key, state]) => {
      const question = questionsByKey.get(key);
      if (!question) return null;
      const stage = questionMasteryStage(question);
      const status = state.lastResult === "correct" ? "proof" : "review";
      const clip = answerEvidenceClip(question, receiptReplayResult(question, state));
      return {
        key,
        status,
        stage: stage.label,
        chapterTitle: question.chapterTitle,
        lessonTitle: question.lessonTitle,
        resultLabel: status === "proof" ? "Proof gained" : "Review seed",
        proof: `${stage.label} practice for ${question.chapterTitle}: ${stage.proof}`,
        evidenceHeadline: clip.headline,
        evidenceLine: clip.line,
        evidenceUseCase: clip.useCase,
        nextUse:
          status === "proof"
            ? "Save this as one tiny job-facing evidence point."
            : "Replay this pattern once it appears in review.",
        lastAnsweredAt: state.lastAnsweredAt ?? 0
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.lastAnsweredAt - a.lastAnsweredAt)
    .slice(0, limit);

  return {
    title: "Learning Receipt Reel",
    headline: receipts.length > 0 ? "Every small answer leaves evidence." : "Answer one question to print your first receipt.",
    receipts,
    emptyAction: "Start with one choice question; the receipt appears automatically."
  };
}

export function dailyPhraseBankCard(progress) {
  const reel = learningReceiptReel(progress, 5);
  const proofCount = reel.receipts.filter((receipt) => receipt.status === "proof").length;
  const repairCount = reel.receipts.filter((receipt) => receipt.status === "review").length;
  const latest = reel.receipts[0] ?? null;
  const hasPhrases = reel.receipts.length > 0;
  const roleFit = jobRoleFitCard(progress);
  const roleSignal = [...roleFit.tracks].sort(
    (a, b) => b.readyCount - a.readyCount || b.practicingCount - a.practicingCount
  )[0];
  const achievement = [...achievements(progress)].reverse().find((badge) => badge.unlocked) ?? null;

  return {
    title: "Today Phrase Bank",
    status: hasPhrases ? "started" : "empty",
    headline: hasPhrases ? `${reel.receipts.length} reusable lines started` : "Your first line is one answer away",
    latestLine: latest?.evidenceLine ?? "Answer one low-friction question to create the first reusable line.",
    latestUse: latest?.evidenceUseCase ?? "No writing assignment needed; the app turns the answer into a short signal.",
    roleSignal: roleSignal?.title ?? "Role signal pending",
    roleLevel: roleSignal?.level ?? "starter",
    roleUse: hasPhrases
      ? `Useful for: ${roleSignal?.title ?? "Agentic Workflow practice"}.`
      : "A role signal appears after the first phrase.",
    achievementTitle: achievement?.title ?? "Achievement proof pending",
    achievementLine: achievement?.proofLine ?? "",
    achievementUse: achievement ? "Achievement proof can become one interview sentence." : "Unlock a badge to add an achievement proof line.",
    proofCount,
    repairCount,
    nextAction: hasPhrases ? "Use the newest line in the one-line coach or keep answering tiny prompts." : "Start with one choice question.",
    rehearsalSteps: [
      {
        id: "read",
        label: "Read",
        text: hasPhrases ? "Read the newest line once." : "Answer once to unlock the first line."
      },
      {
        id: "trim",
        label: "Trim",
        text: hasPhrases ? "Keep only the workflow signal." : "The app will keep the line short."
      },
      {
        id: "say",
        label: "Say",
        text: hasPhrases ? "Say it as one interview sentence." : "No blank-page writing required."
      }
    ],
    promise: "This bank grows from choice questions and tiny short answers, not project work."
  };
}

export function recallComboCard(progress) {
  const answered = Object.values(progress.answered ?? {}).sort((a, b) => (b.lastAnsweredAt ?? 0) - (a.lastAnsweredAt ?? 0));
  const latestCleanRun = answered.findIndex((item) => item.lastResult !== "correct");
  const cleanRun = latestCleanRun === -1 ? answered.length : latestCleanRun;
  const stableSignals = answered.filter((item) => item.correctCount >= 2).length;
  const repairedSignals = answered.filter((item) => item.wrongCount > 0 && item.lastResult === "correct").length;
  const totalSignals = answered.length;
  const mode = totalSignals === 0 ? "empty" : cleanRun >= 3 ? "combo" : repairedSignals > 0 ? "repair" : "building";
  const target = cleanRun >= 3 ? 3 : 3 - cleanRun;

  return {
    title: "Recall Combo",
    mode,
    headline:
      mode === "empty"
        ? "Start the first clean recall"
        : mode === "combo"
          ? `${cleanRun} clean answers in the current run`
          : mode === "repair"
            ? "A weak signal has been repaired"
            : "Build a 3-answer clean run",
    cleanRun,
    stableSignals,
    repairedSignals,
    totalSignals,
    target,
    nextAction:
      mode === "empty"
        ? "Answer one single-choice question."
        : mode === "combo"
          ? "Keep the combo warm with review or one short answer."
          : `Land ${target} more clean answer${target === 1 ? "" : "s"} for a 3-answer combo.`,
    proofLine: "Combos are built from real quiz answers and small recall wins.",
    meters: [
      { id: "clean", label: "Clean run", value: cleanRun },
      { id: "stable", label: "Stable signals", value: stableSignals },
      { id: "repair", label: "Repaired misses", value: repairedSignals }
    ]
  };
}

export function signalPreviewCard(progress, now = Date.now()) {
  const next = nextPracticeRecommendation(progress, now);
  const receipts = learningReceiptReel(progress, 3).receipts;
  const combo = recallComboCard(progress);
  const passport = jobSignalPassport(progress, now);
  const rewardByType = {
    review: "Cleaner recall",
    lesson: "New learning receipt",
    boss: "Boss-proven evidence",
    interview: "Interview-ready wording",
    done: "Fresh proof loop"
  };
  const reuseByType = {
    review: "A repaired weak signal is easier to explain later.",
    lesson: "A new receipt can become one tiny proof line.",
    boss: "A Boss pass turns chapter knowledge into stronger evidence.",
    interview: "A finished drill becomes reusable interview language.",
    done: "A maintenance loop keeps proof from getting stale."
  };

  return {
    title: "Signal Preview",
    mode: next.type,
    headline: `This run can unlock: ${rewardByType[next.type] ?? "Learning signal"}`,
    nextTitle: next.title,
    nextAction: next.cta,
    reason: next.reason,
    reward: rewardByType[next.type] ?? "Learning signal",
    reuse: reuseByType[next.type] ?? "Save the result as a small proof signal.",
    receiptCount: receipts.length,
    cleanRun: combo.cleanRun,
    passportStatus: passport.status,
    steps: [
      { id: "start", label: "Start", text: "Do the smallest recommended practice." },
      { id: "signal", label: "Signal", text: "Let the answer become recall, proof, or wording." },
      { id: "reuse", label: "Reuse", text: "Bring the signal back in review or interview practice." }
    ]
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

export function chapterGateStrip(progress, chapterId) {
  const chapter = chapterMap(progress).find((item) => item.chapterId === chapterId);
  if (!chapter) return null;
  const gate = chapterGateMap(progress).find((item) => item.chapterId === chapterId);
  const interviewQuestions = interviewQuestionsForChapter(chapterId);
  const answered = progress.answered ?? {};
  const answeredInterview = interviewQuestions.filter((question) => answered[questionKey(question)]).length;
  const lessonsDone = chapter.completedLessons === chapter.totalLessons;
  const bossDone = chapter.bossPassed;
  const interviewDone = interviewQuestions.length > 0 && answeredInterview === interviewQuestions.length;
  const pitchReady = gate?.pitchUnlocked && interviewDone;
  const status = !gate?.lessonsUnlocked
    ? "locked"
    : pitchReady
      ? "pitch-ready"
      : bossDone
        ? "interview-open"
        : gate?.bossUnlocked
          ? "boss-ready"
          : "learning";
  const steps = [
    {
      id: "lessons",
      label: "Lessons",
      done: lessonsDone,
      current: chapter.completedLessons,
      target: chapter.totalLessons,
      text: `${chapter.completedLessons}/${chapter.totalLessons} micro-lessons`
    },
    {
      id: "boss",
      label: "Boss",
      done: bossDone,
      current: bossDone ? 1 : 0,
      target: 1,
      text: bossDone ? "Boss proof saved" : gate?.bossUnlocked ? "Boss unlocked" : "Finish lessons first"
    },
    {
      id: "interview",
      label: "Interview",
      done: interviewDone,
      current: answeredInterview,
      target: interviewQuestions.length,
      text: gate?.interviewUnlocked ? `${answeredInterview}/${interviewQuestions.length} prompts` : "Opens after Boss"
    },
    {
      id: "pitch",
      label: "Pitch",
      done: Boolean(pitchReady),
      current: pitchReady ? 1 : 0,
      target: 1,
      text: pitchReady ? "Pitch seed ready" : "Opens after interview"
    }
  ];
  const active = steps.find((step) => !step.done) ?? steps[steps.length - 1];

  return {
    chapterId,
    title: "Chapter Gate",
    status,
    chapterTitle: chapter.title,
    activeId: active.id,
    headline: `${active.label}: ${active.text}`,
    nextAction:
      status === "locked"
        ? "Clear the previous Boss to open this chapter."
        : pitchReady
          ? "Turn the interview prompts into a 60-second pitch."
          : active.id === "lessons"
            ? "Keep clearing tiny choice-first lessons."
            : active.id === "boss"
              ? "Use the Boss as the chapter checkpoint."
              : active.id === "interview"
                ? "Convert Boss proof into interview wording."
                : "Open pitch practice.",
    steps
  };
}

export function bossReadinessCard(progress, chapterId) {
  const chapter = chapterMap(progress).find((item) => item.chapterId === chapterId);
  if (!chapter) return null;
  const gate = chapterGateMap(progress).find((item) => item.chapterId === chapterId);
  const remainingLessons = Math.max(0, chapter.totalLessons - chapter.completedLessons);
  const status = chapter.bossPassed ? "cleared" : gate?.bossUnlocked ? "ready" : gate?.lessonsUnlocked ? "building" : "locked";
  const checks = [
    {
      id: "lessons",
      label: "Finish micro-lessons",
      done: chapter.completedLessons === chapter.totalLessons,
      detail: `${chapter.completedLessons}/${chapter.totalLessons} lessons done`
    },
    {
      id: "boss",
      label: "Beat Boss Quiz",
      done: chapter.bossPassed,
      detail: chapter.bossScore ? `Best score ${chapter.bossScore}` : "8 low-friction checkpoint questions"
    },
    {
      id: "unlock",
      label: "Unlock interview drill",
      done: gate?.interviewUnlocked ?? false,
      detail: "Boss proof opens the job-facing scenario drill"
    }
  ];

  return {
    chapterId,
    title: "Boss readiness",
    status,
    headline:
      status === "cleared"
        ? "Boss proof saved"
        : status === "ready"
          ? "Ready for the chapter Boss"
          : status === "locked"
            ? "Finish the previous Boss first"
            : `${remainingLessons} micro-lesson${remainingLessons === 1 ? "" : "s"} before Boss`,
    body:
      status === "ready"
        ? "Use the Boss as a lightweight checkpoint before interview practice."
        : status === "cleared"
          ? "This chapter can now feed role evidence and interview practice."
          : "Clear the remaining choice-first lessons before the Boss unlocks.",
    completedCount: checks.filter((check) => check.done).length,
    totalCount: checks.length,
    nextAction:
      status === "ready"
        ? "Start Boss Quiz"
        : status === "cleared"
          ? "Practice interview drill"
          : remainingLessons > 0
            ? "Finish next micro-lesson"
            : "Clear prerequisite Boss",
    checks
  };
}

export function bossGateTeaserCard(progress) {
  const chapters = chapterMap(progress);
  const gatesByChapter = new Map(chapterGateMap(progress).map((gate) => [gate.chapterId, gate]));
  const active =
    chapters.find((chapter) => !chapter.bossPassed && gatesByChapter.get(chapter.chapterId)?.lessonsUnlocked) ??
    chapters.find((chapter) => !chapter.bossPassed) ??
    chapters[chapters.length - 1];
  if (!active) return null;

  const gate = gatesByChapter.get(active.chapterId);
  const remainingLessons = Math.max(0, active.totalLessons - active.completedLessons);
  const status = active.bossPassed ? "cleared" : gate?.bossUnlocked ? "ready" : gate?.lessonsUnlocked ? "building" : "locked";
  const steps = [
    {
      id: "lessons",
      label: "Lessons",
      text: `${active.completedLessons}/${active.totalLessons} micro-lessons`,
      done: active.completedLessons === active.totalLessons
    },
    {
      id: "boss",
      label: "Boss",
      text: active.bossPassed ? "Boss proof saved" : "8 checkpoint choices",
      done: active.bossPassed
    },
    {
      id: "interview",
      label: "Unlock",
      text: "Interview drill opens after Boss",
      done: gate?.interviewUnlocked ?? false
    }
  ];

  return {
    title: "Boss Gate Teaser",
    status,
    chapterId: active.chapterId,
    chapterTitle: active.title,
    headline:
      status === "ready"
        ? `${active.title} Boss is unlocked`
        : status === "cleared"
          ? `${active.title} proof is saved`
          : status === "locked"
            ? `${active.title} is still behind a previous Boss`
            : `${remainingLessons} tiny lesson${remainingLessons === 1 ? "" : "s"} until Boss`,
    progress: `${active.completedLessons}/${active.totalLessons}`,
    reward: "Boss proof turns lesson progress into job-facing evidence.",
    unlock: status === "cleared" ? "Interview drill and pitch practice are open." : "Clear Boss to unlock interview practice.",
    nextAction:
      status === "ready"
        ? "Start Boss Quiz"
        : status === "cleared"
          ? "Practice interview drill"
          : status === "locked"
            ? "Clear previous Boss"
            : "Finish next micro-lesson",
    promise: "Still choice-first: the Boss checks judgment, not setup work.",
    steps
  };
}

export function interviewUnlockPreviewCard(progress) {
  const chapters = chapterMap(progress);
  const gatesByChapter = new Map(chapterGateMap(progress).map((gate) => [gate.chapterId, gate]));
  const hasUnansweredInterview = (chapterId) => {
    const questions = interviewQuestionsForChapter(chapterId);
    return questions.some((question) => !progress.answered[questionKey(question)]);
  };
  const hasCompletedInterview = (chapterId) => {
    const questions = interviewQuestionsForChapter(chapterId);
    return questions.length > 0 && questions.every((question) => progress.answered[questionKey(question)]);
  };
  const chapter =
    chapters.find((item) => {
      const gate = gatesByChapter.get(item.chapterId);
      return gate?.interviewUnlocked && hasUnansweredInterview(item.chapterId);
    }) ??
    chapters.find((item) => gatesByChapter.get(item.chapterId)?.interviewUnlocked && hasCompletedInterview(item.chapterId)) ??
    chapters.find((item) => gatesByChapter.get(item.chapterId)?.lessonsUnlocked && !gatesByChapter.get(item.chapterId)?.interviewUnlocked) ??
    chapters[0];
  if (!chapter) return null;

  const gate = gatesByChapter.get(chapter.chapterId);
  const questions = interviewQuestionsForChapter(chapter.chapterId);
  const answeredCount = questions.filter((question) => progress.answered[questionKey(question)]).length;
  const totalCount = questions.length;
  const activeQuestion = questions.find((question) => !progress.answered[questionKey(question)]) ?? questions[0];
  const status = !gate?.interviewUnlocked ? "locked" : answeredCount === totalCount ? "complete" : answeredCount > 0 ? "started" : "ready";
  const prompt = activeQuestion?.prompt.split("\n\n").at(-1) ?? "Explain one workflow judgment in a short answer.";

  return {
    title: "Interview Unlock Preview",
    status,
    chapterId: chapter.chapterId,
    chapterTitle: chapter.title,
    scenarioTitle: activeQuestion?.lessonTitle ?? "Interview drill",
    headline:
      status === "locked"
        ? "Interview drill opens after Boss proof"
        : status === "complete"
          ? "Interview drill is complete"
          : status === "started"
            ? `${answeredCount}/${totalCount} interview prompts answered`
            : `${chapter.title} interview drill is unlocked`,
    prompt,
    answeredCount,
    totalCount,
    unlock:
      status === "locked"
        ? "Beat the chapter Boss to open job-facing scenario practice."
        : "Use the scenario to turn workflow judgment into spoken interview language.",
    nextAction:
      status === "locked"
        ? gate?.bossUnlocked
          ? "Start Boss Quiz"
          : "Reach Boss proof first"
        : status === "complete"
          ? "Practice 60-second pitch"
          : "Practice interview prompt",
    promise: "Still low-friction: one scenario, one choice or tiny answer, one reusable line.",
    steps: [
      {
        id: "proof",
        label: "Proof",
        text: chapter.bossPassed ? "Boss proof saved" : "Boss proof pending",
        done: chapter.bossPassed
      },
      {
        id: "scenario",
        label: "Scenario",
        text: `${answeredCount}/${totalCount} prompts`,
        done: totalCount > 0 && answeredCount === totalCount
      },
      {
        id: "line",
        label: "Line",
        text: status === "complete" ? "Pitch line ready" : "Reusable line next",
        done: status === "complete"
      }
    ]
  };
}

export function pitchUnlockPreviewCard(progress) {
  const proofs = abilityProofCards(progress);
  const readyProof =
    proofs.find((proof) => proof.status === "interview_ready") ??
    proofs.find((proof) => proof.status === "proven") ??
    proofs.find((proof) => proof.status === "practicing") ??
    proofs[0];
  if (!readyProof) return null;

  const pitch = pitchPracticeCard(progress, readyProof.chapterId);
  const interviewPreview = interviewUnlockPreviewCard(progress);
  const status =
    readyProof.status === "interview_ready"
      ? "ready"
      : readyProof.status === "proven"
        ? "drafting"
        : "locked";

  return {
    title: "Pitch Unlock Preview",
    status,
    chapterId: readyProof.chapterId,
    chapterTitle: readyProof.title,
    headline:
      status === "ready"
        ? "60-second pitch is ready to rehearse"
        : status === "drafting"
          ? "Finish interview prompts to unlock the pitch"
          : "Build proof before pitch practice",
    prompt: pitch?.prompt ?? "Use three short lines to explain one agentic workflow judgment.",
    sampleAnswer: pitch?.sampleAnswer ?? readyProof.abilityStatement,
    nextAction:
      status === "ready"
        ? "Open pitch practice"
        : status === "drafting"
          ? "Practice interview prompt"
          : interviewPreview?.nextAction ?? "Build first proof",
    promise: "No blank-page speech: reuse proof, scenario, and one tradeoff line.",
    lines: [
      {
        id: "problem",
        label: "Problem",
        text: pitch?.outline?.[0] ?? "What workflow problem this ability solves."
      },
      {
        id: "role",
        label: "Role",
        text: pitch?.outline?.[1] ?? "What role it plays in agentic workflow."
      },
      {
        id: "tradeoff",
        label: "Tradeoff",
        text: pitch?.outline?.[2] ?? "What risk or boundary you would mention."
      }
    ],
    checks:
      pitch?.checks.map((check) => ({
        id: check.id,
        label: check.label,
        done: status === "ready"
      })) ?? []
  };
}

export function jobPacketPreviewCard(progress, now = Date.now()) {
  const passport = jobSignalPassport(progress, now);
  const brief = jobEvidenceBrief(progress, now);
  const pitch = pitchUnlockPreviewCard(progress);
  const checklist = landingReadinessChecklist(progress, now);
  const roleStamp = passport.stamps.find((stamp) => stamp.id === "role");
  const receiptStamp = passport.stamps.find((stamp) => stamp.id === "receipt");
  const roleReady = passport.status !== "starter passport";
  const evidenceReady = (brief?.readyCount ?? 0) > 0;
  const receiptReady = Boolean(receiptStamp && !receiptStamp.value.includes("pending"));
  const pitchReady = pitch?.status === "ready";
  const items = [
    {
      id: "role",
      label: "Role signal",
      done: roleReady,
      text: roleReady ? (roleStamp?.value ?? "Role signal started") : "Pick up the first role signal."
    },
    {
      id: "evidence",
      label: "Evidence line",
      done: evidenceReady,
      text: evidenceReady
        ? brief.interviewLine
        : "Clear a Boss gate to turn practice into evidence."
    },
    {
      id: "receipt",
      label: "Latest receipt",
      done: receiptReady,
      text: receiptReady ? receiptStamp.detail : "Answer one choice to create a visible receipt."
    },
    {
      id: "pitch",
      label: "Pitch seed",
      done: pitchReady,
      text: pitchReady
        ? pitch.sampleAnswer
        : "Finish interview drills to unlock a 60-second answer."
    }
  ];
  const readyCount = items.filter((item) => item.done).length;

  return {
    title: "Job Packet Preview",
    status: readyCount === items.length ? "ready" : readyCount > 0 ? "building" : "starter",
    headline:
      readyCount === items.length
        ? "A small job packet is ready"
        : `${readyCount}/${items.length} packet pieces ready`,
    summary: "Role signal, evidence line, receipt, and pitch seed stay visible as the learning path moves.",
    nextAction: pitchReady ? "Open pitch practice" : checklist.nextAction,
    promise: "No blank-page assignment: each piece comes from choices, review, Boss, or interview drills.",
    readyCount,
    totalCount: items.length,
    action: {
      kind: pitchReady ? "pitch" : "practice",
      chapterId: pitch?.chapterId ?? null
    },
    items
  };
}

export function jobPacketShowcaseCard(progress, now = Date.now()) {
  const packet = jobPacketPreviewCard(progress, now);
  const passport = jobSignalPassport(progress, now);
  const receipts = learningReceiptReel(progress, 1).receipts;
  const roleStamp = passport.stamps.find((stamp) => stamp.id === "role");
  const evidenceItem = packet.items.find((item) => item.id === "evidence");
  const latestReceipt = receipts[0] ?? null;
  const ready = packet.status === "ready";

  return {
    title: "Packet Showcase",
    status: packet.status,
    headline: ready ? "Three lines are ready to say out loud" : `${packet.readyCount}/${packet.totalCount} proof lines started`,
    summary: "The app turns quiz receipts, role signals, and Boss evidence into plain job-facing language.",
    lines: [
      {
        id: "identity",
        label: "Identity",
        text: packet.status !== "starter" && roleStamp && !roleStamp.value.includes("pending")
          ? `I am practicing toward ${roleStamp.value}.`
          : "I am learning agentic workflow through tiny judgment drills."
      },
      {
        id: "evidence",
        label: "Evidence",
        text: evidenceItem?.done
          ? evidenceItem.text
          : "I am collecting Boss-level evidence one chapter at a time."
      },
      {
        id: "latest",
        label: "Latest receipt",
        text: latestReceipt?.evidenceLine ?? "Answer one low-friction prompt to create the first reusable line."
      }
    ],
    rehearsal: ready ? "Read the three lines once, then open pitch practice." : packet.nextAction,
    promise: "No separate artifact work required here; the showcase grows from practice signals."
  };
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

export function beginnerSkillMapCard(progress) {
  const pieces = learningPuzzleBoard(progress);
  const active = pieces.find((piece) => !["complete", "locked"].includes(piece.status)) ?? pieces.find((piece) => piece.status === "locked") ?? pieces[0];
  const completedCount = pieces.filter((piece) => piece.status === "complete").length;
  const unlockedCount = pieces.filter((piece) => piece.status !== "locked").length;
  const visibleNodes = pieces.slice(0, Math.min(5, Math.max(3, unlockedCount + 1))).map((piece) => ({
    id: piece.chapterId,
    order: piece.order,
    title: piece.chapterTitle,
    skill: piece.title,
    status: piece.status,
    percent: piece.percent,
    label:
      piece.status === "locked"
        ? "Locked"
        : piece.status === "complete"
          ? "Mastered"
          : piece.status === "proven"
            ? "Boss proof"
            : piece.status === "boss_ready"
              ? "Boss ready"
              : piece.status === "learning"
                ? "Learning"
                : "Start"
  }));
  const activeStages = active?.stages ?? [];
  const learnStage = activeStages[0];
  const bossStage = activeStages[1];
  const interviewStage = activeStages[2];
  const activePath = [
    {
      id: "learn",
      label: "Learn key",
      text: learnStage?.progress ?? "0/3 micro-lessons",
      status: active?.status === "locked" ? "locked" : learnStage?.done ? "done" : "current"
    },
    {
      id: "boss",
      label: "Boss key",
      text: bossStage?.progress ?? "not yet",
      status: bossStage?.done ? "done" : learnStage?.done ? "current" : "locked"
    },
    {
      id: "interview",
      label: "Interview key",
      text: interviewStage?.progress ?? "0/3 interview drill",
      status: interviewStage?.done ? "done" : bossStage?.done ? "current" : "locked"
    }
  ];

  return {
    title: "Beginner Skill Map",
    headline: active ? `Current node: ${active.chapterTitle}` : "Start the first skill node.",
    activeId: active?.chapterId ?? null,
    activeSkill: active?.title ?? "Agentic workflow basics",
    activeNext: active?.nextAction ?? "Start with one choice-first micro-lesson.",
    completedCount,
    totalCount: pieces.length,
    unlockedCount,
    promise: "The map moves through choices, Boss checks, and interview drills; no project gate here.",
    activePath,
    nodes: visibleNodes
  };
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

export function landingReadinessChecklist(progress, now = Date.now()) {
  const proofs = abilityProofCards(progress);
  const roleFit = jobRoleFitCard(progress);
  const next = nextPracticeRecommendation(progress, now);
  const provenCount = proofs.filter((proof) => ["proven", "interview_ready"].includes(proof.status)).length;
  const interviewReadyCount = proofs.filter((proof) => proof.status === "interview_ready").length;
  const rolePathsWithEvidence = roleFit.tracks.filter((track) => track.readyCount > 0).length;
  const items = [
    {
      id: "start",
      title: "Start without setup",
      done: progress.completedLessons.length > 0,
      current: Math.min(progress.completedLessons.length, 1),
      target: 1,
      proof: "Complete one micro-lesson with choice-first practice."
    },
    {
      id: "boss-proof",
      title: "Boss-proven foundations",
      done: provenCount >= 3,
      current: Math.min(provenCount, 3),
      target: 3,
      proof: "Turn three chapters into Boss-proven evidence."
    },
    {
      id: "role-paths",
      title: "Role path evidence",
      done: rolePathsWithEvidence >= 2,
      current: Math.min(rolePathsWithEvidence, 2),
      target: 2,
      proof: "Show progress across two job-facing paths."
    },
    {
      id: "interview-lines",
      title: "Interview-ready explanations",
      done: interviewReadyCount >= 2,
      current: Math.min(interviewReadyCount, 2),
      target: 2,
      proof: "Finish interview drills for two chapters."
    }
  ];
  const completedCount = items.filter((item) => item.done).length;
  const active = items.find((item) => !item.done) ?? items[items.length - 1];

  return {
    headline: completedCount === items.length ? "Landing-ready practice loop" : "Landing Checklist",
    percent: Math.round((completedCount / items.length) * 100),
    completedCount,
    totalCount: items.length,
    activeTitle: active.title,
    nextAction: next.type === "done" ? "Rehearse a 60-second role proof." : next.cta,
    items
  };
}

export function landingGapRadar(progress, now = Date.now()) {
  const checklist = landingReadinessChecklist(progress, now);
  const active = checklist.items.find((item) => !item.done) ?? checklist.items[checklist.items.length - 1];
  const next = nextPracticeRecommendation(progress, now);
  const completed = checklist.completedCount === checklist.totalCount;

  return {
    title: "Landing Gap Radar",
    mode: completed ? "ready-loop" : "gap-open",
    headline: completed ? "All current landing gates are warm." : `Closest gap: ${active.title}`,
    percent: checklist.percent,
    activeGate: active.title,
    progress: `${active.current}/${active.target}`,
    why: active.proof,
    microMove: completed ? "Rehearse one role proof out loud." : next.cta,
    after: completed
      ? "Keep receipts fresh with review or pitch practice."
      : `Closing this gap moves the passport toward ${active.title}.`,
    steps: [
      {
        id: "spot",
        label: "Spot",
        text: "Focus on one gate, not the whole map."
      },
      {
        id: "move",
        label: "Move",
        text: "Take the smallest recommended practice step."
      },
      {
        id: "save",
        label: "Save",
        text: "Let the result become proof, review, or an interview line."
      }
    ]
  };
}

export function sevenDayLandingPath(progress, now = Date.now()) {
  const next = nextPracticeRecommendation(progress, now);
  const answers = Object.values(progress.answered ?? {});
  const proofCards = abilityProofCards(progress);
  const roleFit = jobRoleFitCard(progress);
  const checklist = landingReadinessChecklist(progress, now);
  const interviewAnswered = flattenInterviewQuestions().some((question) => progress.answered[questionKey(question)]);
  const passedBosses = (progress.bossResults ?? []).filter((item) => item.passed).length;
  const rolePathEvidence = roleFit.tracks.filter((track) => track.readyCount > 0).length;
  const reviewCreated = (progress.reviewQueue ?? []).length > 0 || answers.some((item) => item.wrongCount > 0);
  const proofStarted = proofCards.some((card) => card.status !== "new");

  const days = [
    {
      id: "first-answer",
      day: 1,
      title: "First answer",
      done: answers.length > 0,
      action: "Answer one single-choice question.",
      signal: "Start a recall trail."
    },
    {
      id: "first-lesson",
      day: 2,
      title: "First lesson receipt",
      done: progress.completedLessons.length > 0,
      action: "Finish one micro-lesson.",
      signal: "Print the first learning receipt."
    },
    {
      id: "review-loop",
      day: 3,
      title: "Review loop",
      done: reviewCreated,
      action: "Let one miss or correct answer enter spaced review.",
      signal: "Make forgetting visible."
    },
    {
      id: "boss-proof",
      day: 4,
      title: "Boss proof",
      done: passedBosses > 0,
      action: "Clear one chapter Boss Quiz.",
      signal: "Turn lessons into proof."
    },
    {
      id: "role-evidence",
      day: 5,
      title: "Role evidence",
      done: rolePathEvidence > 0,
      action: "Connect one proven chapter to a role path.",
      signal: "Show what role the skill supports."
    },
    {
      id: "interview-wording",
      day: 6,
      title: "Interview wording",
      done: interviewAnswered,
      action: "Answer one interview drill.",
      signal: "Turn proof into spoken wording."
    },
    {
      id: "landing-line",
      day: 7,
      title: "Landing line",
      done: checklist.completedCount === checklist.totalCount,
      action: "Read the one-line coach out loud.",
      signal: "Keep one job-facing line ready."
    }
  ];
  const completedCount = days.filter((day) => day.done).length;
  const active = days.find((day) => !day.done) ?? days[days.length - 1];

  return {
    title: "7-Day Landing Path",
    headline:
      completedCount === days.length
        ? "All seven landing steps are warm."
        : `Day ${active.day}: ${active.title}`,
    completedCount,
    totalCount: days.length,
    percent: Math.round((completedCount / days.length) * 100),
    activeAction: active.done ? next.cta : active.action,
    activeSignal: active.signal,
    nextRecommendation: next.cta,
    proofStarted,
    days
  };
}

export function zeroToLandingQuestCard(progress, now = Date.now()) {
  const path = sevenDayLandingPath(progress, now);
  const checklist = landingReadinessChecklist(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const dayDone = (id) => path.days.find((day) => day.id === id)?.done ?? false;
  const gateDone = (id) => checklist.items.find((item) => item.id === id)?.done ?? false;
  const milestones = [
    {
      id: "first-choice",
      label: "First choice",
      done: dayDone("first-answer"),
      proof: "One answer starts the recall trail.",
      line: "I can start an agentic workflow learning trail with one defended choice."
    },
    {
      id: "first-receipt",
      label: "First receipt",
      done: dayDone("first-lesson"),
      proof: "A micro-lesson becomes visible progress.",
      line: "I can turn a tiny lesson into visible workflow evidence."
    },
    {
      id: "boss-proof",
      label: "Boss proof",
      done: dayDone("boss-proof"),
      proof: "A chapter becomes defended evidence.",
      line: "I can defend one chapter-level agentic workflow judgment."
    },
    {
      id: "role-signal",
      label: "Role signal",
      done: gateDone("role-paths"),
      proof: "Proof connects to more than one role path.",
      line: "I can connect my proof to more than one job-facing role path."
    },
    {
      id: "interview-line",
      label: "Interview line",
      done: gateDone("interview-lines"),
      proof: "Short explanations become interview-ready.",
      line: "I can turn short explanations into interview-ready wording."
    }
  ];
  const completedCount = milestones.filter((milestone) => milestone.done).length;
  const active = milestones.find((milestone) => !milestone.done) ?? milestones[milestones.length - 1];

  return {
    title: "Zero-to-Landing Quest",
    headline:
      completedCount === milestones.length
        ? "The beginner landing route is warm."
        : `Next milestone: ${active.label}`,
    completedCount,
    totalCount: milestones.length,
    percent: Math.round((completedCount / milestones.length) * 100),
    activeId: active.id,
    activeProof: active.proof,
    activeLine: active.line,
    activeUse: "Say this line after the next tiny practice step.",
    nextAction: next.type === "done" ? "Rehearse one interview line." : next.cta,
    promise: "The whole route starts with choices and keeps writing tiny.",
    milestones: milestones.map((milestone) => ({
      ...milestone,
      status: milestone.done ? "done" : milestone.id === active.id ? "active" : "locked"
    }))
  };
}

export function landingMissionStripCard(progress, now = Date.now()) {
  const quest = zeroToLandingQuestCard(progress, now);
  const checklist = landingReadinessChecklist(progress, now);
  const packet = jobPacketPreviewCard(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const active = quest.milestones.find((milestone) => milestone.status === "active") ?? quest.milestones.at(-1);
  const completed = quest.completedCount === quest.totalCount;

  return {
    title: "Landing Mission",
    status: completed ? "ready" : "active",
    headline: completed ? "Keep the job packet warm" : `From zero to job signal: ${active.label}`,
    percent: quest.percent,
    activeId: active.id,
    activeLabel: active.label,
    activeProof: active.proof,
    activeLine: active.line,
    nextAction: next.type === "done" ? quest.nextAction : next.cta,
    nextType: next.type,
    packetProgress: `${packet.readyCount}/${packet.totalCount} packet pieces`,
    checklistProgress: `${checklist.completedCount}/${checklist.totalCount} landing gates`,
    promise: "One tiny answer can move the route; no project task is required in this phase.",
    route: quest.milestones.map((milestone, index) => ({
      id: milestone.id,
      number: index + 1,
      label: milestone.label,
      status: milestone.status,
      proof: milestone.proof
    }))
  };
}

export function roleSamplerCard(progress) {
  const roleFit = jobRoleFitCard(progress);
  const chaptersById = new Map(course.chapters.map((chapter) => [chapter.id, chapter]));
  const answeredChoiceChapterIds = new Set(
    flattenQuestions()
      .filter((question) => ["single", "multi"].includes(question.type) && progress.answered[questionKey(question)])
      .map((question) => question.chapterId)
  );
  const samplesByRole = {
    "ai-app-builder": {
      choiceMove: "Pick the option that makes the AI product useful, bounded, and testable.",
      samplePrompt: "Which feature changes the user's workflow instead of only sounding impressive?"
    },
    "agent-workflow-builder": {
      choiceMove: "Pick the option that keeps agent state, tools, and feedback connected.",
      samplePrompt: "Which step should the agent remember before choosing the next tool?"
    },
    "agent-reliability-builder": {
      choiceMove: "Pick the option that catches risk before the agent acts with confidence.",
      samplePrompt: "Which check would stop a bad answer from reaching the user?"
    }
  };
  const tracks = roleFit.tracks.map((track) => {
    const sample = samplesByRole[track.id] ?? {
      choiceMove: "Pick the option that changes a real workflow decision.",
      samplePrompt: "Which choice creates the clearest agentic workflow signal?"
    };
    const sampled = track.chapterIds.some((chapterId) => answeredChoiceChapterIds.has(chapterId)) || track.level !== "starter";
    const nextSampleChapterId = track.chapterIds.find((chapterId) => !answeredChoiceChapterIds.has(chapterId)) ?? track.chapterIds[0];
    const nextSampleChapter = chaptersById.get(nextSampleChapterId);
    return {
      id: track.id,
      title: track.title,
      level: track.level,
      sampled,
      statusLabel: sampled ? "sampled" : "try next",
      nextGap: track.nextGap,
      sampleChapterTitle: nextSampleChapter?.title ?? track.nextGap,
      sampleRoute: `Next sample via ${nextSampleChapter?.title ?? track.nextGap}.`,
      choiceMove: sample.choiceMove,
      samplePrompt: sample.samplePrompt
    };
  });
  const sampledCount = tracks.filter((track) => track.sampled).length;
  const active = tracks.find((track) => !track.sampled) ?? tracks.find((track) => track.level !== "interview-ready") ?? tracks[0];

  return {
    title: "Role Sampler",
    headline: sampledCount > 0 ? `${sampledCount}/${tracks.length} role paths sampled.` : "Try a role path with one choice.",
    summary: "No need to choose a career lane yet. Sample each path through quick judgment prompts first.",
    sampledCount,
    totalCount: tracks.length,
    progressLabel: `${sampledCount}/${tracks.length} sampled`,
    activeRole: active?.title ?? "Agentic Workflow Builder",
    activeMove: active?.choiceMove ?? "Pick one workflow signal.",
    activeRoute: active?.sampleRoute ?? "Next sample via the smallest visible choice prompt.",
    nextAction:
      sampledCount === tracks.length
        ? "Use one tiny short answer to compare which role signal felt natural."
        : "Answer one single-choice question, then compare which role signal felt natural.",
    promise: "Sampling stays choice-first: no project task, no setup, no long writing.",
    tracks
  };
}

export function roleQuestBoardCard(progress, now = Date.now()) {
  const roleFit = jobRoleFitCard(progress);
  const sampler = roleSamplerCard(progress);
  const passport = jobSignalPassport(progress, now);
  const sampleById = new Map(sampler.tracks.map((track) => [track.id, track]));
  const activeSample = sampler.tracks.find((track) => !track.sampled) ?? sampler.tracks[0];
  const activeTrack = roleFit.tracks.find((track) => track.id === activeSample?.id) ?? roleFit.tracks[0];
  const totalReady = roleFit.tracks.reduce((sum, track) => sum + track.readyCount, 0);
  const totalPracticing = roleFit.tracks.reduce((sum, track) => sum + track.practicingCount, 0);

  return {
    title: "Role Quest Board",
    headline: totalReady > 0 ? `Strongest route: ${passport.stamps[0].value}` : `Try ${activeTrack.title} without choosing a lane`,
    summary: "Sample role paths as tiny quests, then let Boss proof and interview drills reveal the strongest fit.",
    activeRole: activeTrack.title,
    activeMove: sampleById.get(activeTrack.id)?.choiceMove ?? "Pick one workflow signal.",
    action: activeTrack.recommendedPractice,
    actionLabel: activeTrack.recommendedPractice.cta,
    progressLabel: `${totalReady} ready / ${totalPracticing} practicing / ${sampler.sampledCount} sampled`,
    promise: "Each role quest starts from choices and visible proof, not a separate project task.",
    tracks: roleFit.tracks.map((track) => {
      const sample = sampleById.get(track.id);
      const status =
        track.level === "interview-ready"
          ? "complete"
          : track.readyCount > 0
            ? "boss-proven"
            : track.practicingCount > 0 || sample?.sampled
              ? "started"
              : track.id === activeTrack.id
                ? "active"
                : "locked";
      return {
        id: track.id,
        title: track.title,
        status,
        level: track.level,
        readyCount: track.readyCount,
        practicingCount: track.practicingCount,
        total: track.total,
        nextGap: track.nextGap,
        nextAction: track.recommendedPractice.cta,
        sampled: Boolean(sample?.sampled),
        sampleRoute: sample?.sampleRoute ?? "Next sample via a choice prompt.",
        steps: [
          {
            id: "sample",
            label: "Sample",
            done: Boolean(sample?.sampled),
            text: sample?.sampleRoute ?? "Answer one choice prompt."
          },
          {
            id: "boss",
            label: "Boss",
            done: track.readyCount > 0,
            text: track.readyCount > 0 ? `${track.readyCount}/${track.total} proof pieces` : `Make ${track.nextGap} Boss-proven.`
          },
          {
            id: "interview",
            label: "Interview",
            done: track.level === "interview-ready",
            text: track.level === "interview-ready" ? "Ready to say out loud." : "Turn proof into spoken wording."
          }
        ]
      };
    })
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
      proofLine: roleFitProofLine(track, readyPieces, practicingPieces),
      skillChips: roleFitSkillChips(pieces),
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

export function jobSignalPassport(progress, now = Date.now()) {
  const roleFit = jobRoleFitCard(progress);
  const evidence = jobEvidenceBrief(progress, now);
  const receipt = learningReceiptReel(progress, 1).receipts[0] ?? null;
  const strongestTrack = [...roleFit.tracks].sort(
    (a, b) => b.readyCount - a.readyCount || b.practicingCount - a.practicingCount
  )[0];
  const status =
    strongestTrack.readyCount > 0
      ? "evidence started"
      : strongestTrack.practicingCount > 0
        ? "practice started"
        : "starter passport";

  return {
    title: "Job Signal Passport",
    status,
    summary:
      strongestTrack.readyCount > 0
        ? `Current strongest signal: ${strongestTrack.title}`
        : "Start with one receipt, then build a role signal.",
    stamps: [
      {
        id: "role",
        label: "Role Signal",
        value: strongestTrack.title,
        detail: strongestTrack.proofLine
      },
      {
        id: "evidence",
        label: "Evidence Line",
        value: evidence.strongestTitle,
        detail: evidence.interviewLine
      },
      {
        id: "receipt",
        label: "Latest Receipt",
        value: receipt ? `${receipt.resultLabel}: ${receipt.stage}` : "First receipt pending",
        detail: receipt?.nextUse ?? "Answer one choice question to create the first visible proof point."
      }
    ]
  };
}

export function skillProfileCard(progress, now = Date.now()) {
  const snapshot = careerReadinessSnapshot(progress, now);
  const passport = jobSignalPassport(progress, now);
  const checklist = landingReadinessChecklist(progress, now);
  const proofs = abilityProofCards(progress);
  const roleFit = jobRoleFitCard(progress);
  const strongestTrack = [...roleFit.tracks].sort(
    (a, b) => b.readyCount - a.readyCount || b.practicingCount - a.practicingCount
  )[0];
  const proofHighlights = proofs
    .filter((proof) => proof.status !== "new")
    .slice(0, 3)
    .map((proof) => ({
      id: proof.chapterId,
      title: proof.title,
      status: proof.status,
      text: proof.abilityStatement
    }));
  const activeGate = checklist.items.find((item) => !item.done) ?? checklist.items[checklist.items.length - 1];

  return {
    title: "Agentic Workflow Skill Profile",
    readiness: snapshot.level,
    headline:
      snapshot.provenCount > 0
        ? `${snapshot.provenCount}/${snapshot.total} proof chapters ready`
        : "First proof chapter is still forming",
    summaryLine:
      snapshot.provenCount > 0
        ? `I can explain ${passport.stamps.find((stamp) => stamp.id === "evidence")?.value ?? "agentic workflow"} with visible practice evidence.`
        : "I am building agentic workflow judgment through low-friction questions and review.",
    roleSignal: strongestTrack?.title ?? "Role signal pending",
    nextProof: activeGate
      ? {
          title: activeGate.title,
          action: checklist.nextAction,
          proof: activeGate.proof
        }
      : {
          title: "Keep proof warm",
          action: checklist.nextAction,
          proof: "Rehearse one saved evidence line."
        },
    metrics: [
      {
        id: "proof",
        label: "Proof chapters",
        value: `${snapshot.provenCount}/${snapshot.total}`
      },
      {
        id: "interview",
        label: "Interview-ready",
        value: `${snapshot.interviewReadyCount}/${snapshot.total}`
      },
      {
        id: "landing",
        label: "Landing gates",
        value: `${checklist.completedCount}/${checklist.totalCount}`
      }
    ],
    proofHighlights:
      proofHighlights.length > 0
        ? proofHighlights
        : [
            {
              id: "starter",
              title: "First proof pending",
              status: "starter",
              text: "Answer one choice question to start the first visible proof trail."
            }
          ],
    lines: [
      {
        id: "skill",
        label: "Skill",
        text: `I can discuss agentic workflow at the ${snapshot.level.toLowerCase()} level.`
      },
      {
        id: "evidence",
        label: "Evidence",
        text: passport.stamps.find((stamp) => stamp.id === "receipt")?.detail ?? "First receipt pending."
      },
      {
        id: "next",
        label: "Next proof",
        text: `${activeGate?.title ?? "Keep proof warm"}: ${checklist.nextAction}`
      }
    ]
  };
}

function roleFitSkillChips(pieces) {
  return pieces.map((piece) => {
    const state =
      piece.status === "interview_ready"
        ? "interview-ready"
        : piece.status === "proven"
          ? "boss-proven"
          : piece.status === "practicing"
            ? "practicing"
            : "next";
    return {
      chapterId: piece.chapterId,
      label: piece.title,
      state,
      detail:
        state === "interview-ready"
          ? "ready to explain"
          : state === "boss-proven"
            ? "Boss proof"
            : state === "practicing"
              ? "micro-lessons started"
              : "not started"
    };
  });
}

function roleFitProofLine(track, readyPieces, practicingPieces) {
  if (readyPieces.length > 0) {
    return `I can explain ${readyPieces.map((piece) => piece.title).slice(0, 2).join(" and ")} as evidence for ${track.title}.`;
  }
  if (practicingPieces.length > 0) {
    return `I am building ${track.title} evidence through ${practicingPieces[0].title}.`;
  }
  return `I can start ${track.title} with low-friction drills before any project work.`;
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
    storySeeds: [
      {
        id: "situation",
        label: "Situation",
        text: `I studied ${strongest.title} as a concrete agentic workflow problem.`
      },
      {
        id: "judgment",
        label: "Judgment",
        text: "I practiced judging the workflow role instead of only naming the concept."
      },
      {
        id: "signal",
        label: "Signal",
        text:
          strongest.status === "interview_ready"
            ? "I can now turn the proof into a short interview answer."
            : "My next step is to turn this proof into a short interview answer."
      }
    ],
    readyCount,
    practiceCount,
    total: proofs.length,
    nextGap: next.type === "done" ? "All current evidence blocks are complete." : next.title,
    nextAction: next.cta
  };
}

export function oneLineCoachCard(progress, now = Date.now()) {
  const brief = jobEvidenceBrief(progress, now);
  const proofs = abilityProofCards(progress);
  const next = nextPracticeRecommendation(progress, now);
  const rank = { interview_ready: 4, proven: 3, practicing: 2, new: 1 };
  const strongest = [...proofs].sort((a, b) => rank[b.status] - rank[a.status])[0] ?? null;
  if (!brief || !strongest) return null;
  const achievement = achievements(progress).find((badge) => badge.unlocked) ?? null;

  const readinessLabel =
    strongest.status === "interview_ready"
      ? "interview-ready"
      : strongest.status === "proven"
        ? "Boss-proven"
        : strongest.status === "practicing"
          ? "practicing"
          : "starting";

  return {
    title: "One-Line Coach",
    headline: `Say one useful line about ${strongest.title}`,
    readinessLabel,
    nextAction: next.cta,
    cue: "Use this before a 60-second pitch: one sentence is enough.",
    lines: [
      {
        id: "skill",
        label: "Skill",
        text: `I can explain ${strongest.title} as a ${readinessLabel} part of agentic workflow.`
      },
      {
        id: "judgment",
        label: "Judgment",
        text: "I practiced deciding what the agent should do, what tool or memory it needs, and what risk to check."
      },
      {
        id: "next",
        label: "Next",
        text: `My next small step is: ${next.cta}.`
      }
    ].concat(
      achievement
        ? [
            {
              id: "achievement",
              label: achievement.title,
              text: achievement.proofLine
            }
          ]
        : []
    ),
    proofLink: brief.proof
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
    activeReason: active?.reason ?? "Every tiny step should create a visible signal.",
    nextStep: completedCount === missions.length ? "今日任務已完成，接著可以複習錯題或練 pitch。" : `${active.title} 還差 ${remaining} 步。`
  };
}

export function dailyRunMeterCard(progress, now = Date.now()) {
  const minimum = dailyMinimumCard(progress, now);
  const ticket = dailySkillTicketCard(progress, now);
  const landing = dailyLandingStepCard(progress, now);
  const steps = [
    {
      id: "start",
      label: "Start",
      done: minimum.checks.find((check) => check.id === "answer-one")?.done ?? false,
      text: "Answer one low-friction question"
    },
    {
      id: "stamp",
      label: "Stamp",
      done: ticket.completedCount > 0,
      text: ticket.completedCount > 0 ? `${ticket.completedCount}/${ticket.totalCount} skill stamps` : "Earn the first skill stamp"
    },
    {
      id: "landing",
      label: "Landing",
      done: landing.status === "done",
      text: landing.status === "done" ? "Today is linked to job evidence" : landing.minimumAction
    }
  ];
  const doneCount = steps.filter((step) => step.done).length;
  const active = steps.find((step) => !step.done) ?? steps[steps.length - 1];

  return {
    title: "Daily Run Meter",
    status: doneCount === steps.length ? "done" : doneCount > 0 ? "live" : "open",
    headline: doneCount === steps.length ? "Tiny daily run banked" : "Make today count with one tiny run",
    percent: Math.round((doneCount / steps.length) * 100),
    doneCount,
    totalCount: steps.length,
    activeId: active.id,
    activeLabel: active.label,
    nextAction: doneCount === steps.length ? "Stop here or keep the chain warm." : active.text,
    promise: "One answer can start the daily loop; extra cards are optional.",
    steps
  };
}

export function dailyMinimumCard(progress, now = Date.now()) {
  const activity = getDailyActivity(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const done = activity.answers >= 1;
  const checks = [
    {
      id: "answer-one",
      label: "Answer one question",
      done,
      detail: done ? "You created one real recall signal today." : "One single-choice question is enough to start."
    },
    {
      id: "save-signal",
      label: "Save one signal",
      done,
      detail: "Correct answers schedule future recall; misses return sooner as review."
    },
    {
      id: "know-next",
      label: "Know the next move",
      done: true,
      detail: next.title
    }
  ];

  return {
    title: "3-minute minimum",
    status: done ? "done" : "open",
    headline: done ? "Minimum practice banked" : "One question is enough today",
    body: done
      ? "You can stop here without losing the streak feeling, or continue with the next tiny step."
      : "Start with one low-friction question. No project work, no setup, no blank page.",
    doneCount: checks.filter((check) => check.done).length,
    totalCount: checks.length,
    nextAction: done ? next.cta : "Answer one question",
    checks
  };
}

export function dailySkillTicketCard(progress, now = Date.now()) {
  const dayStart = startOfLocalDay(now);
  const dayEnd = addLocalDays(dayStart, 1);
  const questionsByKey = new Map(flattenQuestions().map((question) => [questionKey(question), question]));
  const todayAnswered = Object.entries(progress.answered)
    .map(([key, state]) => ({ question: questionsByKey.get(key), state }))
    .filter(({ question, state }) => question && state.lastAnsweredAt >= dayStart && state.lastAnsweredAt < dayEnd);
  const countType = (type) => todayAnswered.filter(({ question }) => question.type === type).length;
  const lanes = [
    {
      id: "single",
      label: "Recognize",
      format: "Single choice",
      count: countType("single"),
      target: 1,
      reward: "Decision signal"
    },
    {
      id: "multi",
      label: "Connect",
      format: "Multi choice",
      count: countType("multi"),
      target: 1,
      reward: "Workflow link"
    },
    {
      id: "short",
      label: "Explain",
      format: "Tiny short answer",
      count: countType("short"),
      target: 1,
      reward: "Interview phrase"
    }
  ].map((lane) => ({
    ...lane,
    done: lane.count >= lane.target
  }));
  const completedCount = lanes.filter((lane) => lane.done).length;
  const active = lanes.find((lane) => !lane.done) ?? lanes[lanes.length - 1];

  return {
    title: "Daily Skill Ticket",
    status: completedCount === lanes.length ? "done" : "open",
    headline: completedCount === lanes.length ? "Today's tiny skill loop is stamped." : `Next stamp: ${active.label}`,
    activeId: active.id,
    activeFormat: active.format,
    activeReward: active.reward,
    completedCount,
    totalCount: lanes.length,
    nextAction: completedCount === lanes.length ? "Keep the streak light." : `Answer one ${active.format.toLowerCase()}.`,
    promise: "Choice stamps come first; one short answer is the final tiny stamp.",
    lanes: lanes.map((lane) => ({
      ...lane,
      status: lane.done ? "done" : lane.id === active.id ? "active" : "locked"
    }))
  };
}

export function dailyLandingStepCard(progress, now = Date.now()) {
  const minimum = dailyMinimumCard(progress, now);
  const next = nextPracticeRecommendation(progress, now);
  const brief = jobEvidenceBrief(progress, now);
  const actionByType = {
    review: "Rescue one weak signal",
    lesson: "Clear one tiny lesson step",
    boss: "Try one Boss checkpoint",
    interview: "Practice one interview line",
    done: "Rehearse one saved proof"
  };
  const abilityByType = {
    review: "recall stability",
    lesson: "Recognize / Connect / Explain progress",
    boss: "chapter-level proof",
    interview: "interview wording",
    done: "proof fluency"
  };

  return {
    title: "Daily Landing Step",
    status: minimum.status,
    headline: minimum.status === "done" ? "Today already moved your landing path" : "Three minutes can still move the path",
    minimumAction: actionByType[next.type] ?? "Answer one tiny prompt",
    abilityPiece: abilityByType[next.type] ?? "agentic workflow judgment",
    jobUse: brief
      ? `Use it for: ${brief.strongestTitle} evidence.`
      : "Use it for: your first agentic workflow evidence line.",
    nextAction: minimum.nextAction,
    route: [
      {
        id: "today",
        label: "Today",
        text: minimum.status === "done" ? "One recall signal is already banked." : "Answer one low-friction question."
      },
      {
        id: "piece",
        label: "Piece",
        text: `Bank ${abilityByType[next.type] ?? "one workflow judgment"}.`
      },
      {
        id: "landing",
        label: "Landing",
        text: brief?.nextGap ?? next.title
      }
    ],
    promise: "One small quiz move can still become job-facing evidence later."
  };
}

export function questCompass(progress, now = Date.now()) {
  const next = nextPracticeRecommendation(progress, now);
  const receiptCount = learningReceiptReel(progress, 3).receipts.length;
  const rewardByType = {
    review: "Repair one weak signal before learning anything new.",
    lesson: "Add one fresh Recognize / Connect / Explain receipt.",
    boss: "Convert a chapter into Boss-proven evidence.",
    interview: "Turn proven judgment into interview-ready language.",
    done: "Keep the loop warm with review or pitch rehearsal."
  };
  const unlockByType = {
    review: "Cleaner recall",
    lesson: "New receipt",
    boss: "Proof gate",
    interview: "Interview line",
    done: "Maintenance rhythm"
  };

  return {
    title: "Quest Compass",
    missionType: next.type,
    target: next.title,
    cta: next.cta,
    why: next.reason,
    reward: rewardByType[next.type] ?? rewardByType.lesson,
    unlock: unlockByType[next.type] ?? unlockByType.lesson,
    receiptCount,
    steps: [
      {
        id: "start",
        label: "Start",
        text: "Take the recommended action."
      },
      {
        id: "capture",
        label: "Capture",
        text: "Let the answer become a proof or review receipt."
      },
      {
        id: "reuse",
        label: "Reuse",
        text: "Use that receipt as one job-facing explanation seed."
      }
    ]
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

export function completionCard(progress, event, now = Date.now()) {
  const summariesByChapter = new Map(chapterSummaryCards(progress).map((item) => [item.chapterId, item]));
  const summary = event.chapterId ? summariesByChapter.get(event.chapterId) : null;
  const roleSignal = roleFitCompletionLine(event.chapterId);
  const nextAction = summary?.nextAction ?? "Keep going with the next tiny practice step.";
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
    roleSignal,
    proofDock: completionProofDock(progress, event, roleSignal, nextAction, now),
    rewards: completionRewards(event, roleSignal, nextAction),
    exitTicket: completionExitTicket(event, roleSignal, nextAction),
    nextAction: summary?.nextAction ?? "繼續下一個低阻力練習。"
  };
}

function roleFitCompletionLine(chapterId) {
  if (!chapterId) return "Review strengthens every role path by making the same judgment easier to recall later.";
  const roles = ROLE_FIT_TRACKS.filter((track) => track.chapterIds.includes(chapterId)).map((track) => track.title);
  if (roles.length === 0) return "This step adds one reusable agentic workflow judgment.";
  return `This step supports: ${roles.join(" / ")}.`;
}

function completionRewards(event, roleSignal, nextAction) {
  const xpLabel =
    event.type === "boss"
      ? event.passed
        ? "Boss proof saved"
        : "Boss retry map saved"
      : event.type === "review"
        ? "Recall strengthened"
        : event.type === "interview"
          ? "Interview language saved"
          : "Micro XP banked";
  return [
    {
      id: "xp",
      label: xpLabel,
      detail: event.type === "review" ? "Old signals are easier to recall next time." : "This run now counts toward the learning path."
    },
    {
      id: "role",
      label: "Role signal",
      detail: roleSignal
    },
    {
      id: "next",
      label: "Next unlock",
      detail: nextAction
    }
  ];
}

function completionProofDock(progress, event, roleSignal, nextAction, now) {
  const packet = jobPacketPreviewCard(progress, now);
  const receipt = learningReceiptReel(progress, 1).receipts[0] ?? null;
  const savedLine =
    event.type === "review"
      ? "A weak signal was refreshed for future recall."
      : event.type === "boss"
        ? event.passed
          ? "A Boss result can become stronger evidence."
          : "The retry target is now visible."
        : event.type === "interview"
          ? "One spoken answer pass is now reusable."
          : "One learning run was added to the proof trail.";

  return {
    title: "Proof Dock",
    status: packet.status,
    headline: receipt ? receipt.evidenceLine : savedLine,
    summary: "This finish screen turns the run into reusable role, receipt, packet, and next-step signals.",
    items: [
      {
        id: "receipt",
        label: "Receipt",
        done: Boolean(receipt),
        text: receipt?.resultLabel ?? savedLine
      },
      {
        id: "role",
        label: "Role use",
        done: true,
        text: roleSignal
      },
      {
        id: "packet",
        label: "Packet",
        done: packet.readyCount > 0,
        text: `${packet.readyCount}/${packet.totalCount} pieces ready`
      },
      {
        id: "reuse",
        label: "Reuse",
        done: true,
        text: nextAction
      }
    ]
  };
}

function completionExitTicket(event, roleSignal, nextAction) {
  const saved =
    event.type === "review"
      ? "A weak pattern was moved back into recall."
      : event.type === "boss"
        ? event.passed
          ? "A chapter proof was saved."
          : "A retry target was saved."
        : event.type === "interview"
          ? "One interview wording pass was saved."
          : "One micro-lesson receipt was saved.";

  return [
    {
      id: "saved",
      label: "Saved",
      text: saved
    },
    {
      id: "reuse",
      label: "Reuse",
      text: roleSignal
    },
    {
      id: "next",
      label: "Next",
      text: nextAction
    }
  ];
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
  const roleSamples = roleSamplerCard(progress).sampledCount;
  return [
    {
      id: "answer-five",
      title: "答 5 題",
      current: Math.min(activity.answers, 5),
      target: 5,
      done: activity.answers >= 5,
      reason: "Build fast recognition through tiny prompts."
    },
    {
      id: "bank-phrase",
      title: "Bank 1 phrase",
      current: Math.min(activity.answers, 1),
      target: 1,
      done: activity.answers >= 1,
      reason: "Turn one answer into reusable wording."
    },
    {
      id: "sample-role",
      title: "Sample 1 role",
      current: Math.min(roleSamples, 1),
      target: 1,
      done: roleSamples >= 1,
      reason: "Try a job-facing path without choosing a lane yet."
    },
    {
      id: "finish-lesson",
      title: "完成 1 課",
      current: Math.min(activity.lessonsCompleted, 1),
      target: 1,
      done: activity.lessonsCompleted >= 1,
      reason: "Finish one choice-first micro lesson."
    },
    {
      id: "beat-boss",
      title: "通關 1 個 Boss Quiz",
      current: Math.min(activity.bossPasses, 1),
      target: 1,
      done: activity.bossPasses >= 1,
      reason: "Convert practice into defended evidence."
    }
  ];
}

export function achievements(progress) {
  const passedBosses = (progress.bossResults ?? []).filter((item) => item.passed).length;
  const wrongAnswers = Object.values(progress.answered).filter((item) => item.wrongCount > 0).length;
  const roleSamples = roleSamplerCard(progress).sampledCount;
  return [
    {
      id: "first-lesson",
      title: "踏出第一步",
      description: "完成任一 micro-lesson",
      proofLine: "I can finish a choice-first micro lesson and explain what signal it trained.",
      unlocked: progress.completedLessons.length > 0
    },
    {
      id: "mistake-hunter",
      title: "錯題獵人",
      description: "至少留下 1 題可複習的錯題",
      proofLine: "I can turn a miss into a scheduled review target instead of guessing again.",
      unlocked: wrongAnswers > 0
    },
    {
      id: "boss-clear",
      title: "章節通關",
      description: "通過任一章節 Boss Quiz",
      proofLine: "I can defend a chapter-level agentic workflow judgment under a checkpoint.",
      unlocked: passedBosses > 0
    },
    {
      id: "role-explorer",
      title: "Role Explorer",
      description: "Sample one job-facing role path with choice-first practice",
      proofLine: "I can compare a job-facing agent role through tiny workflow choices.",
      unlocked: roleSamples > 0
    },
    {
      id: "hundred-xp",
      title: "100 XP",
      description: "累積 100 XP",
      proofLine: "I can keep a steady practice loop long enough to build recall evidence.",
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

function receiptReplayResult(question, state) {
  const response =
    state.lastResult === "correct" ? correctReplayResponse(question) : wrongReplayResponse(question);
  return gradeQuestion(question, response);
}

function correctReplayResponse(question) {
  if (question.type === "single" || question.type === "multi") return question.answer;
  if (question.type === "short") return question.keywords.slice(0, Math.max(1, question.minMatches)).join(" ");
  return null;
}

function wrongReplayResponse(question) {
  if (question.type === "single") return -1;
  if (question.type === "multi") return [];
  if (question.type === "short") return "";
  return null;
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
