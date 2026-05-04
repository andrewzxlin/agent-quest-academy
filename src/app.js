import { bossQuestionsForChapter, chapterVisuals, course, flattenLessons, interviewQuestionsForChapter } from "./course.js";
import {
  answerQuestion,
  buildReviewSessionQuestions,
  buildSessionQuestions,
  chapterMap,
  chapterSummaryCards,
  completionCard,
  completeBossQuiz,
  completeLesson,
  createInitialProgress,
  achievements,
  dailyMissions,
  gradeQuestion,
  jobReadinessMap,
  loadProgress,
  masteryForLesson,
  mistakeNotebook,
  reviewStats,
  resetProgress,
  saveProgress
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
  const map = chapterMap(progress);
  const readiness = jobReadinessMap(progress);
  const summaries = chapterSummaryCards(progress);
  const stats = reviewStats(progress, Date.now());
  const dueCount = stats.dueCount;
  const mastery = masteryForLesson(progress, lesson);
  const isReviewMode = sessionMode === "review";
  const isBossMode = sessionMode === "boss";

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
          <div><span>${progress.streak}</span><small>連續課</small></div>
          <div><span>${dueCount}</span><small>待複習</small></div>
        </div>
        <button class="review-button" data-review="true" ${dueCount === 0 ? "disabled" : ""}>
          <strong>錯題複習</strong>
          <span>${dueCount === 0 ? "目前沒有到期題" : `立即刷 ${dueCount} 題到期題`}</span>
        </button>
        <button class="boss-button" data-boss="true">
          <strong>章節 Boss Quiz</strong>
          <span>${bossResult ? `${bossResult.passed ? "已通關" : "待重戰"}：${bossResult.score}/${bossResult.total}` : `${chapter.title} 挑戰`}</span>
        </button>
        <button class="interview-button" data-interview="true">
          <strong>面試情境題</strong>
          <span>${chapter.title} 設計判斷</span>
        </button>
        <div class="map">
          ${lessons
            .map((item, index) => {
              const active = index === selectedLessonIndex ? "active" : "";
              const done = progress.completedLessons.includes(item.id) ? "done" : "";
              return `<button class="lesson-pill ${active} ${done}" data-lesson="${index}">
                <span>${index + 1}</span>
                <strong>${item.title}</strong>
                <small>${item.chapterTitle}</small>
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
        ${latestCompletion ? renderCompletionCard(latestCompletion) : ""}

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
          ${renderQuestion(question)}
          ${checked ? renderFeedback(question, lastResult) : ""}
          <div class="actions">
            <button class="primary" data-check="true" ${checked ? "disabled" : ""}>檢查答案</button>
            <button class="secondary" data-next="true" ${checked ? "" : "disabled"}>${currentIndex === sessionQuestions.length - 1 ? (isReviewMode ? "完成複習" : isBossMode ? "結算 Boss" : "完成本課") : "下一題"}</button>
          </div>
        </section>

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
                return `<div class="chapter-node ${item.status}" style="--node-accent: ${visual.accent}">
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
                </div>`
              )
              .join("")}
          </div>
        </section>
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

function renderFeedback(question, result) {
  const tone = result.correct ? "correct" : "wrong";
  return `<div class="feedback ${tone}">
    <strong>${result.correct ? "答對了" : "先記下來，之後會再出現"}</strong>
    <p>${question.explanation}</p>
    ${renderChoiceFeedback(question, result)}
    ${renderShortFeedback(question, result)}
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

function bindEvents() {
  document.querySelectorAll("[data-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLessonIndex = Number(button.dataset.lesson);
      progress.currentLessonIndex = selectedLessonIndex;
      sessionMode = "lesson";
      bossScore = 0;
      latestCompletion = null;
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
    clearAnswerState();
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

  document.querySelector("[data-check]")?.addEventListener("click", () => {
    const question = sessionQuestions[currentIndex];
    const response = getResponse(question);
    lastResult = gradeQuestion(question, response);
    const answered = answerQuestion(progress, question, response);
    progress = answered.progress;
    if (sessionMode === "boss" && lastResult.correct) {
      bossScore += 1;
    }
    checked = true;
    saveProgress(progress);
    render();
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
    sessionQuestions = [];
    currentIndex = 0;
    clearAnswerState();
    render();
  });

  document.querySelector("[data-dismiss-completion]")?.addEventListener("click", () => {
    latestCompletion = null;
    render();
  });
}

function getResponse(question) {
  if (question.type === "single") return selectedSingle;
  if (question.type === "multi") return [...selectedMulti];
  return shortAnswer;
}

function clearAnswerState() {
  selectedSingle = null;
  selectedMulti = new Set();
  shortAnswer = "";
  checked = false;
  lastResult = null;
}

render();
