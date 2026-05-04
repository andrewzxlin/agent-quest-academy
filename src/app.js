import { course, flattenLessons } from "./course.js";
import {
  answerQuestion,
  buildSessionQuestions,
  completeLesson,
  createInitialProgress,
  getDueReviewQuestions,
  gradeQuestion,
  loadProgress,
  masteryForLesson,
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

const root = document.querySelector("#app");

function render() {
  const lessons = flattenLessons();
  const lesson = lessons[selectedLessonIndex] ?? lessons[0];
  if (sessionQuestions.length === 0) {
    sessionQuestions = buildSessionQuestions(progress, lesson);
  }
  const question = sessionQuestions[currentIndex];
  const dueCount = getDueReviewQuestions(progress, Date.now(), 99).length;
  const mastery = masteryForLesson(progress, lesson);

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
            <p class="eyebrow">${lesson.chapterTitle} / ${lesson.chapterTheme}</p>
            <h2>${lesson.title}</h2>
            <p>${lesson.concept}</p>
          </div>
          <div class="visual-card">
            <div class="orbital">
              <span>Model</span><span>Tool</span><span>State</span><span>Check</span>
            </div>
            <strong>${lesson.analogy}</strong>
          </div>
        </section>

        <section class="quiz-card">
          <div class="progress-row">
            <div>
              <p class="eyebrow">第 ${currentIndex + 1} / ${sessionQuestions.length} 題</p>
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
            <button class="secondary" data-next="true" ${checked ? "" : "disabled"}>${currentIndex === sessionQuestions.length - 1 ? "完成本課" : "下一題"}</button>
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

function renderFeedback(question, result) {
  const tone = result.correct ? "correct" : "wrong";
  return `<div class="feedback ${tone}">
    <strong>${result.correct ? "答對了" : "先記下來，之後會再出現"}</strong>
    <p>${question.explanation}</p>
  </div>`;
}

function bindEvents() {
  document.querySelectorAll("[data-lesson]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedLessonIndex = Number(button.dataset.lesson);
      progress.currentLessonIndex = selectedLessonIndex;
      sessionQuestions = [];
      currentIndex = 0;
      clearAnswerState();
      saveProgress(progress);
      render();
    });
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
    checked = true;
    saveProgress(progress);
    render();
  });

  document.querySelector("[data-next]")?.addEventListener("click", () => {
    if (currentIndex === sessionQuestions.length - 1) {
      const lesson = flattenLessons()[selectedLessonIndex];
      progress = completeLesson(progress, lesson.id);
      selectedLessonIndex = progress.currentLessonIndex;
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
    sessionQuestions = [];
    currentIndex = 0;
    clearAnswerState();
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
