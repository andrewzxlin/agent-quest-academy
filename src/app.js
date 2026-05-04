import { bossQuestionsForChapter, chapterVisuals, course, flattenLessons, interviewQuestionsForChapter } from "./course.js";
import {
  abilityProofCards,
  answerQuestion,
  beginnerGlossaryCards,
  buildReviewSessionQuestions,
  buildSessionQuestions,
  careerReadinessSnapshot,
  chapterGateMap,
  chapterMap,
  chapterSummaryCards,
  completionCard,
  completeBossQuiz,
  completeLesson,
  createInitialProgress,
  achievements,
  dailyMomentum,
  dailyQuestSnapshot,
  dailyMissions,
  gradeQuestion,
  gradePitchPractice,
  isAnswerReady,
  jobReadinessMap,
  jobEvidenceBrief,
  jobScenarioCard,
  lessonSkillCard,
  learningPuzzleBoard,
  loadProgress,
  masteryForLesson,
  mistakeFocusCard,
  mistakeRescuePrompt,
  mistakeNotebook,
  nextPracticeRecommendation,
  onboardingState,
  pitchPracticeCard,
  questionCoachHint,
  reviewStats,
  resetProgress,
  saveProgress,
  selectLearnerProfile
} from "./engine.js";

let progress = loadProgress();
let selectedLessonIndex = progress.currentLessonIndex ?? 0;
let sessionQuestions = [];
let currentIndex = 0;
let selectedSingle = null;
let selectedMulti = new Set();
let shortAnswer = "";
let checked = false;
let lastResult = null;
let sessionMode = "lesson";
let bossScore = 0;
let latestCompletion = null;
let activePitch = null;
let pitchAnswer = "";

const root = document.querySelector("#app");

