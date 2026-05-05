import { bossQuestionsForChapter, chapterVisuals, course, flattenLessons, interviewQuestionsForChapter } from "./course.js";
import {
  abilityShardCard,
  abilityProofCards,
  answerGateProgressCard,
  answerOutcomeCard,
  answerEvidenceClip,
  answerInterviewLineCard,
  answerJobStorySeedCard,
  answerLootCard,
  answerMemoryHookCard,
  answerProofLine,
  answerRecallCue,
  answerRunChainCard,
  answerQuestion,
  beginnerGlossaryCards,
  beginnerMissionDockCard,
  beginnerSkillMapCard,
  bossGateTeaserCard,
  bossReadinessCard,
  buildReviewSessionQuestions,
  buildSessionQuestions,
  careerReadinessSnapshot,
  chapterGateMap,
  chapterGateStrip,
  chapterMap,
  chapterSummaryCards,
  choiceArcadeCard,
  choiceEliminationHint,
  choiceLensCard,
  completionCard,
  conceptDiagramCard,
  completeBossQuiz,
  completeLesson,
  createInitialProgress,
  achievements,
  dashboardModeCard,
  dailyMinimumCard,
  dailyLandingStepCard,
  dailyRunMeterCard,
  dailySkillTicketCard,
  streakShieldCard,
  dailyMomentum,
  dailyPhraseBankCard,
  dailyQuestSnapshot,
  dailyMissions,
  exerciseScopeCard,
  firstFiveMinuteStartCard,
  focusGuardCard,
  gradeQuestion,
  gradePitchPractice,
  heroMissionPanelCard,
  isAnswerReady,
  interviewUnlockPreviewCard,
  interviewReadinessDockCard,
  jargonShieldCard,
  questCompass,
  jobReadinessMap,
  jobEvidenceBrief,
  jobPacketPreviewCard,
  jobPacketShowcaseCard,
  jobSignalPassport,
  landingGapRadar,
  landingMissionStripCard,
  landingReadinessChecklist,
  jobRoleFitCard,
  jobScenarioCard,
  lessonAnalogyBridge,
  lessonLadderStrip,
  lessonPitchBuilder,
  lessonPracticePlan,
  lessonSkillCard,
  lessonStageRoute,
  lessonMasteryLadder,
  lessonWarmupCard,
  learningReceiptReel,
  learningPuzzleBoard,
  learningHud,
  loadProgress,
  masteryForLesson,
  mistakeFocusCard,
  mistakeSafetyNetCard,
  mistakeRescuePrompt,
  mistakeNotebook,
  nextStepNudgeCard,
  nextPracticeRecommendation,
  nowPlayingHudCard,
  onboardingState,
  oneLineCoachCard,
  pitchPracticeCard,
  pitchUnlockPreviewCard,
  practiceDietCard,
  proofBoosterCard,
  questionActionDockCard,
  questionCoachHint,
  questionComfortMeterCard,
  questionHintDeck,
  questionImageQuestCard,
  questionMasterySignal,
  questionMasteryStage,
  questionMiniDiagramCard,
  questionMissionStrip,
  questionPlainDecoderCard,
  questionRoleSignalCard,
  questionSignalPreview,
  questionTimeboxCard,
  recallComboCard,
  questBriefCard,
  reviewOrbitCard,
  reviewRescueQuest,
  reviewRhythmCard,
  reviewSprintCard,
  reviewStats,
  resetProgress,
  roleQuestBoardCard,
  roleSamplerCard,
  saveProgress,
  selectLearnerProfile,
  setDashboardMode,
  sevenDayLandingPath,
  sessionRhythmCard,
  signalPreviewCard,
  skillProfileCard,
  shortAnswerRecipe,
  shortAnswerSupport,
  startHereCard,
  uncertaintySafetyCard,
  zeroToLandingQuestCard
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
  const chapterGate = chapterGateStrip(progress, chapter.id);
  const hud = learningHud(progress, Date.now());
  const readiness = jobReadinessMap(progress);
  const puzzle = learningPuzzleBoard(progress);
  const summaries = chapterSummaryCards(progress);
  const proofs = abilityProofCards(progress);
  const stats = reviewStats(progress, Date.now());
  const reviewRhythm = reviewRhythmCard(progress, Date.now());
  const reviewOrbit = reviewOrbitCard(progress, Date.now());
  const reviewSprint = reviewSprintCard(progress, Date.now());
  const rescueQuest = reviewRescueQuest(progress, Date.now());
  const mistakeSafetyNet = mistakeSafetyNetCard(progress, Date.now());
  const recommendation = nextPracticeRecommendation(progress, Date.now());
  const compass = questCompass(progress, Date.now());
  const careerSnapshot = careerReadinessSnapshot(progress, Date.now());
  const roleFit = jobRoleFitCard(progress);
  const signalPassport = jobSignalPassport(progress, Date.now());
  const skillProfile = skillProfileCard(progress, Date.now());
  const evidenceBrief = jobEvidenceBrief(progress, Date.now());
  const oneLineCoach = oneLineCoachCard(progress, Date.now());
  const receiptReel = learningReceiptReel(progress);
  const recallCombo = recallComboCard(progress);
  const signalPreview = signalPreviewCard(progress, Date.now());
  const gapRadar = landingGapRadar(progress, Date.now());
  const landingMission = landingMissionStripCard(progress, Date.now());
  const landingChecklist = landingReadinessChecklist(progress, Date.now());
  const landingPath = sevenDayLandingPath(progress, Date.now());
  const exerciseScope = exerciseScopeCard();
  const dailyQuest = dailyQuestSnapshot(progress, Date.now());
  const dailyMinimum = dailyMinimumCard(progress, Date.now());
  const dailyRunMeter = dailyRunMeterCard(progress, Date.now());
  const streakShield = streakShieldCard(progress, Date.now());
  const dailySkillTicket = dailySkillTicketCard(progress, Date.now());
  const dailyLandingStep = dailyLandingStepCard(progress, Date.now());
  const dailyPhraseBank = dailyPhraseBankCard(progress);
  const momentum = dailyMomentum(progress, Date.now());
  const onboarding = onboardingState(progress);
  const firstFive = firstFiveMinuteStartCard(progress);
  const focusGuard = focusGuardCard(progress, Date.now());
  const startHere = startHereCard(progress, Date.now());
  const missionDock = beginnerMissionDockCard(progress, Date.now());
  const questBrief = questBriefCard(progress, Date.now());
  const dashboardMode = dashboardModeCard(progress);
  const practiceDiet = practiceDietCard(progress, lesson.id, Date.now());
  const choiceArcade = choiceArcadeCard(progress);
  const beginnerSkillMap = beginnerSkillMapCard(progress);
  const bossGateTeaser = bossGateTeaserCard(progress);
  const interviewPreview = interviewUnlockPreviewCard(progress);
  const pitchPreview = pitchUnlockPreviewCard(progress);
  const jobPacketPreview = jobPacketPreviewCard(progress, Date.now());
  const jobPacketShowcase = jobPacketShowcaseCard(progress, Date.now());
  const interviewReadiness = interviewReadinessDockCard(progress, Date.now());
  const zeroToLandingQuest = zeroToLandingQuestCard(progress, Date.now());
  const roleQuestBoard = roleQuestBoardCard(progress, Date.now());
  const roleSampler = roleSamplerCard(progress);
  const showFullDashboard = dashboardMode.mode === "full";
  const glossary = beginnerGlossaryCards(chapter.id);
  const jargonShield = jargonShieldCard(chapter.id);
  const jobScenario = jobScenarioCard(chapter.id);
  const bossReadiness = bossReadinessCard(progress, chapter.id);
  const skillCard = lessonSkillCard(progress, lesson.id);
  const practicePlan = lessonPracticePlan(progress, lesson.id);
  const stageRoute = lessonStageRoute(progress, lesson.id);
  const warmupCard = lessonWarmupCard(progress, lesson.id);
  const analogyBridge = lessonAnalogyBridge(lesson.id);
  const conceptDiagram = conceptDiagramCard(lesson.id);
  const masteryLadder = lessonMasteryLadder(progress, lesson.id);
  const lessonPitch = lessonPitchBuilder(progress, lesson.id);
  const ladderStrip = lessonLadderStrip(progress, lesson.id, question);
  const dueCount = stats.dueCount;
  const mastery = masteryForLesson(progress, lesson);
  const isReviewMode = sessionMode === "review";
  const isBossMode = sessionMode === "boss";
  const answerReady = isAnswerReady(question, getResponse(question));
  const sessionRhythm = sessionRhythmCard(sessionQuestions, currentIndex);
  const abilityShard = abilityShardCard(progress, question);
  const questionMission = questionMissionStrip(question, answerReady, checked, lastResult);
  const actionDock = questionActionDockCard(
    progress,
    question,
    answerReady,
    checked,
    lastResult,
    currentIndex,
    sessionQuestions.length,
    sessionMode,
    Date.now()
  );
  const roleSignal = questionRoleSignalCard(question);
  const comfortMeter = questionComfortMeterCard(question, answerReady, checked, lastResult);
  const timebox = questionTimeboxCard(question, currentIndex, sessionQuestions.length, checked, lastResult);
  const miniDiagram = questionMiniDiagramCard(question);
  const imageQuest = questionImageQuestCard(question);
  const plainDecoder = questionPlainDecoderCard(question);
  const heroMission = heroMissionPanelCard(progress, question, answerReady, checked, lastResult, Date.now());
  const nowPlaying = nowPlayingHudCard(
    progress,
    lesson,
    question,
    currentIndex,
    sessionQuestions.length,
    sessionMode,
    answerReady,
    checked,
    lastResult,
    Date.now()
  );

  const completedLessonCount = lessons.filter((item) => progress.completedLessons.includes(item.id)).length;
  const lessonPathPercent = lessons.length ? Math.round((completedLessonCount / lessons.length) * 100) : 0;
  const sessionProgressPercent = sessionQuestions.length
    ? Math.round(((currentIndex + (checked ? 1 : 0.35)) / sessionQuestions.length) * 100)
    : 0;

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
        ${renderLearningHud(hud)}
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
        <div class="lesson-map-summary" style="--lesson-path-percent: ${lessonPathPercent}%">
          <div>
            <span>Lesson Path</span>
            <strong>${lesson.title}</strong>
            <small>${lesson.chapterTitle}</small>
          </div>
          <p>${completedLessonCount}/${lessons.length} cleared</p>
          <div class="lesson-map-track"><span></span></div>
        </div>
        <div class="map">
          ${lessons
            .map((item, index) => {
              const previous = lessons[index - 1];
              const gate = gatesByChapter.get(item.chapterId);
              const chapterDivider =
                !previous || previous.chapterId !== item.chapterId
                  ? `<div class="lesson-chapter-divider">
                    <span>${item.chapterTitle}</span>
                    <small>${item.chapterTheme}</small>
                    <em>${gate?.gateLabel ?? "Open"}</em>
                  </div>`
                  : "";
              const active = index === selectedLessonIndex ? "active" : "";
              const done = progress.completedLessons.includes(item.id) ? "done" : "";
              const locked = gate?.lessonsUnlocked ? "" : "locked";
              return `${chapterDivider}<button class="lesson-pill ${active} ${done} ${locked}" data-lesson="${index}" ${locked ? "disabled" : ""}>
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
          <div class="hero-copy">
            <p class="eyebrow">${isReviewMode ? "Review Queue / 錯題重現" : isBossMode ? `${chapter.title} / Boss Quiz` : `${lesson.chapterTitle} / ${lesson.chapterTheme}`}</p>
            <h2>${isReviewMode ? "錯題複習模式" : isBossMode ? "章節 Boss Quiz" : lesson.title}</h2>
            <p>${isReviewMode ? "只練已到期或剛答錯的題目。複習答對後會重新排入下一次間隔複習。" : isBossMode ? "只用選擇題檢查整章核心判斷。答對 80% 以上就算通關。" : lesson.concept}</p>
            ${renderHeroMissionPanelCard(heroMission)}
          </div>
          <div class="visual-card" style="--visual-accent: ${visual.accent}">
            <div class="orbital">
              <span>${visual.mark}</span><span>Model</span><span>Tool</span><span>Check</span>
            </div>
            <p>${visual.caption}</p>
            <strong>${isReviewMode ? `目前排程 ${stats.scheduledCount} 題，最近答錯 ${stats.wrongCount} 題。` : isBossMode ? `目前得分 ${bossScore}/${sessionQuestions.length}` : lesson.analogy}</strong>
          </div>
        </section>
        ${renderQuestBriefCard(questBrief)}
        ${renderLandingMissionStripCard(landingMission)}
        ${renderStartHereCard(startHere)}
        ${renderBeginnerMissionDockCard(missionDock)}
        ${renderDashboardModeCard(dashboardMode)}
        ${renderOnboardingCard(onboarding)}
        ${renderFocusGuardCard(focusGuard)}
        ${renderFirstFiveMinuteStartCard(firstFive)}
        ${renderBeginnerCommandCenter({
          practiceDiet,
          choiceArcade,
          beginnerSkillMap,
          bossGateTeaser,
          interviewPreview,
          pitchPreview,
          jobPacketPreview,
          jobPacketShowcase,
          interviewReadiness,
          zeroToLandingQuest,
          roleQuestBoard,
          roleSampler,
          jargonShield,
          dailyQuest,
          dailyMinimum,
          dailyRunMeter,
          streakShield,
          dailySkillTicket,
          dailyLandingStep,
          dailyPhraseBank,
          mistakeSafetyNet,
          reviewOrbit,
          rescueQuest
        })}
        ${renderMistakeFocusCard(mistakeFocus)}
        ${renderRecommendationCard(recommendation)}
        ${renderQuestCompass(compass)}
        ${
          showFullDashboard
            ? `${renderExerciseScopeCard(exerciseScope)}
        ${renderCareerSnapshot(careerSnapshot)}
        ${renderSkillProfileCard(skillProfile)}
        ${renderJobRoleFitCard(roleFit)}
        ${renderJobSignalPassport(signalPassport)}
        ${renderLandingGapRadar(gapRadar)}
        ${renderLandingReadinessChecklist(landingChecklist)}
        ${renderSevenDayLandingPath(landingPath)}
        ${renderJobEvidenceBrief(evidenceBrief)}
        ${renderOneLineCoachCard(oneLineCoach)}
        ${renderLearningReceiptReel(receiptReel)}
        ${renderDailyMomentumCard(momentum)}
        ${renderRecallComboCard(recallCombo)}
        ${renderSignalPreviewCard(signalPreview)}
        ${renderReviewRhythmCard(reviewRhythm)}
        ${renderReviewSprintCard(reviewSprint)}
        ${renderLearningPuzzleBoard(puzzle)}
        ${renderJobScenarioCard(jobScenario)}
        ${renderBossReadinessCard(bossReadiness)}
        ${renderGlossaryCard(glossary)}
        ${renderLessonSkillCard(skillCard)}
        ${renderLessonPracticePlan(practicePlan)}
        ${renderLessonStageRoute(stageRoute)}
        ${renderLessonWarmupCard(warmupCard)}
        ${renderLessonAnalogyBridge(analogyBridge)}
        ${renderConceptDiagramCard(conceptDiagram)}
        ${renderLessonMasteryLadder(masteryLadder)}
        ${renderLessonPitchBuilder(lessonPitch)}`
            : ""
        }
        ${latestCompletion ? renderCompletionCard(latestCompletion) : ""}
        ${activePitch ? renderPitchPracticeCard(activePitch) : ""}
        ${renderNowPlayingHudCard(nowPlaying)}

        <section class="quiz-card" style="--session-progress-percent: ${Math.min(sessionProgressPercent, 100)}%">
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
          <div class="session-progress-track" aria-hidden="true"><span></span></div>
          ${renderQuestionActionDockCard(actionDock)}
          ${renderQuestion(question)}
          ${checked ? renderFeedback(question, lastResult, progress) : ""}
          ${checked ? renderNextStepNudgeCard(nextStepNudgeCard(question, lastResult, currentIndex, sessionQuestions.length, sessionMode)) : ""}
          <div class="answer-readiness ${answerReady ? "ready" : "waiting"}">
            <span>${answerReady ? "Ready" : "Waiting"}</span>
            <small>${answerReadinessText(question, answerReady, checked)}</small>
          </div>
          <div class="actions">
            <button class="primary" data-check="true" ${checked || !answerReady ? "disabled" : ""}>檢查答案</button>
            <button class="ghost compact" data-unsure="true" ${checked ? "disabled" : ""}>我還不確定</button>
            <button class="secondary" data-next="true" ${checked ? "" : "disabled"}>${currentIndex === sessionQuestions.length - 1 ? (isReviewMode ? "完成複習" : isBossMode ? "結算 Boss" : "完成本課") : "下一題"}</button>
          </div>
          ${renderLearningToolbox({
            chapterGate,
            ladderStrip,
            sessionRhythm,
            abilityShard,
            imageQuest,
            miniDiagram,
            plainDecoder,
            roleSignal,
            comfortMeter,
            timebox,
            questionMission,
            question
          })}
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
                  <em>${badge.proofLine}</em>
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
  keepActiveSidebarLessonVisible();
}

function keepActiveSidebarLessonVisible() {
  const map = document.querySelector(".map");
  const activeLesson = map?.querySelector(".lesson-pill.active");
  if (!map || !activeLesson) return;

  const activeCenter = activeLesson.offsetTop - map.offsetTop + activeLesson.offsetHeight / 2;
  map.scrollTop = Math.max(activeCenter - map.clientHeight / 2, 0);
}

function updateShortAnswerMeter(value) {
  const meter = document.querySelector("[data-short-meter]");
  if (!meter) return;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  meter.classList.toggle("started", wordCount > 0);
  meter.classList.toggle("empty", wordCount === 0);
  const count = meter.querySelector("strong");
  if (count) count.textContent = `${wordCount}`;
}

function answerReadinessText(question, ready, isChecked) {
  if (isChecked) return "Answer saved. Use Next to keep the loop moving.";
  if (ready) return "Check is unlocked. You can submit this answer now.";
  if (question.type === "single") return "Pick one option to unlock Check.";
  if (question.type === "multi") return "Add at least one option to unlock Check.";
  return "Write one tiny sentence to unlock Check.";
}

function renderSessionRhythmCard(card) {
  return `<div class="session-rhythm-card">
    <div>
      <span>${card.title}</span>
      <strong>${card.currentLabel}: ${card.currentFormat}</strong>
      <small>${card.headline}</small>
    </div>
    <div class="session-rhythm-steps">
      ${card.steps
        .map((step, index) => `<em class="${step.status} ${step.choiceBased ? "choice" : "short"}">
          <b>${index + 1}</b>
          <span>${step.label}</span>
        </em>`)
        .join("")}
    </div>
    <small>${card.promise}</small>
  </div>`;
}

function renderChapterGateStrip(card) {
  if (!card) return "";
  return `<div class="chapter-gate-strip ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.chapterTitle}</strong>
      <small>${card.headline}</small>
    </div>
    <div class="chapter-gate-steps">
      ${card.steps
        .map((step) => `<em class="${step.done ? "done" : step.id === card.activeId ? "current" : ""}">
          <b>${step.label}</b>
          ${step.text}
        </em>`)
        .join("")}
    </div>
    <small>${card.nextAction}</small>
  </div>`;
}

function renderLessonLadderStrip(card) {
  if (!card) return "";
  return `<div class="lesson-ladder-strip">
    <div>
      <span>${card.title}</span>
      <strong>${card.activeStage}: ${card.level}</strong>
      <small>${card.activeProof}</small>
    </div>
    <div class="lesson-ladder-steps">
      ${card.stages
        .map((stage) => `<em class="${stage.status}">
          <b>${stage.label}</b>
          ${stage.current}/${stage.target}
        </em>`)
        .join("")}
    </div>
    <small>${card.headline} - ${card.nextAction}</small>
  </div>`;
}

function renderAbilityShardCard(card) {
  return `<div class="ability-shard-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.chapterTitle} - ${card.stage}</small>
    </div>
    <div>
      <em>${card.shard}</em>
      <p>${card.body}</p>
      <small>${card.jobUse}</small>
    </div>
    <div>
      <b>${card.progressLabel}</b>
      <small>${card.nextUse}</small>
    </div>
  </div>`;
}

function renderQuestionRoleSignalCard(card) {
  return `<div class="question-role-signal-card">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.jobSignal}</small>
    </div>
    <div class="question-role-chips">
      ${card.chips
        .map((chip) => `<em>
          <b>${chip.label}</b>
          ${chip.value}
        </em>`)
        .join("")}
    </div>
    <small>${card.tinyProof}</small>
  </div>`;
}

function renderQuestionMiniDiagramCard(card) {
  return `<div class="question-mini-diagram-card" style="--mini-diagram-accent: ${card.accent}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.bridge}</small>
    </div>
    <div class="mini-diagram-nodes">
      ${card.nodes
        .map((node, index) => `<em class="${node.status}">
          <b>${index + 1}</b>
          <strong>${node.label}</strong>
          <small>${node.detail}</small>
        </em>`)
        .join("")}
    </div>
    <p><b>${card.mark}</b>${card.proofUse}</p>
  </div>`;
}

function renderQuestionPlainDecoderCard(card) {
  return `<div class="question-plain-decoder-card">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.skillTitle}</small>
    </div>
    <div class="plain-decoder-chips">
      ${card.chips
        .map((chip) => `<em>
          <b>${chip.label}</b>
          ${chip.text}
        </em>`)
        .join("")}
    </div>
  </div>`;
}

function renderQuestionComfortMeterCard(card) {
  return `<div class="question-comfort-meter ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.reassurance}</small>
    </div>
    <div class="comfort-bars" aria-label="${card.stage} effort meter">
      ${card.bars.map((bar) => `<i class="${bar.active ? "active" : ""}"></i>`).join("")}
    </div>
    <div class="comfort-lanes">
      ${card.lanes
        .map((lane) => `<em>
          <b>${lane.label}</b>
          ${lane.text}
        </em>`)
        .join("")}
    </div>
  </div>`;
}

function renderQuestionTimeboxCard(card) {
  return `<div class="question-timebox-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.modeLabel} / ${card.progressLabel}</small>
    </div>
    <p>${card.stopLine}</p>
    <div class="timebox-lanes">
      ${card.lanes
        .map((lane) => `<em>
          <b>${lane.label}</b>
          ${lane.text}
        </em>`)
        .join("")}
    </div>
  </div>`;
}

function renderQuestionMissionStrip(card) {
  return `<div class="question-mission-strip ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.action}</small>
    </div>
    <div class="question-mission-steps">
      ${card.steps
        .map((step) => `<em class="${step.status}">
          <b>${step.label}</b>
          ${step.text}
        </em>`)
        .join("")}
    </div>
    <div>
      <span>${card.reward}</span>
      <small>${card.proofUse}</small>
    </div>
  </div>`;
}

function renderLearningHud(hud) {
  return `<section class="learning-hud">
    <div>
      <p>${hud.title}</p>
      <strong>${hud.rank}</strong>
      <small>${hud.readinessPercent}% landing readiness</small>
    </div>
    <div class="hud-meters">
      ${hud.meters
        .map((meter) => `<span>
          <b>${meter.value}</b>
          <small>${meter.label}</small>
        </span>`)
        .join("")}
    </div>
    <div class="hud-unlock">
      <span>Next unlock</span>
      <strong>${hud.nextUnlock}</strong>
      <small>${hud.nextUnlockDetail}</small>
      <em>${hud.proofLine}</em>
      <small>${hud.nextAction}</small>
    </div>
  </section>`;
}

function renderStartHereCard(card) {
  return `<section class="start-here-card ${card.mode}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.body}</p>
      <div class="start-here-steps">
        ${card.steps
          .map((step) => `<div>
            <span>${step.label}</span>
            <strong>${step.text}</strong>
          </div>`)
          .join("")}
      </div>
      <small>${card.promise}</small>
    </div>
    <button class="primary" data-focus-action="${card.action.kind}" data-focus-target="${card.action.target}">
      ${card.actionLabel}
    </button>
  </section>`;
}

function renderBeginnerMissionDockCard(card) {
  return `<section class="mission-dock-card">
    <div class="mission-dock-copy">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.summary}</p>
    </div>
    <div class="mission-dock-lanes">
      ${card.lanes
        .map((lane) => `<div class="${lane.status}">
          <span>${lane.label}</span>
          <strong>${lane.value}</strong>
          <small>${lane.detail}</small>
        </div>`)
        .join("")}
    </div>
    <div class="mission-dock-action">
      <div>
        <span>${card.progressLabel}</span>
        <strong>${card.nextMove}</strong>
        <small>${card.reassurance}</small>
      </div>
      <button class="primary compact" data-focus-action="${card.action.kind}" data-focus-target="${card.action.target}">
        ${card.actionLabel}
      </button>
    </div>
  </section>`;
}

function renderQuestBriefCard(card) {
  return `<section class="quest-brief-card ${card.mode}">
    <div class="quest-brief-copy">
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.body}</p>
      <strong>${card.reward}</strong>
    </div>
    <div class="quest-brief-lanes">
      ${card.lanes
        .map((lane) => `<div class="${lane.done ? "done" : "active"}">
          <span>${lane.label}</span>
          <small>${lane.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="quest-brief-action">
      <div>
        <span>${card.packetProgress}</span>
        <small>${card.packetFocus}</small>
      </div>
      <button class="primary compact" data-quest-brief-action="true">${card.headline}</button>
    </div>
    <p class="quest-brief-reassurance">${card.reassurance}</p>
  </section>`;
}

function renderLandingMissionStripCard(card) {
  return `<section class="landing-mission-strip ${card.status}">
    <div class="landing-mission-copy">
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.activeProof}</p>
      <strong>${card.activeLine}</strong>
    </div>
    <div class="landing-mission-route">
      ${card.route
        .map((step) => `<span class="${step.status}">
          <b>${step.number}</b>
          ${step.label}
        </span>`)
        .join("")}
    </div>
    <div class="landing-mission-action">
      <em>${card.percent}%</em>
      <small>${card.packetProgress}</small>
      <small>${card.checklistProgress}</small>
      <button class="primary compact" data-landing-strip-action="true">${card.nextAction}</button>
    </div>
    <small>${card.promise}</small>
  </section>`;
}

function renderHeroMissionPanelCard(card) {
  if (!card) return "";
  return `<div class="hero-mission-panel ${card.status}">
    <div class="hero-mission-head">
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.subline}</small>
    </div>
    <div class="hero-mission-lanes">
      ${card.lanes
        .map((lane) => `<div class="${lane.status}">
          <span>${lane.label}</span>
          <strong>${lane.value}</strong>
          <small>${lane.text}</small>
        </div>`)
        .join("")}
    </div>
    <em>${card.reassurance}</em>
  </div>`;
}

function renderNowPlayingHudCard(card) {
  if (!card) return "";
  return `<section class="now-playing-hud ${card.status}">
    <div class="now-playing-main">
      <div>
        <p class="eyebrow">${card.title} / ${card.modeLabel}</p>
        <h3>${card.headline}</h3>
        <p>${card.chapterTitle} / ${card.lessonTitle}</p>
      </div>
      <div class="now-playing-progress">
        <span>${card.questionLabel}</span>
        <small>current prompt</small>
        <i style="--now-progress: ${card.percent}%"></i>
      </div>
    </div>
    <strong>${card.prompt}</strong>
    <div class="now-playing-lanes">
      ${card.lanes
        .map((lane) => `<em class="${lane.status}">
          <b>${lane.label}</b>
          ${lane.text}
        </em>`)
        .join("")}
    </div>
    <div class="now-playing-action">
      <span>${card.action}</span>
      <small>${card.reward} / ${card.nextUse}</small>
    </div>
  </section>`;
}

function renderQuestionActionDockCard(card) {
  if (!card) return "";
  return `<div class="question-action-dock ${card.status}">
    <div class="question-action-dock-head">
      <div>
        <span>${card.title}</span>
        <strong>${card.headline}</strong>
      </div>
      <em>${card.progressLabel}</em>
    </div>
    <div class="question-action-dock-steps">
      ${card.lanes
        .map((lane) => `<div class="${lane.status}">
          <span>${lane.label}</span>
          <small>${lane.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="question-action-dock-proof">
      <strong>${card.currentAction}</strong>
      <small>${card.proofLine}</small>
    </div>
  </div>`;
}

function renderLearningToolbox(cards) {
  return `<details class="learning-toolbox">
    <summary>
      <div>
        <span>Learning Toolbox</span>
        <strong>Open visual map, hints, and route support</strong>
      </div>
      <small>Optional help stays out of the way until you need it.</small>
    </summary>
    <div class="learning-toolbox-grid">
      ${renderQuestionImageQuestCard(cards.imageQuest)}
      ${renderQuestionMiniDiagramCard(cards.miniDiagram)}
      ${renderQuestionPlainDecoderCard(cards.plainDecoder)}
      ${renderQuestionHintDeck(questionHintDeck(cards.question), cards.question)}
      ${renderQuestionComfortMeterCard(cards.comfortMeter)}
      ${renderQuestionTimeboxCard(cards.timebox)}
      ${renderQuestionMissionStrip(cards.questionMission)}
      ${renderQuestionRoleSignalCard(cards.roleSignal)}
      ${renderAbilityShardCard(cards.abilityShard)}
      ${renderSessionRhythmCard(cards.sessionRhythm)}
      ${renderLessonLadderStrip(cards.ladderStrip)}
      ${renderChapterGateStrip(cards.chapterGate)}
    </div>
  </details>`;
}

function renderQuestionImageQuestCard(card) {
  if (!card) return "";
  return `<div class="question-image-quest-card" style="--image-quest-accent: ${card.accent}">
    <div class="image-quest-preview">
      <b>${card.mark}</b>
      <span>${card.stage}</span>
    </div>
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <p>${card.visualCue}</p>
      <small>${card.guardrail}</small>
    </div>
    <div class="image-quest-panels">
      ${card.panels
        .map((panel) => `<em>
          <b>${panel.label}</b>
          ${panel.text}
        </em>`)
        .join("")}
    </div>
    <code>${card.imagePrompt}</code>
    <small>${card.proofUse}</small>
  </div>`;
}

function renderQuestion(question) {
  if (question.type === "single") {
    return `<div class="choices">${question.choices
      .map((choice, index) => {
        const selected = selectedSingle === index;
        return `<button class="choice ${selected ? "selected" : ""}" data-single="${index}" aria-pressed="${selected}">
          <span class="choice-token">${choiceToken(index)}</span>
          <span class="choice-copy">
            <strong>${choice}</strong>
            <small>Pick one answer, then check.</small>
          </span>
          <em>${selected ? "Selected" : "Pick"}</em>
        </button>`;
      })
      .join("")}</div>`;
  }
  if (question.type === "multi") {
    return `<div class="multi-select-meter">
      <strong>${selectedMulti.size}</strong>
      <span>selected</span>
      <small>Add every option that belongs, then check.</small>
    </div>
    <div class="choices">${question.choices
      .map((choice, index) => {
        const selected = selectedMulti.has(index);
        return `<button class="choice ${selected ? "selected" : ""}" data-multi="${index}" aria-pressed="${selected}">
          <span class="choice-token">${choiceToken(index)}</span>
          <span class="choice-copy">
            <strong>${choice}</strong>
            <small>Multi-select is allowed here.</small>
          </span>
          <em>${selected ? "Added" : "Add"}</em>
        </button>`;
      })
      .join("")}</div><p class="hint">可複選，選完再檢查。</p>`;
  }
  const shortWords = shortAnswer.trim() ? shortAnswer.trim().split(/\s+/).length : 0;
  return `${renderShortAnswerSupport(shortAnswerSupport(question))}
    ${renderShortAnswerRecipe(shortAnswerRecipe(question))}
    <div class="short-answer-meter ${shortAnswer.trim() ? "started" : "empty"}" data-short-meter="true" data-min-matches="${question.minMatches}">
      <strong>${shortWords}</strong>
      <span>words</span>
      <small>A tiny answer can pass when it uses ${question.minMatches} key concept${question.minMatches === 1 ? "" : "s"}.</small>
    </div>
    <textarea class="short-input" placeholder="用一句話回答即可，不需要寫程式。">${shortAnswer}</textarea>`;
}

function choiceToken(index) {
  return String.fromCharCode(65 + index);
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
      <em class="completion-role-signal">${card.roleSignal}</em>
      ${renderCompletionProofDock(card.proofDock)}
      <div class="completion-reward-strip">
        ${card.rewards
          .map((reward) => `<div>
            <span>${reward.label}</span>
            <small>${reward.detail}</small>
          </div>`)
          .join("")}
      </div>
      <div class="completion-exit-ticket">
        ${(card.exitTicket ?? [])
          .map((item) => `<div>
            <span>${item.label}</span>
            <small>${item.text}</small>
          </div>`)
          .join("")}
      </div>
      <span>${card.nextAction}</span>
      <button class="secondary compact" data-dismiss-completion="true">繼續練習</button>
    </div>
  </section>`;
}

function renderCompletionProofDock(dock) {
  if (!dock) return "";
  return `<div class="completion-proof-dock ${dock.status}">
    <div>
      <span>${dock.title}</span>
      <strong>${dock.headline}</strong>
      <small>${dock.summary}</small>
    </div>
    <div class="completion-proof-items">
      ${dock.items
        .map((item) => `<div class="${item.done ? "done" : "open"}">
          <span>${item.label}</span>
          <small>${item.text}</small>
        </div>`)
        .join("")}
    </div>
  </div>`;
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

function renderDashboardModeCard(card) {
  return `<section class="dashboard-mode-card ${card.mode}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.body}</p>
      <div class="dashboard-mode-tags">
        ${card.visibleGroups.map((group) => `<span>${group}</span>`).join("")}
      </div>
    </div>
    <button class="secondary compact" data-dashboard-mode="${card.nextMode}">${card.actionLabel}</button>
  </section>`;
}

function renderPracticeDietCard(card) {
  if (!card) return "";
  return `<section class="practice-diet-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.choicePercent}% choice-based</p>
    </div>
    <p>${card.description}</p>
    <div class="practice-diet-formats">
      ${card.formats
        .map((format) => `<div>
          <span>${format.count}</span>
          <strong>${format.label}</strong>
          <small>${format.attempted}/${format.count} tried - ${format.role}</small>
        </div>`)
        .join("")}
    </div>
    <div class="practice-diet-rules">
      ${card.rules
        .map((rule) => `<div>
          <span>${rule.label}</span>
          <small>${rule.detail}</small>
        </div>`)
        .join("")}
    </div>
    <div class="practice-diet-action">
      <small>${card.promise}</small>
      <button class="primary compact" data-practice-diet-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderBeginnerCommandCenter(cards) {
  return `<section class="beginner-command-center">
    ${renderBeginnerRouteRail(cards)}
    <div class="beginner-command-group route" data-beginner-section="route">
      <div class="beginner-section-heading">
        <div>
          <p class="eyebrow">Beginner Route</p>
          <h3>Learn by tiny choices, visible proof, and scheduled review</h3>
        </div>
        <p>No setup, no project gate, no blank-page writing.</p>
      </div>
      <div class="beginner-command-grid path">
        ${renderPracticeDietCard(cards.practiceDiet)}
        ${renderChoiceArcadeCard(cards.choiceArcade)}
        ${renderBeginnerSkillMapCard(cards.beginnerSkillMap)}
        ${renderBossGateTeaserCard(cards.bossGateTeaser)}
        ${renderInterviewUnlockPreviewCard(cards.interviewPreview)}
        ${renderPitchUnlockPreviewCard(cards.pitchPreview)}
        ${renderJobPacketPreviewCard(cards.jobPacketPreview)}
        ${renderJobPacketShowcaseCard(cards.jobPacketShowcase)}
        ${renderInterviewReadinessDockCard(cards.interviewReadiness)}
        ${renderZeroToLandingQuestCard(cards.zeroToLandingQuest)}
        ${renderRoleQuestBoardCard(cards.roleQuestBoard)}
        ${renderRoleSamplerCard(cards.roleSampler)}
        ${renderJargonShieldCard(cards.jargonShield)}
      </div>
    </div>

    <div class="beginner-command-group daily" data-beginner-section="daily">
      <div class="beginner-section-heading compact">
        <div>
          <p class="eyebrow">Daily Loop</p>
          <h3>One small ticket can still move the path</h3>
        </div>
        <p>Stop after the minimum or keep the proof trail warm.</p>
      </div>
      <div class="beginner-command-grid daily">
        ${renderDailyRunMeterCard(cards.dailyRunMeter)}
        ${renderStreakShieldCard(cards.streakShield)}
        ${renderDailyQuestSnapshot(cards.dailyQuest)}
        ${renderDailyMinimumCard(cards.dailyMinimum)}
        ${renderDailySkillTicketCard(cards.dailySkillTicket)}
        ${renderDailyLandingStepCard(cards.dailyLandingStep)}
        ${renderDailyPhraseBankCard(cards.dailyPhraseBank)}
      </div>
    </div>

    <div class="beginner-command-group review" data-beginner-section="review">
      <div class="beginner-section-heading compact">
        <div>
          <p class="eyebrow">Review Loop</p>
          <h3>Weak signals come back before they fade</h3>
        </div>
        <p>Mistakes become scheduled cards, not dead ends.</p>
      </div>
      <div class="beginner-command-grid review">
        ${renderMistakeSafetyNetCard(cards.mistakeSafetyNet)}
        ${renderReviewOrbitCard(cards.reviewOrbit)}
        ${renderReviewRescueQuest(cards.rescueQuest)}
      </div>
    </div>
  </section>`;
}

function renderBeginnerRouteRail(cards) {
  const routeDone = cards.beginnerSkillMap.completedCount;
  const routeTotal = cards.beginnerSkillMap.totalCount;
  const dailyDone = cards.dailySkillTicket.completedCount;
  const dailyTotal = cards.dailySkillTicket.totalCount;
  const packetDone = cards.jobPacketPreview.readyCount;
  const packetTotal = cards.jobPacketPreview.totalCount;
  const reviewMode = cards.reviewOrbit.mode;
  const reviewLabel =
    reviewMode === "due"
      ? `${cards.reviewOrbit.dueCount} due`
      : `${cards.reviewOrbit.scheduledCount} scheduled`;
  return `<div class="beginner-route-rail">
    <button type="button" class="active" data-beginner-jump="route">
      <span>01</span>
      <strong>Route</strong>
      <small>${routeDone}/${routeTotal} mastered</small>
    </button>
    <button type="button" class="${cards.dailySkillTicket.status}" data-beginner-jump="daily">
      <span>02</span>
      <strong>Daily</strong>
      <small>${dailyDone}/${dailyTotal} stamps</small>
    </button>
    <button type="button" class="${cards.jobPacketPreview.status}" data-beginner-jump="packet">
      <span>03</span>
      <strong>Packet</strong>
      <small>${packetDone}/${packetTotal} pieces</small>
    </button>
    <button type="button" class="${reviewMode}" data-beginner-jump="review">
      <span>04</span>
      <strong>Review</strong>
      <small>${reviewLabel}</small>
    </button>
  </div>`;
}

function renderChoiceArcadeCard(card) {
  return `<section class="choice-arcade-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.choicePercent}% choice-based - ${card.completedCount}/${card.totalCount} rooms</p>
    </div>
    <div class="choice-arcade-rooms">
      ${card.rooms
        .map((room) => `<div class="${room.status}">
          <span>${room.format}</span>
          <strong>${room.label}</strong>
          <small>${room.proof}</small>
          <em>${room.reward}</em>
        </div>`)
        .join("")}
    </div>
    <div class="choice-arcade-action">
      <div>
        <strong>${card.activeReward}</strong>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-choice-arcade-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderBeginnerSkillMapCard(card) {
  return `<section class="beginner-skill-map-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.completedCount}/${card.totalCount} mastered - ${card.unlockedCount} unlocked</p>
    </div>
    <div class="beginner-skill-map-nodes">
      ${card.nodes.map((node) => `<div class="${node.status}">
        <span>${node.order}</span>
        <strong>${node.title}</strong>
        <small>${node.label} - ${node.percent}%</small>
      </div>`).join("")}
    </div>
    <div class="beginner-skill-gate-path">
      ${card.activePath.map((gate) => `<div class="${gate.status}">
        <span>${gate.label}</span>
        <strong>${gate.text}</strong>
      </div>`).join("")}
    </div>
    <div class="beginner-skill-map-action">
      <div>
        <strong>${card.activeSkill}</strong>
        <small>${card.activeNext}</small>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-beginner-skill-map-action="true">Continue map</button>
    </div>
  </section>`;
}

function renderBossGateTeaserCard(card) {
  if (!card) return "";
  return `<section class="boss-gate-teaser-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.progress} - ${card.chapterTitle}</p>
    </div>
    <p>${card.reward}</p>
    <div class="boss-gate-steps">
      ${card.steps
        .map((step) => `<div class="${step.done ? "done" : ""}">
          <span>${step.label}</span>
          <strong>${step.text}</strong>
        </div>`)
        .join("")}
    </div>
    <div class="boss-gate-action">
      <div>
        <strong>${card.unlock}</strong>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-boss-gate-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderInterviewUnlockPreviewCard(card) {
  if (!card) return "";
  return `<section class="interview-preview-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.answeredCount}/${card.totalCount} - ${card.chapterTitle}</p>
    </div>
    <p>${card.unlock}</p>
    <strong>${card.prompt}</strong>
    <div class="interview-preview-steps">
      ${card.steps
        .map((step) => `<div class="${step.done ? "done" : ""}">
          <span>${step.label}</span>
          <small>${step.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="interview-preview-action">
      <small>${card.promise}</small>
      <button class="primary compact" data-interview-preview-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderPitchUnlockPreviewCard(card) {
  if (!card) return "";
  return `<section class="pitch-unlock-preview-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.chapterTitle}</p>
    </div>
    <p>${card.prompt}</p>
    <div class="pitch-preview-lines">
      ${card.lines
        .map((line) => `<div>
          <span>${line.label}</span>
          <strong>${line.text}</strong>
        </div>`)
        .join("")}
    </div>
    <div class="pitch-preview-checks">
      ${card.checks
        .map((check) => `<small class="${check.done ? "done" : ""}">${check.label}</small>`)
        .join("")}
    </div>
    <div class="pitch-preview-action">
      <small>${card.promise}</small>
      <button class="primary compact" data-pitch-preview-action="${card.chapterId}">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderJobPacketPreviewCard(card) {
  if (!card) return "";
  return `<section class="job-packet-preview-card ${card.status}">
    <div class="job-packet-header">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
        <p>${card.summary}</p>
      </div>
      <div class="job-packet-score">
        <strong>${card.readyCount}/${card.totalCount}</strong>
        <span>ready</span>
      </div>
    </div>
    <div class="job-packet-items">
      ${card.items
        .map((item) => `<div class="${item.done ? "done" : ""}">
          <span>${item.done ? "Ready" : "Next"}</span>
          <strong>${item.label}</strong>
          <small>${item.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="job-packet-action">
      <small>${card.promise}</small>
      <button class="primary compact" data-job-packet-action="${card.action.chapterId ?? ""}">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderJobPacketShowcaseCard(card) {
  if (!card) return "";
  return `<section class="job-packet-showcase-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.status}</p>
    </div>
    <p class="showcase-summary">${card.summary}</p>
    <div class="packet-showcase-lines">
      ${card.lines
        .map((line, index) => `<div>
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${line.label}</strong>
          <small>${line.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="packet-showcase-rehearsal">
      <strong>${card.rehearsal}</strong>
      <small>${card.promise}</small>
    </div>
  </section>`;
}

function renderInterviewReadinessDockCard(card) {
  if (!card) return "";
  return `<section class="interview-readiness-dock-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.progressLabel}</p>
    </div>
    <p>${card.summary}</p>
    <div class="interview-readiness-lanes">
      ${card.lanes
        .map((lane) => `<div class="${lane.done ? "done" : "open"}">
          <span>${lane.label}</span>
          <small>${lane.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="interview-readiness-action">
      <div>
        <strong>${card.activeLabel}</strong>
        <small>${card.activeLine}</small>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-interview-readiness-action="${card.action.chapterId ?? ""}">${card.actionLabel}</button>
    </div>
  </section>`;
}

function renderZeroToLandingQuestCard(card) {
  return `<section class="zero-landing-quest-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.completedCount}/${card.totalCount} - ${card.percent}%</p>
    </div>
    <div class="zero-landing-milestones">
      ${card.milestones
        .map((milestone, index) => `<div class="${milestone.status}">
          <span>${index + 1}</span>
          <strong>${milestone.label}</strong>
          <small>${milestone.proof}</small>
        </div>`)
        .join("")}
    </div>
    <div class="zero-landing-action">
      <div>
        <strong>${card.activeProof}</strong>
        <em>${card.activeLine}</em>
        <small>${card.activeUse}</small>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-zero-landing-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderRoleQuestBoardCard(card) {
  return `<section class="role-quest-board-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.progressLabel}</p>
    </div>
    <p>${card.summary}</p>
    <div class="role-quest-lanes">
      ${card.tracks
        .map((track) => `<div class="${track.status}">
          <span>${track.level}</span>
          <strong>${track.title}</strong>
          <small>${track.readyCount}/${track.total} ready / ${track.practicingCount} practicing</small>
          <div class="role-quest-steps">
            ${track.steps
              .map((step) => `<em class="${step.done ? "done" : ""}">
                <b>${step.label}</b>
                ${step.text}
              </em>`)
              .join("")}
          </div>
          <small>${track.nextGap}</small>
        </div>`)
        .join("")}
    </div>
    <div class="role-quest-action">
      <div>
        <strong>${card.activeRole}</strong>
        <span>${card.activeMove}</span>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-role-quest-action="true" ${card.action.type === "locked" ? "disabled" : ""}>${card.actionLabel}</button>
    </div>
  </section>`;
}

function renderRoleSamplerCard(card) {
  return `<section class="role-sampler-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.progressLabel} - ${card.summary}</p>
    </div>
    <div class="role-sampler-grid">
      ${card.tracks.map((track) => `<div class="${track.sampled ? "sampled" : "try-next"}">
        <span>${track.statusLabel}</span>
        <strong>${track.title}</strong>
        <p>${track.samplePrompt}</p>
        <small>${track.sampleRoute}</small>
        <small>${track.level}</small>
        <small>${track.choiceMove}</small>
      </div>`).join("")}
    </div>
    <div class="role-sampler-action">
      <strong>${card.activeRole}</strong>
      <span>${card.activeRoute}</span>
      <span>${card.activeMove}</span>
      <small>${card.nextAction}</small>
    </div>
    <em>${card.promise}</em>
  </section>`;
}

function renderJargonShieldCard(card) {
  return `<section class="jargon-shield-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.promise}</p>
    </div>
    <p>${card.body}</p>
    <div class="jargon-shield-terms">
      ${card.terms
        .map((term) => `<div>
          <strong>${term.term}</strong>
          <p>${term.plain}</p>
          <small>${term.cue}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderQuestCompass(compass) {
  return `<section class="quest-compass ${compass.missionType}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${compass.title}</p>
        <h3>${compass.target}</h3>
      </div>
      <p>${compass.receiptCount} recent receipts - unlock: ${compass.unlock}</p>
    </div>
    <p>${compass.why}</p>
    <strong>${compass.reward}</strong>
    <div class="compass-steps">
      ${compass.steps
        .map((step) => `<div>
          <span>${step.label}</span>
          <small>${step.text}</small>
        </div>`)
        .join("")}
    </div>
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

function renderSkillProfileCard(card) {
  return `<section class="skill-profile-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.readiness}</p>
    </div>
    <p>${card.summaryLine}</p>
    <div class="skill-profile-metrics">
      ${card.metrics
        .map((metric) => `<div>
          <span>${metric.value}</span>
          <small>${metric.label}</small>
        </div>`)
        .join("")}
    </div>
    <div class="skill-profile-highlights">
      ${card.proofHighlights
        .map((proof) => `<div class="${proof.status}">
          <span>${proof.status}</span>
          <strong>${proof.title}</strong>
          <small>${proof.text}</small>
        </div>`)
        .join("")}
    </div>
    <div class="skill-profile-lines">
      ${card.lines
        .map((line) => `<div>
          <span>${line.label}</span>
          <strong>${line.text}</strong>
        </div>`)
        .join("")}
    </div>
    <small class="skill-profile-next">${card.roleSignal} - ${card.nextProof.title}: ${card.nextProof.action}</small>
  </section>`;
}

function renderJobRoleFitCard(card) {
  return `<section class="job-role-fit-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.headline}</p>
        <h3>${card.summary}</h3>
      </div>
      <p>每條路線都只用選擇題、少量簡答、Boss 和面試情境題累積證據。</p>
    </div>
    <div class="role-fit-grid">
      ${card.tracks
        .map((track, index) => `<div class="role-fit-track ${track.level.replaceAll(" ", "-")}">
          <span>${track.level}</span>
          <strong>${track.title}</strong>
          <p>${track.description}</p>
          <p class="role-proof-line">${track.proofLine}</p>
          <div class="role-skill-chips">
            ${track.skillChips
              .map((chip) => `<small class="${chip.state}">
                <span>${chip.label}</span>
                <em>${chip.detail}</em>
              </small>`)
              .join("")}
          </div>
          <small>${track.readyCount}/${track.total} ready · ${track.practicingCount} practicing</small>
          <em>${track.nextGap}</em>
          <small>${track.nextAction}</small>
          <button class="secondary compact role-fit-action" data-role-practice="${index}" ${track.recommendedPractice.type === "locked" ? "disabled" : ""}>${track.recommendedPractice.cta}</button>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderJobSignalPassport(passport) {
  return `<section class="job-signal-passport ${passport.status.replaceAll(" ", "-")}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${passport.title}</p>
        <h3>${passport.summary}</h3>
      </div>
      <p>${passport.status}</p>
    </div>
    <div class="passport-stamps">
      ${passport.stamps
        .map((stamp) => `<div>
          <span>${stamp.label}</span>
          <strong>${stamp.value}</strong>
          <small>${stamp.detail}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderLandingGapRadar(radar) {
  return `<section class="landing-gap-radar ${radar.mode}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${radar.title}</p>
        <h3>${radar.headline}</h3>
      </div>
      <p>${radar.percent}% ready - ${radar.progress}</p>
    </div>
    <p>${radar.why}</p>
    <strong>${radar.microMove}</strong>
    <small>${radar.after}</small>
    <div class="gap-radar-steps">
      ${radar.steps
        .map((step) => `<div>
          <span>${step.label}</span>
          <small>${step.text}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderLandingReadinessChecklist(card) {
  return `<section class="landing-checklist-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Landing Checklist</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.completedCount}/${card.totalCount} gates ready - ${card.nextAction}</p>
    </div>
    <div class="landing-meter">
      <strong>${card.percent}%</strong>
      <span>${card.activeTitle}</span>
    </div>
    <div class="landing-checklist-grid">
      ${card.items
        .map((item) => `<div class="landing-check ${item.done ? "done" : ""}">
          <span>${item.done ? "ready" : `${item.current}/${item.target}`}</span>
          <strong>${item.title}</strong>
          <small>${item.proof}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderSevenDayLandingPath(path) {
  return `<section class="seven-day-path-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${path.title}</p>
        <h3>${path.headline}</h3>
      </div>
      <p>${path.completedCount}/${path.totalCount} steps - ${path.percent}%</p>
    </div>
    <div class="seven-day-action-row">
      <div>
        <strong>${path.activeAction}</strong>
        <small>${path.activeSignal}</small>
      </div>
      <button class="primary compact" data-seven-day-action="true">${path.nextRecommendation}</button>
    </div>
    <div class="seven-day-grid">
      ${path.days
        .map((day) => `<div class="${day.done ? "done" : ""}">
          <span>Day ${day.day}</span>
          <strong>${day.title}</strong>
          <small>${day.done ? "Ready" : day.action}</small>
        </div>`)
        .join("")}
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
      <div class="evidence-story-seeds">
        ${brief.storySeeds
          .map((seed) => `<div>
            <span>${seed.label}</span>
            <small>${seed.text}</small>
          </div>`)
          .join("")}
      </div>
    </div>
    <div class="evidence-meter">
      <span>${brief.readyCount}/${brief.total}</span>
      <small>ready evidence</small>
      <em>${brief.nextGap} · ${brief.nextAction}</em>
    </div>
  </section>`;
}

function renderOneLineCoachCard(card) {
  if (!card) return "";
  return `<section class="one-line-coach-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.cue}</p>
    </div>
    <div class="one-line-grid">
      ${card.lines
        .map((line) => `<div>
          <span>${line.label}</span>
          <strong>${line.text}</strong>
        </div>`)
        .join("")}
    </div>
    <small>${card.proofLink}</small>
  </section>`;
}

function renderLearningReceiptReel(reel) {
  return `<section class="learning-receipt-reel">
    <div class="section-title">
      <div>
        <p class="eyebrow">Learning Receipts</p>
        <h3>${reel.title}</h3>
      </div>
      <p>${reel.headline}</p>
    </div>
    ${
      reel.receipts.length === 0
        ? `<p class="receipt-empty">${reel.emptyAction}</p>`
        : `<div class="receipt-grid">
          ${reel.receipts
            .map((receipt) => `<div class="receipt ${receipt.status}">
              <span>${receipt.resultLabel}</span>
              <strong>${receipt.stage} - ${receipt.chapterTitle}</strong>
              <p>${receipt.evidenceHeadline}</p>
              <em>${receipt.evidenceLine}</em>
              <small>${receipt.evidenceUseCase}</small>
              <small>${receipt.nextUse}</small>
            </div>`)
            .join("")}
        </div>`
    }
  </section>`;
}

function renderExerciseScopeCard(scope) {
  return `<section class="exercise-scope-card">
    <div>
      <p class="eyebrow">Practice Scope</p>
      <h3>${scope.headline}</h3>
      <p>${scope.description}</p>
      <div class="scope-guardrails">
        ${scope.guardrails.map((item) => `<span>${item}</span>`).join("")}
      </div>
    </div>
    <div class="scope-formats">
      ${scope.formats
        .map((item) => `<div class="${item.tone}">
          <strong>${item.count}</strong>
          <span>${item.label}</span>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderDailyQuestSnapshot(snapshot) {
  return `<section class="daily-quest-snapshot">
    <div>
      <p class="eyebrow">Daily Quest</p>
      <h3>${snapshot.completedCount}/${snapshot.totalCount} 今日任務完成</h3>
      <p>${snapshot.nextStep}</p>
      <small>${snapshot.activeReason}</small>
    </div>
    <div class="quest-meter">
      <strong>${snapshot.percent}%</strong>
      <span>${snapshot.activeTitle}</span>
    </div>
  </section>`;
}

function renderDailyRunMeterCard(card) {
  return `<section class="daily-run-meter-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.doneCount}/${card.totalCount} steps - ${card.percent}%</p>
    </div>
    <div class="daily-run-track" style="--daily-run-percent: ${card.percent}%">
      <span></span>
    </div>
    <div class="daily-run-steps">
      ${card.steps
        .map((step) => `<div class="${step.done ? "done" : step.id === card.activeId ? "active" : ""}">
          <span>${step.label}</span>
          <strong>${step.text}</strong>
        </div>`)
        .join("")}
    </div>
    <div class="daily-run-footer">
      <strong>${card.activeLabel}</strong>
      <small>${card.nextAction}</small>
      <small>${card.promise}</small>
    </div>
  </section>`;
}

function renderStreakShieldCard(card) {
  return `<section class="streak-shield-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.streakLabel}</p>
    </div>
    <p>${card.summary}</p>
    <div class="streak-shield-lanes">
      ${card.lanes
        .map(
          (lane) => `<div class="${lane.done ? "done" : lane.id === "today" ? "active" : ""}">
            <span>${lane.label}</span>
            <small>${lane.text}</small>
          </div>`
        )
        .join("")}
    </div>
    <div class="streak-shield-action">
      <small>${card.promise}</small>
      <button class="primary compact" data-streak-shield-action="true">${card.actionLabel}</button>
    </div>
  </section>`;
}

function renderDailyMinimumCard(card) {
  return `<section class="daily-minimum-card ${card.status}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.body}</p>
    </div>
    <div>
      <strong>${card.doneCount}/${card.totalCount}</strong>
      <span>${card.nextAction}</span>
      <div class="minimum-checks">
        ${card.checks
          .map((check) => `<small class="${check.done ? "done" : ""}">${check.label}</small>`)
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderDailySkillTicketCard(card) {
  return `<section class="daily-skill-ticket-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.completedCount}/${card.totalCount} stamps - ${card.activeReward}</p>
    </div>
    <div class="daily-skill-ticket-lanes">
      ${card.lanes.map((lane) => `<div class="${lane.status}">
        <span>${lane.format}</span>
        <strong>${lane.label}</strong>
        <small>${lane.reward}</small>
      </div>`).join("")}
    </div>
    <div class="daily-skill-ticket-action">
      <div>
        <strong>${card.activeFormat}</strong>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-daily-skill-ticket-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderDailyLandingStepCard(card) {
  return `<section class="daily-landing-step-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.nextAction}</p>
    </div>
    <div class="daily-landing-route">
      ${card.route
        .map((step) => `<div>
          <span>${step.label}</span>
          <strong>${step.text}</strong>
        </div>`)
        .join("")}
    </div>
    <div class="daily-landing-proof">
      <span>${card.minimumAction}</span>
      <span>${card.abilityPiece}</span>
      <span>${card.jobUse}</span>
    </div>
    <small>${card.promise}</small>
  </section>`;
}

function renderDailyPhraseBankCard(card) {
  return `<section class="daily-phrase-bank-card ${card.status}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.latestLine}</p>
      <small>${card.latestUse}</small>
      <small class="phrase-bank-role">${card.roleUse}</small>
    </div>
    <div>
      <strong>${card.proofCount}</strong>
      <span>saved</span>
      <strong>${card.repairCount}</strong>
      <span>repair</span>
      <span class="phrase-bank-role-chip">${card.roleSignal}</span>
    </div>
    <div class="phrase-bank-steps">
      ${card.rehearsalSteps.map((step) => `<small>
        <b>${step.label}</b>
        ${step.text}
      </small>`).join("")}
    </div>
    ${card.achievementLine ? `<div class="phrase-bank-achievement">
      <span>${card.achievementTitle}</span>
      <strong>${card.achievementLine}</strong>
      <small>${card.achievementUse}</small>
    </div>` : ""}
    <em>${card.nextAction}</em>
    <small>${card.promise}</small>
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

function renderRecallComboCard(combo) {
  return `<section class="recall-combo-card ${combo.mode}">
    <div>
      <p class="eyebrow">${combo.title}</p>
      <h3>${combo.headline}</h3>
      <p>${combo.proofLine}</p>
      <strong>${combo.nextAction}</strong>
    </div>
    <div class="combo-meter-grid">
      ${combo.meters
        .map((meter) => `<div>
          <span>${meter.value}</span>
          <small>${meter.label}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderSignalPreviewCard(preview) {
  return `<section class="signal-preview-card ${preview.mode}">
    <div>
      <p class="eyebrow">${preview.title}</p>
      <h3>${preview.headline}</h3>
      <p>${preview.reason}</p>
      <strong>${preview.reuse}</strong>
    </div>
    <div>
      <span>${preview.nextAction}</span>
      <div class="signal-preview-stats">
        <small>${preview.receiptCount} receipts</small>
        <small>${preview.cleanRun} clean run</small>
        <small>${preview.passportStatus}</small>
      </div>
      <div class="signal-preview-steps">
        ${preview.steps
          .map((step) => `<em>
            <b>${step.label}</b>
            ${step.text}
          </em>`)
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderReviewRhythmCard(card) {
  return `<section class="review-rhythm-card ${card.dueNow > 0 ? "due" : "calm"}">
    <div>
      <p class="eyebrow">${card.headline}</p>
      <h3>${card.status}</h3>
      <p>${card.proofLine}</p>
      <strong>${card.nextAction}</strong>
    </div>
    <div class="rhythm-grid">
      <div>
        <span>${card.dueNow}</span>
        <small>due now</small>
      </div>
      <div>
        <span>${card.next24h}</span>
        <small>next 24h</small>
      </div>
      <div>
        <span>${card.next7d}</span>
        <small>next 7d</small>
      </div>
      <div>
        <span>${card.wrongCount}</span>
        <small>mistakes</small>
      </div>
    </div>
  </section>`;
}

function renderReviewOrbitCard(card) {
  return `<section class="review-orbit-card ${card.mode}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.scheduledCount} scheduled - ${card.dueCount} due</p>
    </div>
    <div class="review-orbit-rings">
      ${card.rings.map((ring) => `<div class="${ring.status}">
        <span>${ring.label}</span>
        <strong>${ring.count}</strong>
        <small>${ring.role}</small>
      </div>`).join("")}
    </div>
    <div class="review-orbit-action">
      <div>
        <strong>${card.activeLabel}</strong>
        <small>${card.promise}</small>
      </div>
      <button class="primary compact" data-review-orbit-action="true">${card.nextAction}</button>
    </div>
  </section>`;
}

function renderReviewSprintCard(card) {
  return `<section class="review-sprint-card ${card.mode}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.proofLine}</p>
      ${card.focus ? `<strong>${card.focus.prompt}</strong>` : ""}
    </div>
    <div>
      <span>${card.queueLabel}</span>
      <em>${card.primaryAction}</em>
      <div class="review-sprint-steps">
        ${card.steps
          .map((step) => `<small>
            <b>${step.label}</b>
            ${step.text}
          </small>`)
          .join("")}
      </div>
    </div>
  </section>`;
}

function renderReviewRescueQuest(card) {
  return `<section class="review-rescue-quest ${card.mode}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.nextAction}</p>
    </div>
    <div class="rescue-quest-stats">
      <span>${card.dueCount} active</span>
      <span>${card.rescuedCount} rescued</span>
      <span>${card.lockedCount} cooling</span>
    </div>
    <div class="rescue-quest-grid">
      ${card.cards.length > 0
        ? card.cards
            .map((item) => `<div class="rescue-quest-card ${item.status}">
              <span>${item.label}</span>
              <strong>${item.chapterTitle}</strong>
              <p>${item.prompt}</p>
              <small>${item.wrongCount} misses / ${item.correctCount} clean - ${item.reward}</small>
            </div>`)
            .join("")
        : `<div class="rescue-quest-card empty">
            <span>Seed</span>
            <strong>Answer a tiny prompt</strong>
            <p>A missed question will appear here as a future rescue card.</p>
            <small>Wrong answers return first; correct answers move later.</small>
          </div>`}
    </div>
    <strong>${card.promise}</strong>
  </section>`;
}

function renderMistakeSafetyNetCard(card) {
  return `<section class="mistake-safety-net-card ${card.mode}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.nextAction}</p>
    </div>
    <p>${card.body}</p>
    <div class="mistake-safety-stats">
      <span>${card.dueCount} due</span>
      <span>${card.scheduledCount} scheduled</span>
      <span>${card.rescuedCount} rescued</span>
    </div>
    <div class="mistake-safety-steps">
      ${card.steps
        .map((step) => `<div>
          <strong>${step.label}</strong>
          <small>${step.text}</small>
        </div>`)
        .join("")}
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
      <em>${card.repairLine}</em>
      <small>${card.repairUseCase}</small>
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

function renderFirstFiveMinuteStartCard(card) {
  if (!card) return "";
  return `<section class="first-five-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.nextAction}</p>
    </div>
    <div class="first-five-grid">
      ${card.steps
        .map((step) => `<div>
          <span>${step.label}</span>
          <strong>${step.text}</strong>
        </div>`)
        .join("")}
    </div>
    <div class="first-five-footer">
      <span>${card.chapterTitle} / ${card.lessonTitle}</span>
      <strong>${card.reward}</strong>
      <em>${card.guardrail}</em>
    </div>
  </section>`;
}

function renderFocusGuardCard(card) {
  if (!card) return "";
  return `<section class="focus-guard-card ${card.mode}">
    <div>
      <p class="eyebrow">${card.title}</p>
      <h3>${card.headline}</h3>
      <p>${card.reason}</p>
      <small>${card.guardrail}</small>
    </div>
    <div>
      <strong>${card.proof}</strong>
      <button class="primary compact" data-focus-action="${card.action.kind}" data-focus-target="${card.action.target}">
        ${card.action.label}
      </button>
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

function renderLessonPracticePlan(plan) {
  if (!plan) return "";
  return `<section class="lesson-practice-plan">
    <div class="section-title">
      <div>
        <p class="eyebrow">Practice Plan</p>
        <h3>${plan.title}</h3>
      </div>
      <p>${plan.attempted}/${plan.total} done - ${plan.nextStep}</p>
    </div>
    <p>${plan.headline}</p>
    <div class="practice-plan-grid">
      ${plan.formats
        .map((format) => `<div>
          <span>${format.order}</span>
          <strong>${format.label} x ${format.count}</strong>
          <small>${format.role}</small>
        </div>`)
        .join("")}
    </div>
    <strong>${plan.promise}</strong>
  </section>`;
}

function renderLessonStageRoute(card) {
  if (!card) return "";
  return `<section class="lesson-stage-route">
    <div class="section-title">
      <div>
        <p class="eyebrow">Stage Route</p>
        <h3>${card.title}</h3>
      </div>
      <p>${card.nextAction}</p>
    </div>
    <p>${card.headline}</p>
    <div class="stage-route-grid">
      ${card.stages
        .map((stage, index) => `<div class="stage-route-step ${stage.status}">
          <span>${index + 1}</span>
          <strong>${stage.label}</strong>
          <small>${stage.format} x ${stage.count} - ${stage.move}</small>
          <em>${stage.current}/${stage.target} proof - ${stage.reward}</em>
        </div>`)
        .join("")}
    </div>
    <strong>${card.promise}</strong>
  </section>`;
}

function renderLessonWarmupCard(card) {
  if (!card) return "";
  return `<section class="lesson-warmup-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Warmup</p>
        <h3>${card.title}</h3>
      </div>
      <p>${card.mastery}% ready - next: ${card.nextLabel}</p>
    </div>
    <p>${card.headline}</p>
    <div class="warmup-step-grid">
      ${card.steps
        .map((step) => `<div>
          <span>${step.label}</span>
          <strong>${step.text}</strong>
        </div>`)
        .join("")}
    </div>
    <small>${card.reassurance}</small>
  </section>`;
}

function renderLessonAnalogyBridge(card) {
  if (!card) return "";
  return `<section class="lesson-analogy-bridge">
    <div class="section-title">
      <div>
        <p class="eyebrow">Analogy Bridge</p>
        <h3>${card.title}</h3>
      </div>
      <p>${card.prompt}</p>
    </div>
    <div class="analogy-bridge-grid">
      ${card.cards
        .map((item) => `<div>
          <span>${item.label}</span>
          <strong>${item.text}</strong>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderConceptDiagramCard(card) {
  if (!card) return "";
  return `<section class="concept-diagram-card" style="--diagram-accent: ${card.accent}">
    <div class="section-title">
      <div>
        <p class="eyebrow">Concept Diagram</p>
        <h3>${card.title}</h3>
      </div>
      <p>${card.bridgeLine}</p>
    </div>
    <div class="diagram-flow">
      ${card.nodes
        .map((node, index) => `<div class="diagram-node">
          <span>${index + 1}</span>
          <strong>${node.label}</strong>
          <small>${node.detail}</small>
        </div>`)
        .join("")}
    </div>
    <p class="diagram-caption"><b>${card.mark}</b>${card.caption}</p>
  </section>`;
}

function renderLessonMasteryLadder(card) {
  if (!card) return "";
  return `<section class="mastery-ladder-card">
    <div class="section-title">
      <div>
        <p class="eyebrow">Mastery Ladder</p>
        <h3>${card.level}</h3>
      </div>
      <p>${card.doneCount}/${card.totalCount} stages ready - ${card.nextAction}</p>
    </div>
    <div class="mastery-ladder-grid">
      ${card.stages
        .map((stage, index) => `<div class="mastery-step ${stage.done ? "done" : ""}">
          <span>${index + 1}</span>
          <strong>${stage.label}</strong>
          <small>${stage.current}/${stage.target} - ${stage.proof}</small>
        </div>`)
        .join("")}
    </div>
  </section>`;
}

function renderLessonPitchBuilder(card) {
  if (!card) return "";
  const readinessClass = card.readiness.replaceAll(" ", "-");
  return `<section class="lesson-pitch-builder ${readinessClass}">
    <div class="section-title">
      <div>
        <p class="eyebrow">Pitch Builder</p>
        <h3>${card.title}</h3>
      </div>
      <p>${card.readyStages}/${card.totalStages} stages ready - ${card.nextAction}</p>
    </div>
    <div class="lesson-pitch-lines">
      ${card.lines
        .map((line) => `<div>
          <span>${line.label}</span>
          <strong>${line.text}</strong>
        </div>`)
        .join("")}
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

function renderBossReadinessCard(card) {
  if (!card) return "";
  return `<section class="boss-readiness-card ${card.status}">
    <div class="section-title">
      <div>
        <p class="eyebrow">${card.title}</p>
        <h3>${card.headline}</h3>
      </div>
      <p>${card.completedCount}/${card.totalCount} checks ready - ${card.nextAction}</p>
    </div>
    <p>${card.body}</p>
    <div class="boss-readiness-checks">
      ${card.checks
        .map((check) => `<div class="${check.done ? "done" : ""}">
          <span>${check.done ? "ready" : "next"}</span>
          <strong>${check.label}</strong>
          <small>${check.detail}</small>
        </div>`)
        .join("")}
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

function renderChoiceEliminationHint(hint) {
  if (!hint) return "";
  return `<div class="elimination-hint">
    <div>
      <span>${hint.title}</span>
      <p>${hint.body}</p>
    </div>
    <div class="elimination-checks">
      ${hint.checks.map((check) => `<small>${check}</small>`).join("")}
    </div>
  </div>`;
}

function renderQuestionHintDeck(deck, question) {
  return `<details class="question-hint-deck">
    <summary>
      <span>${deck.title}</span>
      <strong>${deck.primaryNudge}</strong>
      <small>${deck.summary}</small>
    </summary>
    <div class="question-hint-stack">
      ${renderQuestionMasteryStage(questionMasteryStage(question))}
      ${renderQuestionSignalPreview(questionSignalPreview(question))}
      ${renderQuestionCoach(questionCoachHint(question))}
      ${renderChoiceLensCard(choiceLensCard(question))}
      ${renderChoiceEliminationHint(choiceEliminationHint(question))}
      ${renderUncertaintySafetyCard(uncertaintySafetyCard(question))}
      <small class="hint-deck-promise">${deck.promise}</small>
    </div>
  </details>`;
}

function renderChoiceLensCard(card) {
  if (!card) return "";
  return `<div class="choice-lens-card ${card.mode}">
    <div>
      <span>${card.title}</span>
      <p>${card.body}</p>
    </div>
    <div class="choice-lens-steps">
      ${card.steps.map((step) => `<small>
        <b>${step.label}</b>
        ${step.text}
      </small>`).join("")}
    </div>
    <strong>${card.checkpoint}</strong>
  </div>`;
}

function renderUncertaintySafetyCard(card) {
  return `<div class="uncertainty-safety-card">
    <div>
      <span>${card.title}</span>
      <p>${card.body}</p>
    </div>
    <strong>${card.action}</strong>
    <small>${card.reviewPromise}</small>
  </div>`;
}

function renderQuestionMasteryStage(stage) {
  return `<div class="question-stage ${stage.id}">
    <span>${stage.label}</span>
    <p>${stage.proof}</p>
    <small>${stage.nextAction}</small>
  </div>`;
}

function renderQuestionSignalPreview(preview) {
  return `<div class="question-signal-preview">
    <div>
      <span>${preview.title}</span>
      <strong>${preview.reward}</strong>
      <p>${preview.tinyMove}</p>
      <small>${preview.proofUse}</small>
    </div>
    <div class="question-signal-steps">
      ${preview.steps
        .map((step) => `<em>
          <b>${step.label}</b>
          ${step.text}
        </em>`)
        .join("")}
    </div>
  </div>`;
}

function renderShortAnswerSupport(support) {
  if (!support) return "";
  return `<div class="short-support">
    <div>
      <span>${support.title}</span>
      <p>${support.prompt}</p>
    </div>
    <div class="concept-chip-row">
      ${support.concepts.map((concept, index) => `<button class="concept-chip" data-short-concept="${index}">${concept}</button>`).join("")}
    </div>
    <button class="starter-chip sentence-template" data-short-template="true">套用一句完整說法</button>
    <small>至少命中 ${support.needed} 個概念即可，不需要寫程式。</small>
  </div>`;
}

function renderShortAnswerRecipe(recipe) {
  if (!recipe) return "";
  return `<div class="short-recipe">
    <div>
      <span>${recipe.title}</span>
      <p>${recipe.promise}</p>
    </div>
    <div class="short-recipe-steps">
      ${recipe.steps.map((step) => `<div class="short-recipe-step">
        <strong>${step.label}</strong>
        <p>${step.text}</p>
      </div>`).join("")}
    </div>
  </div>`;
}

function renderFeedback(question, result, progressState) {
  const tone = result.correct ? "correct" : "wrong";
  return `<div class="feedback ${tone}">
    <strong>${result.correct ? "答對了" : "先記下來，之後會再出現"}</strong>
    <p>${question.explanation}</p>
    ${renderAnswerGateProgressCard(answerGateProgressCard(progressState, question, result, sessionMode))}
    ${renderAnswerLootCard(answerLootCard(question, result, progressState))}
    ${renderAnswerRunChainCard(answerRunChainCard(progressState, result))}
    ${renderAnswerInterviewLineCard(answerInterviewLineCard(question, result))}
    ${renderAnswerJobStorySeedCard(answerJobStorySeedCard(question, result))}
    ${renderAnswerOutcomeCard(answerOutcomeCard(question, result, progressState))}
    ${renderAnswerEvidenceClip(answerEvidenceClip(question, result))}
    ${renderProofBoosterCard(proofBoosterCard(question, result, progressState))}
    ${renderAnswerProofLine(answerProofLine(question, result))}
    ${renderQuestionMasterySignal(questionMasterySignal(progressState, question))}
    ${renderRecallCue(answerRecallCue(question, result))}
    ${renderAnswerMemoryHookCard(answerMemoryHookCard(question, result))}
    ${renderMistakeRescue(mistakeRescuePrompt(question, result))}
    ${renderChoiceFeedback(question, result)}
    ${renderShortFeedback(question, result)}
  </div>`;
}

function renderNextStepNudgeCard(card) {
  return `<div class="next-step-nudge ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.why}</small>
    </div>
    <div>
      <b>${card.actionLabel}</b>
      <small>${card.tinyRule}</small>
    </div>
  </div>`;
}

function renderAnswerGateProgressCard(card) {
  return `<div class="answer-gate-progress-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.chapterTitle} / ${card.gateLabel} / ${card.activeProgress}</small>
      <p>${card.summary}</p>
    </div>
    <div class="answer-gate-lanes">
      ${card.lanes
        .map((lane) => `<em class="${lane.status}">
          <b>${lane.label}</b>
          ${lane.value}
        </em>`)
        .join("")}
    </div>
    <small>${card.nextUse}</small>
  </div>`;
}

function renderAnswerInterviewLineCard(card) {
  return `<div class="answer-interview-line-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <p>${card.line}</p>
      <small>${card.cue}</small>
    </div>
    <div class="answer-interview-steps">
      ${card.steps
        .map((step) => `<em>
          <b>${step.label}</b>
          ${step.text}
        </em>`)
        .join("")}
    </div>
  </div>`;
}

function renderAnswerJobStorySeedCard(card) {
  return `<div class="answer-job-story-seed-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.roleText}</small>
    </div>
    <div class="job-story-seed-steps">
      ${card.steps
        .map((step) => `<em>
          <b>${step.label}</b>
          ${step.text}
        </em>`)
        .join("")}
    </div>
    <p>${card.nextUse}</p>
  </div>`;
}

function renderAnswerLootCard(card) {
  return `<div class="answer-loot-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.subhead}</small>
    </div>
    <div class="answer-loot-badges">
      ${card.badges
        .map((badge) => `<div>
          <span>${badge.label}</span>
          <strong>${badge.value}</strong>
          <small>${badge.detail}</small>
        </div>`)
        .join("")}
    </div>
    <small>${card.nextAction}</small>
  </div>`;
}

function renderAnswerRunChainCard(card) {
  return `<div class="answer-run-chain-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <p>${card.body}</p>
    </div>
    <div class="answer-run-chain-meters">
      ${card.meters
        .map((meter) => `<em>
          <b>${meter.value}</b>
          ${meter.label}
        </em>`)
        .join("")}
    </div>
    <small>${card.nextAction}</small>
  </div>`;
}

function renderAnswerOutcomeCard(card) {
  return `<div class="answer-outcome-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <p>${card.summary}</p>
    </div>
    <div class="answer-outcome-lanes">
      ${card.lanes
        .map((lane) => `<div>
          <span>${lane.label}</span>
          <strong>${lane.value}</strong>
          <small>${lane.detail}</small>
        </div>`)
        .join("")}
    </div>
    <small>${card.nextAction}</small>
  </div>`;
}

function renderAnswerEvidenceClip(clip) {
  return `<div class="answer-evidence-clip ${clip.status}">
    <div>
      <span>${clip.title}</span>
      <strong>${clip.headline}</strong>
      <p>${clip.line}</p>
    </div>
    <div>
      <small>${clip.stage}</small>
      <em>${clip.useCase}</em>
      <b>${clip.nextAction}</b>
    </div>
  </div>`;
}

function renderProofBoosterCard(card) {
  return `<div class="proof-booster-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <p>${card.proofLine}</p>
    </div>
    <div>
      <small>${card.stage}</small>
      <small>${card.signalTitle}</small>
      <em>${card.correctCount} clean / ${card.wrongCount} review</em>
    </div>
    <p>${card.nextUse}</p>
  </div>`;
}

function renderAnswerProofLine(proof) {
  return `<div class="answer-proof-line">
    <span>${proof.title}</span>
    <p>${proof.body}</p>
  </div>`;
}

function renderQuestionMasterySignal(signal) {
  if (!signal) return "";
  return `<div class="question-mastery-signal ${signal.level}">
    <span>${signal.title}</span>
    <p>${signal.body}</p>
    <small>${signal.correctCount} correct / ${signal.wrongCount} review misses</small>
  </div>`;
}

function renderRecallCue(cue) {
  return `<div class="recall-cue">
    <span>${cue.title}</span>
    <p>${cue.body}</p>
  </div>`;
}

function renderAnswerMemoryHookCard(card) {
  return `<div class="answer-memory-hook-card ${card.status}">
    <div>
      <span>${card.title}</span>
      <strong>${card.headline}</strong>
      <small>${card.stage} / ${card.anchor}</small>
      <p>${card.cue}</p>
    </div>
    <div class="memory-hook-grid">
      ${card.hooks
        .map((hook) => `<em>
          <b>${hook.label}</b>
          ${hook.text}
        </em>`)
        .join("")}
    </div>
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

  document.querySelector("[data-quest-brief-action]")?.addEventListener("click", () => {
    startRecommendedPractice(questBriefCard(progress, Date.now()).action);
  });

  document.querySelector("[data-landing-strip-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-practice-diet-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-choice-arcade-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-beginner-skill-map-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-boss-gate-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-interview-preview-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-pitch-preview-action]")?.addEventListener("click", (event) => {
    const card = pitchUnlockPreviewCard(progress);
    if (card?.status === "ready") {
      activePitch = pitchPracticeCard(progress, event.currentTarget.dataset.pitchPreviewAction);
      pitchAnswer = "";
      latestCompletion = null;
      render();
      return;
    }
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-job-packet-action]")?.addEventListener("click", () => {
    const card = jobPacketPreviewCard(progress, Date.now());
    if (card?.action.kind === "pitch" && card.action.chapterId) {
      activePitch = pitchPracticeCard(progress, card.action.chapterId);
      pitchAnswer = "";
      latestCompletion = null;
      render();
      return;
    }
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-interview-readiness-action]")?.addEventListener("click", () => {
    const card = interviewReadinessDockCard(progress, Date.now());
    if (card?.action.kind === "pitch" && card.action.chapterId) {
      activePitch = pitchPracticeCard(progress, card.action.chapterId);
      pitchAnswer = "";
      latestCompletion = null;
      render();
      return;
    }
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-zero-landing-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-role-quest-action]")?.addEventListener("click", () => {
    startRecommendedPractice(roleQuestBoardCard(progress, Date.now()).action);
  });

  document.querySelector("[data-daily-skill-ticket-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-streak-shield-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  const beginnerJumpTargets = {
    route: "[data-beginner-section='route']",
    daily: "[data-beginner-section='daily']",
    packet: ".job-packet-preview-card",
    review: "[data-beginner-section='review']"
  };
  document.querySelectorAll("[data-beginner-jump]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const target = beginnerJumpTargets[event.currentTarget.dataset.beginnerJump];
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelector("[data-review-orbit-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-seven-day-action]")?.addEventListener("click", () => {
    startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
  });

  document.querySelector("[data-dashboard-mode]")?.addEventListener("click", (event) => {
    progress = setDashboardMode(progress, event.currentTarget.dataset.dashboardMode);
    saveProgress(progress);
    render();
  });

  document.querySelectorAll("[data-focus-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const action = event.currentTarget.dataset.focusAction;
      if (action === "profile") {
        progress = selectLearnerProfile(progress, event.currentTarget.dataset.focusTarget);
        saveProgress(progress);
        render();
        return;
      }
      if (action === "review") {
        sessionMode = "review";
        sessionQuestions = buildReviewSessionQuestions(progress, Date.now(), 7);
        currentIndex = 0;
        activePitch = null;
        pitchAnswer = "";
        clearAnswerState();
        render();
        return;
      }
      startRecommendedPractice(nextPracticeRecommendation(progress, Date.now()));
    });
  });

  document.querySelectorAll("[data-role-practice]").forEach((button) => {
    button.addEventListener("click", () => {
      const roleFit = jobRoleFitCard(progress);
      const track = roleFit.tracks[Number(button.dataset.rolePractice)];
      startRecommendedPractice(track.recommendedPractice);
    });
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
      updateShortAnswerMeter(shortAnswer);
    });
  }

  document.querySelectorAll("[data-starter]").forEach((button) => {
    button.addEventListener("click", () => {
      shortAnswer = button.dataset.starter;
      render();
    });
  });

  document.querySelectorAll("[data-short-concept]").forEach((button) => {
    button.addEventListener("click", () => {
      const support = shortAnswerSupport(sessionQuestions[currentIndex]);
      const concept = support?.concepts[Number(button.dataset.shortConcept)];
      shortAnswer = appendConcept(shortAnswer, concept);
      render();
    });
  });

  document.querySelectorAll("[data-short-template]").forEach((button) => {
    button.addEventListener("click", () => {
      const support = shortAnswerSupport(sessionQuestions[currentIndex]);
      shortAnswer = support?.sentenceTemplate ?? shortAnswer;
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
  } else if (recommendation.type === "pitch") {
    activePitch = pitchPracticeCard(progress, recommendation.chapterId);
    pitchAnswer = "";
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

function appendConcept(answer, concept) {
  const cleanAnswer = `${answer ?? ""}`.trim();
  if (!concept || cleanAnswer.toLowerCase().includes(concept.toLowerCase())) return cleanAnswer;
  return cleanAnswer ? `${cleanAnswer} ${concept}` : concept;
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