function render() {
  const lessons = flattenLessons();
  const lesson = lessons[selectedLessonIndex] ?? lessons[0];
  if (sessionQuestions.length === 0) {
    sessionQuestions = buildSessionQuestions(progress, lesson);
  }
  const question = sessionQuestions[currentIndex];
  const chapter = course.chapters.find((item) => item.id === lesson.chapterId) ?? course.chapters[0];
  const visual = chapterVisuals[chapter.id] ?? chapterVisuals["agent-basics"];
  const bossResult = progress.bossResults?.find((item) => item.chapterId === chapter.id);
  const missions = dailyMissions(progress, Date.now());
  const badges = achievements(progress);
  const mistakes = mistakeNotebook(progress, Date.now(), 5);
  const mistakeFocus = mistakeFocusCard(progress, Date.now());
  const map = chapterMap(progress);
  const gates = chapterGateMap(progress);
  const gatesByChapter = new Map(gates.map((item) => [item.chapterId, item]));
  const readiness = jobReadinessMap(progress);
  const puzzle = learningPuzzleBoard(progress);
  const summaries = chapterSummaryCards(progress);
  const proofs = abilityProofCards(progress);
  const stats = reviewStats(progress, Date.now());
  const recommendation = nextPracticeRecommendation(progress, Date.now());
  const careerSnapshot = careerReadinessSnapshot(progress, Date.now());
  const evidenceBrief = jobEvidenceBrief(progress, Date.now());
  const dailyQuest = dailyQuestSnapshot(progress, Date.now());
  const momentum = dailyMomentum(progress, Date.now());
  const onboarding = onboardingState(progress);
  const glossary = beginnerGlossaryCards(chapter.id);
  const jobScenario = jobScenarioCard(chapter.id);
  const skillCard = lessonSkillCard(progress, lesson.id);
  const dueCount = stats.dueCount;
  const mastery = masteryForLesson(progress, lesson);
  const isReviewMode = sessionMode === "review";
  const isBossMode = sessionMode === "boss";
  const answerReady = isAnswerReady(question, getResponse(question));

  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="logo">AQ</div>
          <div>
            <h1>${course.title}</h1>
            <p>${course.subtitle}</p>
          </div>
        </div>
        <div class="stats">
          <div><span>${progress.xp}</span><small>XP</small></div>
          <div><span>${momentum.streakDays}</span><small>連續天</small></div>
          <div><span>${dueCount}</span><small>待複習</small></div>
        </div>
        <button class="review-button" data-review="true" ${dueCount === 0 ? "disabled" : ""}>
          <strong>錯題複習</strong>
          <span>${dueCount === 0 ? "目前沒有到期題" : `立即刷 ${dueCount} 題到期題`}</span>
        </button>
        <button class="boss-button" data-boss="true" ${gatesByChapter.get(chapter.id)?.bossUnlocked ? "" : "disabled"}>
          <strong>章節 Boss Quiz</strong>
          <span>${bossResult ? `${bossResult.passed ? "已通關" : "待重戰"}：${bossResult.score}/${bossResult.total}` : `${chapter.title} 挑戰`}</span>
        </button>
        <button class="interview-button" data-interview="true" ${gatesByChapter.get(chapter.id)?.interviewUnlocked ? "" : "disabled"}>
          <strong>面試情境題</strong>
          <span>${chapter.title} 設計判斷</span>
        </button>
        <div class="map">
          ${lessons
            .map((item, index) => {
              const active = index === selectedLessonIndex ? "active" : "";
              const done = progress.completedLessons.includes(item.id) ? "done" : "";
              const gate = gatesByChapter.get(item.chapterId);
              const locked = gate?.lessonsUnlocked ? "" : "locked";
              return `<button class="lesson-pill ${active} ${done} ${locked}" data-lesson="${index}" ${locked ? "disabled" : ""}>
                <span>${index + 1}</span>
                <strong>${item.title}</strong>
                <small>${locked ? gate.gateLabel : item.chapterTitle}</small>
              </button>`;
            })
            .join("")}
        </div>
        <button class="ghost" data-reset="true">重置進度</button>
      </aside>

      <main class="main">
        <section class="hero-card">
          <div>
            <p class="eyebrow">${isReviewMode ? "Review Queue / 錯題重現" : isBossMode ? `${chapter.title} / Boss Quiz` : `${lesson.chapterTitle} / ${lesson.chapterTheme}`}</p>
            <h2>${isReviewMode ? "錯題複習模式" : isBossMode ? "章節 Boss Quiz" : lesson.title}</h2>
            <p>${isReviewMode ? "只練已到期或剛答錯的題目。複習答對後會重新排入下一次間隔複習。" : isBossMode ? "只用選擇題檢查整章核心判斷。答對 80% 以上就算通關。" : lesson.concept}</p>
          </div>
          <div class="visual-card" style="--visual-accent: ${visual.accent}">
            <div class="orbital">
              <span>${visual.mark}</span><span>Model</span><span>Tool</span><span>Check</span>
            </div>
            <p>${visual.caption}</p>
            <strong>${isReviewMode ? `目前排程 ${stats.scheduledCount} 題，最近答錯 ${stats.wrongCount} 題。` : isBossMode ? `目前得分 ${bossScore}/${sessionQuestions.length}` : lesson.analogy}</strong>
          </div>
        </section>
        ${renderOnboardingCard(onboarding)}
        ${renderCareerSnapshot(careerSnapshot)}
        ${renderJobEvidenceBrief(evidenceBrief)}
        ${renderDailyQuestSnapshot(dailyQuest)}
        ${renderDailyMomentumCard(momentum)}
        ${renderMistakeFocusCard(mistakeFocus)}
        ${renderLearningPuzzleBoard(puzzle)}
        ${renderRecommendationCard(recommendation)}
        ${latestCompletion ? renderCompletionCard(latestCompletion) : ""}
        ${activePitch ? renderPitchPracticeCard(activePitch) : ""}
        ${renderJobScenarioCard(jobScenario)}
        ${renderGlossaryCard(glossary)}
        ${renderLessonSkillCard(skillCard)}

        <section class="quiz-card">
          <div class="progress-row">
            <div>
              <p class="eyebrow">${isReviewMode ? "複習" : isBossMode ? "Boss" : "第"} ${currentIndex + 1} / ${sessionQuestions.length} 題</p>
              <h3>${question.prompt}</h3>
            </div>
            <div class="mastery">
              <span>${mastery}%</span>
              <small>本課熟練度</small>
            </div>
          </div>
          ${renderQuestionCoach(questionCoachHint(question))}
          ${renderQuestion(question)}
          ${checked ? renderFeedback(question, lastResult) : ""}
          <div class="actions">
            <button class="primary" data-check="true" ${checked || !answerReady ? "disabled" : ""}>檢查答案</button>
            <button class="ghost compact" data-unsure="true" ${checked ? "disabled" : ""}>我還不確定</button>
            <button class="secondary" data-next="true" ${checked ? "" : "disabled"}>${currentIndex === sessionQuestions.length - 1 ? (isReviewMode ? "完成複習" : isBossMode ? "結算 Boss" : "完成本課") : "下一題"}</button>
          </div>
        </section>

        <details class="learning-library">
          <summary>
            <strong>學習地圖與進度細節</strong>
            <span>章節、錯題、成就、能力地圖與 pitch 練習</span>
          </summary>

        <section class="explain-grid">
          <div>
            <h3>學習節奏</h3>
            <p>先用選擇題建立直覺，答錯會立刻排入複習；答對也會在未來回來，避免只是當下猜對。</p>
          </div>
          <div>
            <h3>目前拼圖</h3>
            <p>課程涵蓋 Agent、Tool Calling、RAG、Memory、Guardrails、Evals、Observability、LangChain 與 LangGraph。</p>
          </div>
        </section>

        <section class="mission-grid">
          <div>
            <h3>每日任務</h3>
            <div class="mission-list">
              ${missions
                .map((mission) => `<div class="mission ${mission.done ? "done" : ""}">
                  <span>${mission.done ? "完成" : `${mission.current}/${mission.target}`}</span>
                  <strong>${mission.title}</strong>
                </div>`)
                .join("")}
            </div>
          </div>
          <div>
            <h3>成就徽章</h3>
            <div class="badge-list">
              ${badges
                .map((badge) => `<div class="badge ${badge.unlocked ? "unlocked" : ""}">
                  <span>${badge.unlocked ? "已解鎖" : "未解鎖"}</span>
                  <strong>${badge.title}</strong>
                  <small>${badge.description}</small>
                </div>`)
                .join("")}
            </div>
          </div>
          <div>
            <h3>錯題本</h3>
            <div class="mistake-list">
              ${
                mistakes.length === 0
                  ? `<p class="empty-note">目前還沒有錯題。先去完成幾題，系統會自動整理。</p>`
                  : mistakes
                      .map((item) => `<div class="mistake-card ${item.due ? "due" : ""}">
                        <span>${item.due ? "已到期" : "已排程"} / 錯 ${item.wrongCount} 次</span>
                        <strong>${item.question.prompt}</strong>
                        <small>${item.chapterTitle} / ${item.lessonTitle}</small>
                        ${item.rescue ? `<p>${item.rescue.body}</p>` : ""}
                      </div>`)
                      .join("")
              }
            </div>
          </div>
        </section>

        <section class="chapter-map">
          <div class="section-title">
            <h3>章節通關地圖</h3>
            <p>每一章都是 Agentic Workflow 的一塊拼圖。完成課程只是理解，通過 Boss 才算真正通關。</p>
          </div>
          <div class="chapter-track">
            ${map
              .map((item, index) => {
                const visual = chapterVisuals[item.chapterId] ?? chapterVisuals["agent-basics"];
                const gate = gatesByChapter.get(item.chapterId);
                return `<div class="chapter-node ${item.status} ${gate?.gate}" style="--node-accent: ${visual.accent}">
                <span>${index + 1}</span>
                <b>${visual.mark}</b>
                <strong>${item.title}</strong>
                <em>${visual.caption}</em>
                <small>${item.completedLessons}/${item.totalLessons} 課 · ${item.lessonPercent}% · Boss ${item.bossPassed ? "已通關" : item.bossScore ?? "未挑戰"}</small>
              </div>`;
              })
              .join("")}
          </div>
        </section>
        <section class="readiness-map">
          <div class="section-title">
            <h3>求職能力地圖</h3>
            <p>每一章都對應一塊 AI / Agent 工程會用到的能力；先看懂、會判斷，再逐步走向能做。</p>
          </div>
          <div class="readiness-grid">
            ${readiness
              .map(
                (skill) => `<div class="readiness-card ${skill.status}">
                  <span>${readinessStatusText(skill.status)}</span>
                  <strong>${skill.title}</strong>
                  <p>${skill.signal}</p>
                  <small>${skill.chapterTitle} / ${skill.lessonPercent}% / ${skill.evidence}</small>
                </div>`
              )
              .join("")}
          </div>
        </section>
        <section class="proof-map">
          <div class="section-title">
            <h3>能力證明卡</h3>
            <p>把完成過的低阻力練習轉成「我能判斷什麼」的工作能力訊號。</p>
          </div>
          <div class="proof-grid">
            ${proofs
              .map(
                (item) => `<div class="proof-card ${item.status}">
                  <span>${proofStatusText(item.status)}</span>
                  <strong>${item.title}</strong>
                  <p>${item.abilityStatement}</p>
                  <small>${item.proof}</small>
                  <em>${item.interviewProgress}</em>
                </div>`
              )
              .join("")}
          </div>
        </section>
        <section class="summary-map">
          <div class="section-title">
            <h3>章節總結卡</h3>
            <p>把每章學到的能力、常見錯因與面試說法整理成可以反覆看的短卡。</p>
          </div>
          <div class="summary-grid">
            ${summaries
              .map(
                (item) => `<div class="summary-card ${item.status}">
                  <span>${item.title}</span>
                  <strong>${item.ability}</strong>
                  <p>${item.interviewPitch}</p>
                  <small>${item.commonMistake}</small>
                  <em>${item.nextAction}</em>
                  <button class="secondary compact" ${gatesByChapter.get(item.chapterId)?.pitchUnlocked ? `data-pitch="${item.chapterId}"` : "disabled"}>${gatesByChapter.get(item.chapterId)?.pitchUnlocked ? "練 60 秒回答" : "Boss 通關後解鎖"}</button>
                </div>`
              )
              .join("")}
          </div>
        </section>
        </details>
      </main>
    </div>
  `;

  bindEvents();
}

function renderQuestion(question) {
  if (question.type === "single") {
    return `<div class="choices">${question.choices
      .map((choice, index) => `<button class="choice ${selectedSingle === index ? "selected" : ""}" data-single="${index}">${choice}</button>`)
      .join("")}</div>`;
  }
  if (question.type === "multi") {
    return `<div class="choices">${question.choices
      .map((choice, index) => `<button class="choice ${selectedMulti.has(index) ? "selected" : ""}" data-multi="${index}">${choice}</button>`)
      .join("")}</div><p class="hint">可複選，選完再檢查。</p>`;
  }
  return `<textarea class="short-input" placeholder="用一句話回答即可，不需要寫程式。">${shortAnswer}</textarea>`;
}

function renderCompletionCard(card) {
  return `<section class="completion-card ${card.type}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.ability}</p>
    </div>
    <div>
      <strong>${card.result}</strong>
      <span>${card.nextAction}</span>
      <button class="secondary compact" data-dismiss-completion="true">繼續練習</button>
    </div>
  </section>`;
}

function renderRecommendationCard(recommendation) {
  return `<section class="recommendation-card ${recommendation.type}">
    <div>
      <p class="eyebrow">今日推薦</p>
      <h3>${recommendation.title}</h3>
      <p>${recommendation.reason}</p>
    </div>
    <button class="primary compact" data-recommend="true" ${recommendation.type === "done" ? "disabled" : ""}>${recommendation.cta}</button>
  </section>`;
}

function renderCareerSnapshot(snapshot) {
  return `<section class="career-snapshot">
    <div>
      <p class="eyebrow">Job Readiness Snapshot</p>
      <h3>${snapshot.level}</h3>
      <p>${snapshot.provenCount}/${snapshot.total} chapters proven, ${snapshot.interviewReadyCount} interview-ready.</p>
    </div>
    <div class="snapshot-meter">
      <strong>${snapshot.percent}%</strong>
      <span>下一個缺口：${snapshot.nextGap}</span>
      <small>${snapshot.nextAction}</small>
    </div>
  </section>`;
}

function renderJobEvidenceBrief(brief) {
  if (!brief) return "";
  return `<section class="job-evidence-brief">
    <div>
      <p class="eyebrow">Job Evidence Brief</p>
      <h3>${brief.headline}</h3>
      <p>${brief.interviewLine}</p>
      <strong>${brief.proof}</strong>
      <div class="evidence-script">
        ${brief.scriptParts.map((part) => `<span>${part}</span>`).join("")}
      </div>
    </div>
    <div class="evidence-meter">
      <span>${brief.readyCount}/${brief.total}</span>
      <small>ready evidence</small>
      <em>${brief.nextGap} · ${brief.nextAction}</em>
    </div>
  </section>`;
}

function renderDailyQuestSnapshot(snapshot) {
  return `<section class="daily-quest-snapshot">
    <div>
      <p class="eyebrow">Daily Quest</p>
      <h3>${snapshot.completedCount}/${snapshot.totalCount} 今日任務完成</h3>
      <p>${snapshot.nextStep}</p>
    </div>
    <div class="quest-meter">
      <strong>${snapshot.percent}%</strong>
      <span>${snapshot.activeTitle}</span>
    </div>
  </section>`;
}

function renderDailyMomentumCard(momentum) {
  return `<section class="daily-momentum-card ${momentum.activeToday ? "active" : "idle"}">
    <div>
      <p class="eyebrow">Daily Momentum</p>
      <h3>${momentum.level}</h3>
      <p>${momentum.nextNudge}</p>
    </div>
    <div class="momentum-grid">
      <div>
        <span>${momentum.streakDays}</span>
        <small>連續天</small>
      </div>
      <div>
        <span>${momentum.answersToday}</span>
        <small>今日答題</small>
      </div>
      <div>
        <span>${momentum.correctRate}%</span>
        <small>今日正確率</small>
      </div>
    </div>
  </section>`;
}

function renderMistakeFocusCard(card) {
  if (!card) return "";
  return `<section class="mistake-focus-card ${card.due ? "due" : "scheduled"}">
    <div>
      <p class="eyebrow">Mistake Focus</p>
      <h3>${card.chapterTitle}</h3>
      <p>${card.prompt}</p>
      ${card.rescue ? `<strong>${card.rescue.body}</strong>` : ""}
    </div>
    <div class="mistake-focus-meter">
      <span>${card.dueCount}</span>
      <small>到期錯題</small>
      <em>${card.nextAction}</em>
    </div>
  </section>`;
}

function renderLearningPuzzleBoard(pieces) {
  return `<section class="learning-puzzle-board">
    <div class="section-title">
      <div>
        <p class="eyebrow">Learning Puzzle</p>
        <h3>8 塊上岸能力拼圖</h3>
      </div>
      <p>每塊都只靠 micro-lessons、Boss、面試情境題逐步補齊。</p>
    </div>
    <div class="puzzle-grid">
      ${pieces
        .map(
          (piece) => `<div class="puzzle-piece ${piece.status}">
            <div class="puzzle-topline">
              <span>${piece.order}</span>
              <small>${puzzleStatusText(piece.status)} · ${piece.percent}%</small>
            </div>
            <strong>${piece.title}</strong>
            <p>${piece.whyItMatters}</p>
            <div class="puzzle-stages">
              ${piece.stages
                .map((stage) => `<span class="${stage.done ? "done" : ""}">${stage.done ? "✓" : "○"} ${stage.label} ${stage.progress}</span>`)
                .join("")}
            </div>
            <em>${piece.nextAction}</em>
          </div>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderOnboardingCard(onboarding) {
  if (onboarding.completed) {
    return `<section class="onboarding-card compact-card">
      <div>
        <p class="eyebrow">Coach Mode</p>
        <h3>${onboarding.headline}</h3>
        <p>${onboarding.guidance}</p>
        ${renderQuestSteps(onboarding.questSteps)}
      </div>
      <button class="ghost compact" data-profile-reset="true">重選起點</button>
    </section>`;
  }
  return `<section class="onboarding-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Start Here</p>
        <h3>${onboarding.headline}</h3>
      </div>
      <p>${onboarding.guidance}</p>
    </div>
    <div class="profile-grid">
      ${onboarding.options
        .map((profile) => `<button class="profile-option" data-profile="${profile.id}">
          <strong>${profile.title}</strong>
          <span>${profile.description}</span>
        </button>`)
        .join("")}
    </div>
  </section>`;
}

function renderQuestSteps(steps = []) {
  if (steps.length === 0) return "";
  return `<div class="quest-route">
    ${steps.map((step, index) => `<div><span>${index + 1}</span><strong>${step}</strong></div>`).join("")}
  </div>`;
}

function renderPitchPracticeCard(card) {
  const result = gradePitchPractice(card, pitchAnswer);
  return `<section class="pitch-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Interview Pitch</p>
        <h3>${card.title}</h3>
      </div>
      <button class="ghost compact" data-close-pitch="true">關閉</button>
    </div>
    <p>${card.prompt}</p>
    <div class="pitch-grid">
      <div>
        <strong>回答大綱</strong>
        ${card.outline.map((item) => `<span>${item}</span>`).join("")}
      </div>
      <div>
        <strong>即時檢查 ${result.doneCount}/${result.total}</strong>
        ${result.checks.map((item) => `<span class="${item.done ? "done" : ""}">${item.done ? "已做到" : "可再補"}：${item.label}</span>`).join("")}
      </div>
    </div>
    <textarea class="pitch-input" placeholder="用自己的話寫一段 60 秒回答。">${pitchAnswer}</textarea>
    <p class="sample-answer">示範方向：${card.sampleAnswer}</p>
  </section>`;
}

function renderGlossaryCard(glossary) {
  return `<section class="glossary-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Beginner Glossary</p>
        <h3>${glossary.chapterTitle} 的 3 個先懂詞</h3>
      </div>
      <p>先用白話抓住術語，再進入選擇題與少量簡答。</p>
    </div>
    <div class="glossary-grid">
      ${glossary.terms
        .map(
          (item) => `<div>
            <strong>${item.term}</strong>
            <p>${item.plain}</p>
            <span>${item.whyItMatters}</span>
          </div>`
        )
        .join("")}
    </div>
  </section>`;
}

function renderLessonSkillCard(card) {
  if (!card) return "";
  return `<section class="lesson-skill-card">
    <div>
      <p class="eyebrow">Micro Skill</p>
      <h3>${card.title}</h3>
      <p>${card.focus}</p>
      <strong>${card.practicePromise}</strong>
    </div>
    <div class="skill-grid">
      <div>
        <span>工作訊號</span>
        <strong>${card.jobSkill}</strong>
        <p>${card.jobSignal}</p>
      </div>
      <div>
        <span>答題鏡頭</span>
        <strong>${card.answerLens}</strong>
        <p>${card.mix.map((item) => `${item.label} ${item.count}`).join(" / ")}</p>
      </div>
      <div>
        <span>目前掌握</span>
        <strong>${card.correct}/${card.total} 核心判斷</strong>
        <p>${card.attempted}/${card.total} 題已嘗試，${card.mastery}% 已掌握。</p>
      </div>
    </div>
  </section>`;
}

function renderJobScenarioCard(card) {
  return `<section class="job-scenario-card">
    <div>
      <p class="eyebrow">Workplace Scenario</p>
      <h3>${card.chapterTitle} 在工作中長這樣</h3>
      <p>${card.workplaceTask}</p>
    </div>
    <div class="scenario-grid">
      <div>
        <span>常見陷阱</span>
        <strong>${card.commonTrap}</strong>
      </div>
      <div>
        <span>面試訊號</span>
        <strong>${card.interviewSignal}</strong>
      </div>
    </div>
  </section>`;
}

function renderQuestionCoach(hint) {
  return `<div class="question-coach">
    <span>${hint.title}</span>
    <p>${hint.body}</p>
    ${hint.starter ? `<button class="starter-chip" data-starter="${hint.starter}">套用起手式</button>` : ""}
  </div>`;
}

function renderFeedback(question, result) {
  const tone = result.correct ? "correct" : "wrong";
  return `<div class="feedback ${tone}">
    <strong>${result.correct ? "答對了" : "先記下來，之後會再出現"}</strong>
    <p>${question.explanation}</p>
    ${renderMistakeRescue(mistakeRescuePrompt(question, result))}
    ${renderChoiceFeedback(question, result)}
    ${renderShortFeedback(question, result)}
  </div>`;
}

function renderMistakeRescue(rescue) {
  if (!rescue) return "";
  return `<div class="mistake-rescue">
    <span>${rescue.title}</span>
    <p>${rescue.body}</p>
  </div>`;
}

function renderChoiceFeedback(question, result) {
  if (!question.choiceFeedback) return "";
  return `<div class="choice-feedback">
    ${question.choiceFeedback
      .map((item, index) => {
        const state = choiceFeedbackState(question, result, index);
        return `<div class="choice-note ${state} ${item.correct ? "correct-choice" : "wrong-choice"}">
          <span>${item.correct ? "核心選項" : "干擾選項"}</span>
          <strong>${item.choice}</strong>
          <p>${item.reason}</p>
        </div>`;
      })
      .join("")}
  </div>`;
}

function choiceFeedbackState(question, result, index) {
  if (question.type === "single") {
    const selected = selectedSingle === index ? "selected-answer" : "";
    const expected = Number(result.expected) === index ? "expected-answer" : "";
    return `${selected} ${expected}`.trim();
  }
  if (question.type === "multi") {
    const selected = selectedMulti.has(index) ? "selected-answer" : "";
    const expected = result.expected.includes(index) ? "expected-answer" : "";
    return `${selected} ${expected}`.trim();
  }
  return "";
}

function renderShortFeedback(question, result) {
  if (question.type !== "short") return "";
  const matches = result.matches ?? [];
  const missing = result.missing ?? [];
  return `<div class="short-feedback">
    <div>
      <span>命中的概念</span>
      <strong>${matches.length === 0 ? "尚未命中關鍵概念" : matches.join("、")}</strong>
    </div>
    <div>
      <span>可以再補</span>
      <strong>${missing.slice(0, 4).join("、")}</strong>
    </div>
    <div>
      <span>示範回答</span>
      <p>${question.sampleAnswer}</p>
    </div>
  </div>`;
}

function readinessStatusText(status) {
  if (status === "job_ready") return "可上場";
  if (status === "learning") return "學習中";
  return "未解鎖";
}

function proofStatusText(status) {
  if (status === "interview_ready") return "面試可說明";
  if (status === "proven") return "Boss 已證明";
  if (status === "practicing") return "練習中";
  return "待啟動";
}

function puzzleStatusText(status) {
  if (status === "complete") return "已完成";
  if (status === "proven") return "Boss 已證明";
  if (status === "boss_ready") return "可挑戰 Boss";
  if (status === "learning") return "練習中";
  if (status === "locked") return "未解鎖";
  return "新拼圖";
}

function bindEvents() {
  document.querySelectorAll("[data-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLessonIndex = Number(button.dataset.lesson);
      progress.currentLessonIndex = selectedLessonIndex;
      sessionMode = "lesson";
      bossScore = 0;
      latestCompletion = null;
      activePitch = null;
      pitchAnswer = "";
      sessionQuestions = [];
      currentIndex = 0;
      clearAnswerState();
      saveProgress(progress);
      render();
    });
  });

  document.querySelector("[data-review]")?.addEventListener("click", () => {
    sessionMode = "review";
    sessionQuestions = buildReviewSessionQuestions(progress, Date.now(), 7);
    currentIndex = 0;
    bossScore = 0;
    latestCompletion = null;
    activePitch = null;
    pitchAnswer = "";
    clearAnswerState();
    render();
  });

  document.querySelector("[data-boss]")?.addEventListener("click", () => {
    const lessons = flattenLessons();
    const lesson = lessons[selectedLessonIndex] ?? lessons[0];
    sessionMode = "boss";
    sessionQuestions = bossQuestionsForChapter(lesson.chapterId, 8);
    currentIndex = 0;
    bossScore = 0;
    latestCompletion = null;
    activePitch = null;
    pitchAnswer = "";
    clearAnswerState();
    render();
  });

  document.querySelector("[data-interview]")?.addEventListener("click", () => {
    const lessons = flattenLessons();
    const lesson = lessons[selectedLessonIndex] ?? lessons[0];
    sessionMode = "interview";
    sessionQuestions = interviewQuestionsForChapter(lesson.chapterId);
    currentIndex = 0;
    bossScore = 0;
    latestCompletion = null;
    activePitch = null;
    pitchAnswer = "";
    clearAnswerState();
    render();
  });

  document.querySelector("[data-recommend]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelectorAll("[data-profile]").forEach((button) => {
    button.addEventListener("click", () => {
      progress = selectLearnerProfile(progress, button.dataset.profile);
      saveProgress(progress);
      render();
    });
  });

  document.querySelector("[data-profile-reset]")?.addEventListener("click", () => {
    progress = selectLearnerProfile(progress, null);
    saveProgress(progress);
    render();
  });

  document.querySelectorAll("[data-single]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSingle = Number(button.dataset.single);
      render();
    });
  });

  document.querySelectorAll("[data-multi]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.multi);
      selectedMulti.has(index) ? selectedMulti.delete(index) : selectedMulti.add(index);
      render();
    });
  });

  const textarea = document.querySelector(".short-input");
  if (textarea) {
    textarea.addEventListener("input", (event) => {
      shortAnswer = event.target.value;
    });
  }

  document.querySelectorAll("[data-starter]").forEach((button) => {
    button.addEventListener("click", () => {
      shortAnswer = button.dataset.starter;
      render();
    });
  });

  const pitchTextarea = document.querySelector(".pitch-input");
  if (pitchTextarea) {
    pitchTextarea.addEventListener("input", (event) => {
      pitchAnswer = event.target.value;
      render();
    });
  }

  document.querySelectorAll("[data-pitch]").forEach((button) => {
    button.addEventListener("click", () => {
      activePitch = pitchPracticeCard(progress, button.dataset.pitch);
      pitchAnswer = "";
      latestCompletion = null;
      render();
    });
  });

  document.querySelector("[data-check]")?.addEventListener("click", () => {
    submitCurrentAnswer(getResponse(sessionQuestions[currentIndex]));
  });

  document.querySelector("[data-unsure]")?.addEventListener("click", () => {
    submitCurrentAnswer(getUnsureResponse(sessionQuestions[currentIndex]));
  });

  document.querySelector("[data-next]")?.addEventListener("click", () => {
    if (currentIndex === sessionQuestions.length - 1) {
      if (sessionMode === "review" || sessionMode === "interview") {
        const lessons = flattenLessons();
        const lesson = lessons[selectedLessonIndex] ?? lessons[0];
        latestCompletion = completionCard(progress, {
          type: sessionMode,
          chapterId: sessionMode === "interview" ? lesson.chapterId : null,
          title: sessionMode === "interview" ? `${lesson.chapterTitle} 面試情境題` : "錯題複習"
        });
        sessionMode = "lesson";
      } else if (sessionMode === "boss") {
        const lessons = flattenLessons();
        const lesson = lessons[selectedLessonIndex] ?? lessons[0];
        progress = completeBossQuiz(progress, lesson.chapterId, bossScore, sessionQuestions.length);
        latestCompletion = completionCard(progress, {
          type: "boss",
          chapterId: lesson.chapterId,
          title: `${lesson.chapterTitle} Boss Quiz`,
          score: bossScore,
          total: sessionQuestions.length,
          passed: sessionQuestions.length > 0 && bossScore / sessionQuestions.length >= 0.8
        });
        sessionMode = "lesson";
        bossScore = 0;
      } else {
        const lesson = flattenLessons()[selectedLessonIndex];
        progress = completeLesson(progress, lesson.id);
        latestCompletion = completionCard(progress, {
          type: "lesson",
          chapterId: lesson.chapterId,
          title: lesson.title
        });
        selectedLessonIndex = progress.currentLessonIndex;
      }
      sessionQuestions = [];
      currentIndex = 0;
    } else {
      currentIndex += 1;
    }
    clearAnswerState();
    saveProgress(progress);
    render();
  });

  document.querySelector("[data-reset]")?.addEventListener("click", () => {
    resetProgress();
    progress = createInitialProgress();
    selectedLessonIndex = 0;
    sessionMode = "lesson";
    bossScore = 0;
    latestCompletion = null;
    activePitch = null;
    pitchAnswer = "";
    sessionQuestions = [];
    currentIndex = 0;
    clearAnswerState();
    render();
  });

  document.querySelector("[data-dismiss-completion]")?.addEventListener("click", () => {
    latestCompletion = null;
    render();
  });

  document.querySelector("[data-close-pitch]")?.addEventListener("click", () => {
    activePitch = null;
    pitchAnswer = "";
    render();
  });
}

function startRecommendedPractice(recommendation) {
  const lessons = flattenLessons();
  latestCompletion = null;
  activePitch = null;
  pitchAnswer = "";
  bossScore = 0;
  currentIndex = 0;
  clearAnswerState();

  if (recommendation.type === "review") {
    sessionMode = "review";
    sessionQuestions = buildReviewSessionQuestions(progress, Date.now(), 7);
  } else if (recommendation.type === "boss") {
    const lessonIndex = lessons.findIndex((lesson) => lesson.chapterId === recommendation.chapterId);
    selectedLessonIndex = Math.max(0, lessonIndex);
    progress.currentLessonIndex = selectedLessonIndex;
    sessionMode = "boss";
    sessionQuestions = bossQuestionsForChapter(recommendation.chapterId, 8);
  } else if (recommendation.type === "interview") {
    const lessonIndex = lessons.findIndex((lesson) => lesson.chapterId === recommendation.chapterId);
    selectedLessonIndex = Math.max(0, lessonIndex);
    progress.currentLessonIndex = selectedLessonIndex;
    sessionMode = "interview";
    sessionQuestions = interviewQuestionsForChapter(recommendation.chapterId);
  } else if (recommendation.type === "lesson") {
    selectedLessonIndex = recommendation.lessonIndex ?? progress.currentLessonIndex;
    progress.currentLessonIndex = selectedLessonIndex;
    sessionMode = "lesson";
    sessionQuestions = [];
  }

  saveProgress(progress);
  render();
}

function getResponse(question) {
  if (question.type === "single") return selectedSingle;
  if (question.type === "multi") return [...selectedMulti];
  return shortAnswer;
}

function getUnsureResponse(question) {
  if (question.type === "multi") return [];
  if (question.type === "short") return "";
  return null;
}

function submitCurrentAnswer(response) {
  const question = sessionQuestions[currentIndex];
  lastResult = gradeQuestion(question, response);
  const answered = answerQuestion(progress, question, response);
  progress = answered.progress;
  if (sessionMode === "boss" && lastResult.correct) {
    bossScore += 1;
  }
  checked = true;
  saveProgress(progress);
  render();
}

function clearAnswerState() {
  selectedSingle = null;
  selectedMulti = new Set();
  shortAnswer = "";
  checked = false;
  lastResult = null;
}

render();
