import assert from "node:assert/strict";
import {
  bossQuestionsForChapter,
  beginnerGlossary,
  chapterVisuals,
  course,
  flattenInterviewQuestions,
  flattenLessons,
  flattenQuestions,
  interviewQuestionsForChapter,
  interviewScenarios,
  jobScenarioCards,
  jobReadinessSkills
} from "../src/course.js";
import {
  abilityShardCard,
  abilityProofCards,
  answerEvidenceClip,
  answerProofLine,
  answerRecallCue,
  answerQuestion,
  beginnerGlossaryCards,
  bossReadinessCard,
  buildReviewSessionQuestions,
  buildSessionQuestions,
  careerReadinessSnapshot,
  chapterGateMap,
  chapterMap,
  chapterSummaryCards,
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
  dailyMomentum,
  dailyPhraseBankCard,
  dailyQuestSnapshot,
  dailyMissions,
  exerciseScopeCard,
  firstFiveMinuteStartCard,
  focusGuardCard,
  getDueReviewQuestions,
  gradePitchPractice,
  gradeQuestion,
  isAnswerReady,
  jargonShieldCard,
  jobReadinessMap,
  jobEvidenceBrief,
  jobSignalPassport,
  landingGapRadar,
  landingReadinessChecklist,
  questCompass,
  jobRoleFitCard,
  jobScenarioCard,
  lessonAnalogyBridge,
  lessonPitchBuilder,
  lessonPracticePlan,
  lessonSkillCard,
  lessonStageRoute,
  lessonMasteryLadder,
  lessonWarmupCard,
  learningReceiptReel,
  learningPuzzleBoard,
  masteryForLesson,
  mistakeFocusCard,
  mistakeSafetyNetCard,
  mistakeRescuePrompt,
  mistakeNotebook,
  nextPracticeRecommendation,
  onboardingState,
  oneLineCoachCard,
  pitchPracticeCard,
  practiceDietCard,
  proofBoosterCard,
  questionCoachHint,
  questionHintDeck,
  questionKey,
  questionMasterySignal,
  questionMasteryStage,
  questionSignalPreview,
  recallComboCard,
  reviewRescueQuest,
  reviewRhythmCard,
  reviewSprintCard,
  reviewStats,
  roleSamplerCard,
  selectLearnerProfile,
  setDashboardMode,
  sevenDayLandingPath,
  sessionRhythmCard,
  signalPreviewCard,
  skillProfileCard,
  shortAnswerRecipe,
  shortAnswerSupport,
  uncertaintySafetyCard,
  zeroToLandingQuestCard
} from "../src/engine.js";

const tests = [
  ["course has MVP scope", testCourseScope],
  ["onboarding profile starts empty and can be selected", testOnboardingProfile],
  ["first five minute start keeps first run tiny", testFirstFiveMinuteStartCard],
  ["focus guard shows one primary beginner action", testFocusGuardCard],
  ["dashboard mode defaults to beginner and can switch full", testDashboardModeCard],
  ["course covers job-ready agentic workflow map", testCourseCoverage],
  ["beginner glossary covers every chapter with plain-language terms", testBeginnerGlossaryCoverage],
  ["jargon shield brings plain terms into beginner view", testJargonShieldCard],
  ["chapter visuals cover every chapter", testChapterVisuals],
  ["job readiness skills cover every chapter", testJobReadinessCoverage],
  ["job scenario cards map chapters to workplace signals", testJobScenarioCards],
  ["lesson micro skill cards explain low-friction job signals", testLessonSkillCards],
  ["lesson practice plans show choice-first sequence", testLessonPracticePlans],
  ["practice diet card keeps beginner work choice-heavy", testPracticeDietCard],
  ["lesson stage route makes recognize connect explain visible", testLessonStageRoute],
  ["lesson warmup cards remove first-step friction", testLessonWarmupCards],
  ["lesson analogy bridges explain concepts in plain language", testLessonAnalogyBridges],
  ["concept diagram cards turn lessons into visual workflow maps", testConceptDiagramCards],
  ["lesson mastery ladder tracks recognize connect explain stages", testLessonMasteryLadder],
  ["lesson pitch builder turns mastery into interview lines", testLessonPitchBuilder],
  ["learning puzzle board tracks job-readiness pieces", testLearningPuzzleBoard],
  ["interview scenarios cover every chapter with low-friction questions", testInterviewScenarioCoverage],
  ["course stays low-friction", testLowFrictionQuestionTypes],
  ["question coach hints reduce blank-page friction", testQuestionCoachHints],
  ["choice elimination hints reduce option overload", testChoiceEliminationHints],
  ["choice lens cards make selection practice feel guided", testChoiceLensCards],
  ["question hint deck keeps deeper guidance optional", testQuestionHintDeck],
  ["uncertainty safety cards normalize unsure answers", testUncertaintySafetyCards],
  ["question mastery stage maps every question to the ladder", testQuestionMasteryStage],
  ["question signal preview shows the tiny reward for each question", testQuestionSignalPreview],
  ["session rhythm shows choices before tiny explanation", testSessionRhythmCard],
  ["ability shard card turns each prompt into a collectible piece", testAbilityShardCard],
  ["short answer support provides concept chips", testShortAnswerSupport],
  ["short answer recipe turns writing into three tiny steps", testShortAnswerRecipe],
  ["answer evidence clips turn every checked answer into a reusable signal", testAnswerEvidenceClips],
  ["answer proof lines turn feedback into job-facing evidence", testAnswerProofLines],
  ["proof booster turns feedback into immediate proof or review", testProofBoosterCard],
  ["question mastery signals show recall progress", testQuestionMasterySignals],
  ["learning receipt reel turns answers into visible evidence", testLearningReceiptReel],
  ["signal preview shows the reward before starting", testSignalPreviewCard],
  ["answer recall cues turn answers into next-time signals", testAnswerRecallCues],
  ["mistake rescue prompts give wrong-answer next steps", testMistakeRescuePrompts],
  ["single choice grading works", testSingleChoice],
  ["multi choice grading works", testMultiChoice],
  ["choice feedback covers every selectable option", testChoiceFeedback],
  ["short answer keyword grading works", testShortAnswer],
  ["short answer feedback includes matches missing keywords and sample answer", testShortAnswerFeedback],
  ["empty answers are not treated as correct", testEmptyAnswersAreNotCorrect],
  ["wrong answer is added to due review", testWrongAnswerReview],
  ["correct answer schedules future review", testCorrectAnswerReview],
  ["lesson completion advances progress", testLessonCompletion],
  ["session includes due review first", testSessionReview],
  ["fresh lesson sessions put choice questions before short answers", testFreshSessionChoiceFirst],
  ["fresh session questions keep stable keys", testFreshSessionQuestionKeys],
  ["review mode returns only due questions", testReviewModeOnlyDue],
  ["review stats separate due and scheduled", testReviewStats],
  ["review rhythm card explains spaced review timing", testReviewRhythmCard],
  ["review sprint card turns review into a tiny loop", testReviewSprintCard],
  ["review rescue quest makes mistake replay game-like", testReviewRescueQuest],
  ["mistake safety net explains wrong answers as repair loops", testMistakeSafetyNetCard],
  ["boss quiz uses low-friction chapter questions", testBossQuizQuestions],
  ["boss quiz records pass and fail results", testBossQuizCompletion],
  ["daily missions track answers lessons and boss passes", testDailyMissions],
  ["daily quest snapshot shows nearest small progress", testDailyQuestSnapshot],
  ["daily minimum card sets a tiny stop line", testDailyMinimumCard],
  ["daily landing step maps tiny practice to job value", testDailyLandingStepCard],
  ["daily phrase bank makes reusable lines visible in beginner flow", testDailyPhraseBankCard],
  ["zero to landing quest compresses the beginner route", testZeroToLandingQuestCard],
  ["role sampler turns role paths into choice-first samples", testRoleSamplerCard],
  ["quest compass turns recommendation into a game-like next step", testQuestCompass],
  ["daily momentum derives real active-day streaks", testDailyMomentum],
  ["recall combo card rewards clean low-friction runs", testRecallComboCard],
  ["achievements unlock from real progress", testAchievements],
  ["mistake notebook lists recent wrong answers with due state", testMistakeNotebook],
  ["mistake focus card picks the highest-priority wrong answer", testMistakeFocusCard],
  ["chapter map summarizes lesson and boss progress", testChapterMap],
  ["chapter gate map stages lessons boss interview and pitch unlocks", testChapterGateMap],
  ["boss readiness card explains chapter checkpoint", testBossReadinessCard],
  ["chapter summary cards turn progress into interview-ready guidance", testChapterSummaryCards],
  ["ability proof cards derive evidence from real progress", testAbilityProofCards],
  ["career readiness snapshot summarizes proof progress", testCareerReadinessSnapshot],
  ["skill profile summarizes evidence into one page", testSkillProfileCard],
  ["job role fit card maps progress to role paths", testJobRoleFitCard],
  ["job signal passport summarizes current role evidence", testJobSignalPassport],
  ["landing gap radar highlights the closest job-readiness gap", testLandingGapRadar],
  ["landing checklist tracks job-readiness gates", testLandingReadinessChecklist],
  ["seven day landing path turns progress into low-friction steps", testSevenDayLandingPath],
  ["job evidence brief turns progress into an interview line", testJobEvidenceBrief],
  ["one-line coach turns progress into tiny interview wording", testOneLineCoachCard],
  ["exercise scope card keeps practice low-friction", testExerciseScopeCard],
  ["completion cards summarize finished sessions", testCompletionCards],
  ["next practice recommendation picks the highest-value next step", testNextPracticeRecommendation],
  ["pitch practice cards coach interview answers", testPitchPracticeCards],
  ["job readiness map derives status from progress", testJobReadinessMap],
  ["interview questions work with answer and review flow", testInterviewQuestionFlow]
];

let failed = 0;

for (const [name, test] of tests) {
  try {
    test();
    console.log(`ok - ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${name}`);
    console.error(error.stack ?? error.message);
  }
}

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log(`\n${tests.length} tests passed`);
}

function testCourseScope() {
  assert.equal(course.chapters.length, 8);
  assert.equal(flattenLessons().length, 24);
  assert.equal(flattenQuestions().length, 120);
}

function testOnboardingProfile() {
  const progress = createInitialProgress(1000);
  let state = onboardingState(progress);
  assert.equal(state.completed, false);
  assert.equal(state.options.length, 3);
  assert.equal(state.headline, "先選你的起點");

  selectLearnerProfile(progress, "interview");
  state = onboardingState(progress);
  assert.equal(state.completed, true);
  assert.equal(state.selected.id, "interview");
  assert.equal(state.questSteps.length, 3);
  assert.ok(state.questSteps.some((step) => step.includes("interview") || step.includes("pitch")));
  assert.doesNotMatch(state.questSteps.join(" "), /repo|project implementation|專案實作/i);
  assert.ok(state.guidance.includes("面試") || state.guidance.includes("pitch"));

  selectLearnerProfile(progress, "unknown");
  state = onboardingState(progress);
  assert.equal(state.completed, false);
  assert.equal(state.questSteps.length, 0);
}

function testFirstFiveMinuteStartCard() {
  const progress = createInitialProgress(1000);
  let card = firstFiveMinuteStartCard(progress);
  assert.equal(card.title, "First 5 Minutes");
  assert.equal(card.status, "new");
  assert.equal(card.steps.length, 3);
  assert.deepEqual(card.steps.map((step) => step.id), ["map", "choice", "receipt"]);
  assert.ok(card.steps.find((step) => step.id === "map").text.includes("workflow"));
  assert.ok(card.steps.find((step) => step.id === "choice").text.includes("Choose"));
  assert.ok(card.steps.find((step) => step.id === "receipt").text.includes("proof"));
  assert.equal(card.reward, "Decision signal");
  assert.ok(card.guardrail.includes("No setup"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const lesson = flattenLessons()[0];
  const question = lesson.questions.find((item) => item.type === "single");
  answerQuestion(progress, { ...question, lessonId: lesson.id }, question.answer, 1000);
  card = firstFiveMinuteStartCard(progress);
  assert.equal(card.status, "started");
  assert.ok(card.headline.includes("proof loop"));
  assert.ok(card.steps.find((step) => step.id === "receipt").text.includes("evidence"));
}

function testFocusGuardCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let card = focusGuardCard(progress, now);
  assert.equal(card.title, "Focus Guard");
  assert.equal(card.mode, "profile");
  assert.equal(card.action.kind, "profile");
  assert.equal(card.action.target, "beginner");
  assert.ok(card.guardrail.includes("one primary action"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  selectLearnerProfile(progress, "beginner");
  card = focusGuardCard(progress, now);
  assert.equal(card.mode, "first-step");
  assert.equal(card.action.kind, "recommend");
  assert.ok(card.reason.includes("concept map"));

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, 99, now);
  card = focusGuardCard(progress, now);
  assert.equal(card.mode, "rescue");
  assert.equal(card.action.kind, "review");
  assert.ok(card.headline.includes("weak signal"));

  answerQuestion(progress, question, question.answer, now + 1);
  card = focusGuardCard(progress, now + 2);
  assert.notEqual(card.mode, "profile");
  assert.equal(card.action.kind, "recommend");
  assert.ok(card.proof.includes("started"));
}

function testDashboardModeCard() {
  const progress = createInitialProgress(1000);
  let card = dashboardModeCard(progress);
  assert.equal(card.title, "Dashboard Mode");
  assert.equal(card.mode, "beginner");
  assert.equal(card.nextMode, "full");
  assert.ok(card.visibleGroups.includes("Start"));
  assert.ok(card.body.includes("start"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  setDashboardMode(progress, "full");
  card = dashboardModeCard(progress);
  assert.equal(card.mode, "full");
  assert.equal(card.nextMode, "beginner");
  assert.ok(card.visibleGroups.includes("Evidence"));
  assert.ok(card.body.includes("full evidence"));

  setDashboardMode(progress, "unknown");
  card = dashboardModeCard(progress);
  assert.equal(card.mode, "beginner");
}

function testCourseCoverage() {
  const text = JSON.stringify(course);
  for (const topic of ["Tool", "RAG", "Memory", "Guardrails", "Evals", "Observability", "LangChain", "LangGraph"]) {
    assert.ok(text.includes(topic), `missing topic: ${topic}`);
  }
}

function testBeginnerGlossaryCoverage() {
  assert.equal(beginnerGlossary.length, course.chapters.length);
  const chapterIds = new Set(course.chapters.map((chapter) => chapter.id));
  for (const glossary of beginnerGlossary) {
    assert.ok(chapterIds.has(glossary.chapterId), `unknown chapter for ${glossary.chapterId}`);
    assert.equal(glossary.terms.length, 3);
    for (const term of glossary.terms) {
      assert.ok(term.term.length > 0);
      assert.ok(term.plain.length >= 20);
      assert.ok(term.whyItMatters.length >= 20);
      assert.doesNotMatch(`${term.plain} ${term.whyItMatters}`, /repo|project implementation|專案實作/i);
    }
    const card = beginnerGlossaryCards(glossary.chapterId);
    assert.equal(card.terms.length, 3);
    assert.ok(card.chapterTitle.length > 0);
  }
}

function testJargonShieldCard() {
  for (const chapter of course.chapters) {
    const card = jargonShieldCard(chapter.id);
    assert.equal(card.title, "Jargon Shield");
    assert.equal(card.chapterId, chapter.id);
    assert.equal(card.terms.length, 3);
    assert.ok(card.headline.includes(chapter.title));
    assert.ok(card.body.includes("plain meanings"));
    assert.ok(card.promise.includes("No prior AI vocabulary"));
    assert.ok(card.terms.every((term) => term.term.length > 0));
    assert.ok(card.terms.every((term) => term.plain.length >= 20));
    assert.ok(card.terms.every((term) => term.cue.length >= 20));
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);
  }
}

function testChapterVisuals() {
  for (const chapter of course.chapters) {
    const visual = chapterVisuals[chapter.id];
    assert.ok(visual, `missing visual for ${chapter.id}`);
    assert.match(visual.mark, /^[A-Z]{2}$/);
    assert.match(visual.accent, /^#[0-9a-f]{6}$/i);
    assert.ok(visual.caption.length > 0);
    assert.ok(visual.imagePrompt.includes("educational game card"));
    assert.ok(visual.imagePrompt.includes("no text"));
  }
}

function testJobReadinessCoverage() {
  assert.equal(jobReadinessSkills.length, course.chapters.length);
  const chapterIds = new Set(course.chapters.map((chapter) => chapter.id));
  for (const skill of jobReadinessSkills) {
    assert.ok(chapterIds.has(skill.chapterId), `unknown chapter for ${skill.id}`);
    assert.ok(skill.title.length > 0);
    assert.ok(skill.signal.length > 0);
  }
  for (const chapter of course.chapters) {
    assert.equal(
      jobReadinessSkills.filter((skill) => skill.chapterId === chapter.id).length,
      1,
      `expected one skill for ${chapter.id}`
    );
  }
}

function testJobScenarioCards() {
  assert.equal(jobScenarioCards.length, course.chapters.length);
  const chapterIds = new Set(course.chapters.map((chapter) => chapter.id));
  for (const scenario of jobScenarioCards) {
    assert.ok(chapterIds.has(scenario.chapterId), `unknown chapter for ${scenario.chapterId}`);
    assert.ok(scenario.workplaceTask.length >= 40);
    assert.ok(scenario.commonTrap.length >= 20);
    assert.ok(scenario.interviewSignal.length >= 20);
    assert.doesNotMatch(
      `${scenario.workplaceTask} ${scenario.commonTrap} ${scenario.interviewSignal}`,
      /repo|project implementation|專案實作/i
    );
    const card = jobScenarioCard(scenario.chapterId);
    assert.equal(card.chapterId, scenario.chapterId);
    assert.equal(card.workplaceTask, scenario.workplaceTask);
    assert.ok(card.chapterTitle.length > 0);
  }
}

function testLessonSkillCards() {
  const progress = createInitialProgress(1000);
  for (const lesson of flattenLessons()) {
    const card = lessonSkillCard(progress, lesson.id);
    assert.equal(card.lessonId, lesson.id);
    assert.equal(card.total, lesson.questions.length);
    assert.equal(card.attempted, 0);
    assert.equal(card.correct, 0);
    assert.equal(card.mastery, 0);
    assert.ok(card.focus.length >= 20);
    assert.ok(card.jobSignal.length >= 20);
    assert.ok(card.answerLens.includes("workflow"));
    assert.ok(card.practicePromise.includes("選擇") || card.practicePromise.includes("single"));
    assert.ok(card.mix.every((item) => ["single", "multi", "short"].includes(item.type)));
    assert.doesNotMatch(
      `${card.focus} ${card.jobSignal} ${card.answerLens} ${card.practicePromise}`,
      /repo|project implementation|實作專案/i
    );
  }

  const lesson = flattenLessons()[0];
  answerQuestion(progress, { ...lesson.questions[0], lessonId: lesson.id }, lesson.questions[0].answer, 1000);
  const updated = lessonSkillCard(progress, lesson.id);
  assert.equal(updated.attempted, 1);
  assert.equal(updated.correct, 1);
  assert.ok(updated.mastery > 0);
  assert.equal(lessonSkillCard(progress, "missing-lesson"), null);
}

function testLessonPracticePlans() {
  const progress = createInitialProgress(1000);
  for (const lesson of flattenLessons()) {
    const plan = lessonPracticePlan(progress, lesson.id);
    const typeCounts = countBy(lesson.questions, (question) => question.type);
    assert.equal(plan.lessonId, lesson.id);
    assert.equal(plan.title, "Choice-first practice plan");
    assert.equal(plan.total, lesson.questions.length);
    assert.equal(plan.attempted, 0);
    assert.deepEqual(plan.formats.map((format) => format.type), ["single", "multi", "short"]);
    assert.deepEqual(plan.formats.map((format) => format.count), [typeCounts.single, typeCounts.multi, typeCounts.short]);
    assert.deepEqual(plan.formats.map((format) => format.order), [1, 2, 3]);
    assert.ok(plan.headline.includes("choices first"));
    assert.ok(plan.promise.includes("No coding tasks"));
    assert.doesNotMatch(JSON.stringify(plan), /repo|project implementation|build a project/i);
  }

  const lesson = flattenLessons()[0];
  answerQuestion(progress, { ...lesson.questions[0], lessonId: lesson.id }, lesson.questions[0].answer, 1000);
  const updated = lessonPracticePlan(progress, lesson.id);
  assert.equal(updated.attempted, 1);
  assert.equal(updated.formats.find((format) => format.type === "single").attempted, 1);
  assert.equal(lessonPracticePlan(progress, "missing-lesson"), null);
}

function testPracticeDietCard() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];
  let card = practiceDietCard(progress, lesson.id, 1000);

  assert.equal(card.title, "Practice Diet");
  assert.equal(card.lessonId, lesson.id);
  assert.equal(card.choicePercent, 80);
  assert.deepEqual(card.formats.map((format) => format.id), ["single", "multi", "short"]);
  assert.deepEqual(card.formats.map((format) => format.count), [3, 1, 1]);
  assert.equal(card.formats.find((format) => format.id === "short").role, "One sentence only");
  assert.deepEqual(card.rules.map((rule) => rule.id), ["choice-first", "short-last", "review-loop"]);
  assert.ok(card.headline.includes("choices"));
  assert.ok(card.description.includes("4/5"));
  assert.ok(card.promise.includes("No build assignment"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const single = lesson.questions.find((question) => question.type === "single");
  answerQuestion(progress, { ...single, lessonId: lesson.id }, single.answer, 1000);
  card = practiceDietCard(progress, lesson.id, 1000);
  assert.equal(card.formats.find((format) => format.id === "single").attempted, 1);
  assert.equal(practiceDietCard(progress, "missing-lesson", 1000), null);
}

function testLessonStageRoute() {
  const progress = createInitialProgress(1000);
  for (const lesson of flattenLessons()) {
    const route = lessonStageRoute(progress, lesson.id);
    assert.equal(route.lessonId, lesson.id);
    assert.equal(route.title, "Tiny stage route");
    assert.equal(route.headline, "Recognize first, connect second, explain last.");
    assert.equal(route.activeStageId, "recognize");
    assert.deepEqual(route.stages.map((stage) => stage.id), ["recognize", "connect", "explain"]);
    assert.deepEqual(route.stages.map((stage) => stage.type), ["single", "multi", "short"]);
    assert.deepEqual(route.stages.map((stage) => stage.status), ["active", "up-next", "up-next"]);
    assert.ok(route.stages.every((stage) => stage.count > 0 && stage.move.length > 10));
    assert.ok(route.promise.includes("No projects or coding tasks"));
    assert.doesNotMatch(JSON.stringify(route), /repo|project implementation|build a project/i);
  }

  const lesson = flattenLessons()[0];
  for (const question of lesson.questions.filter((item) => item.type === "single")) {
    answerQuestion(progress, { ...question, lessonId: lesson.id }, question.answer, 1000);
  }
  let route = lessonStageRoute(progress, lesson.id);
  assert.equal(route.activeStageId, "connect");
  assert.deepEqual(route.stages.map((stage) => stage.status), ["done", "active", "up-next"]);

  const multi = lesson.questions.find((item) => item.type === "multi");
  const short = lesson.questions.find((item) => item.type === "short");
  answerQuestion(progress, { ...multi, lessonId: lesson.id }, multi.answer, 1000);
  answerQuestion(progress, { ...short, lessonId: lesson.id }, short.keywords[0], 1000);
  route = lessonStageRoute(progress, lesson.id);
  assert.equal(route.activeStageId, "explain");
  assert.deepEqual(route.stages.map((stage) => stage.status), ["done", "done", "done"]);
  assert.ok(route.nextAction.includes("lesson pitch"));
  assert.equal(lessonStageRoute(progress, "missing-lesson"), null);
}

function testLessonWarmupCards() {
  const progress = createInitialProgress(1000);
  for (const lesson of flattenLessons()) {
    const card = lessonWarmupCard(progress, lesson.id);
    assert.equal(card.lessonId, lesson.id);
    assert.equal(card.chapterId, lesson.chapterId);
    assert.equal(card.title, "Zero-friction warmup");
    assert.equal(card.steps.length, 3);
    assert.deepEqual(card.steps.map((step) => step.id), ["look", "choose", "say"]);
    assert.ok(card.headline.includes("noticing"));
    assert.ok(card.nextLabel.includes("pick one signal"));
    assert.ok(card.steps.find((step) => step.id === "say").text.includes("one job-facing sentence"));
    assert.ok(card.reassurance.includes("no blank page"));
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);
  }

  const lesson = flattenLessons()[0];
  answerQuestion(progress, { ...lesson.questions[0], lessonId: lesson.id }, lesson.questions[0].answer, 1000);
  const updated = lessonWarmupCard(progress, lesson.id);
  assert.match(updated.nextLabel, /pick one signal|connect several signals|write one sentence|replay due review/);
  assert.notEqual(updated.nextLabel, "pick one signal");
  assert.equal(lessonWarmupCard(progress, "missing-lesson"), null);
}

function testLessonAnalogyBridges() {
  for (const lesson of flattenLessons()) {
    const bridge = lessonAnalogyBridge(lesson.id);
    assert.equal(bridge.lessonId, lesson.id);
    assert.equal(bridge.chapterId, lesson.chapterId);
    assert.equal(bridge.title, "Analogy bridge");
    assert.equal(bridge.hook, lesson.analogy);
    assert.deepEqual(bridge.cards.map((card) => card.id), ["picture", "workflow", "job"]);
    assert.equal(bridge.cards.length, 3);
    assert.ok(bridge.cards.every((card) => card.text.length >= 20));
    assert.ok(bridge.prompt.includes("choice questions"));
    assert.doesNotMatch(JSON.stringify(bridge), /repo|project implementation|build a project/i);
  }
  assert.equal(lessonAnalogyBridge("missing-lesson"), null);
}

function testConceptDiagramCards() {
  for (const lesson of flattenLessons()) {
    const card = conceptDiagramCard(lesson.id);
    assert.equal(card.lessonId, lesson.id);
    assert.equal(card.chapterId, lesson.chapterId);
    assert.equal(card.nodes.length, 4);
    assert.match(card.accent, /^#[0-9a-f]{6}$/i);
    assert.match(card.mark, /^[A-Z]{2}$/);
    assert.ok(card.title.includes(lesson.title));
    assert.ok(card.bridgeLine.includes("workflow"));
    assert.ok(card.imagePrompt.includes("educational game card"));
    assert.ok(card.imagePrompt.includes("no text"));
    assert.ok(card.nodes.every((node) => node.label.length > 0 && node.detail.length >= 20));
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project/i);
  }
  assert.equal(conceptDiagramCard("missing-lesson"), null);
}

function testLessonMasteryLadder() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];
  let ladder = lessonMasteryLadder(progress, lesson.id);
  assert.equal(ladder.lessonId, lesson.id);
  assert.equal(ladder.title, "0 to mastery ladder");
  assert.equal(ladder.level, "Starting from zero");
  assert.equal(ladder.doneCount, 0);
  assert.equal(ladder.totalCount, 3);
  assert.deepEqual(ladder.stages.map((stage) => stage.id), ["recognize", "connect", "explain"]);
  assert.ok(ladder.nextAction.includes("Recognize"));
  assert.doesNotMatch(JSON.stringify(ladder), /repo|project implementation|build a project/i);

  for (const question of lesson.questions.filter((item) => item.type === "single")) {
    answerQuestion(progress, { ...question, lessonId: lesson.id }, question.answer, 1000);
  }
  ladder = lessonMasteryLadder(progress, lesson.id);
  assert.equal(ladder.stages.find((stage) => stage.id === "recognize").done, true);
  assert.equal(ladder.doneCount, 1);
  assert.equal(ladder.level, "Pattern recognized");

  const multi = lesson.questions.find((item) => item.type === "multi");
  const short = lesson.questions.find((item) => item.type === "short");
  answerQuestion(progress, { ...multi, lessonId: lesson.id }, multi.answer, 1000);
  answerQuestion(progress, { ...short, lessonId: lesson.id }, short.keywords[0], 1000);
  ladder = lessonMasteryLadder(progress, lesson.id);
  assert.equal(ladder.doneCount, 3);
  assert.equal(ladder.level, "Ready to teach");
  assert.ok(ladder.nextAction.includes("60-second"));
  assert.equal(lessonMasteryLadder(progress, "missing-lesson"), null);
}

function testLessonPitchBuilder() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];

  for (const currentLesson of flattenLessons()) {
    const card = lessonPitchBuilder(progress, currentLesson.id);
    assert.equal(card.lessonId, currentLesson.id);
    assert.equal(card.title, "3-line lesson pitch");
    assert.equal(card.readiness, "starter");
    assert.equal(card.readyStages, 0);
    assert.equal(card.totalStages, 3);
    assert.deepEqual(card.lines.map((line) => line.id), ["problem", "workflow", "tradeoff"]);
    assert.equal(card.lines.length, 3);
    assert.ok(card.lines.every((line) => line.label.length > 0 && line.text.length >= 30));
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project/i);
  }

  for (const question of lesson.questions) {
    const response = question.type === "short" ? question.keywords[0] : question.answer;
    answerQuestion(progress, { ...question, lessonId: lesson.id }, response, 1000);
  }

  const readyCard = lessonPitchBuilder(progress, lesson.id);
  assert.equal(readyCard.readyStages, 3);
  assert.equal(readyCard.readiness, "ready to rehearse");
  assert.ok(readyCard.nextAction.includes("Read"));
  assert.equal(lessonPitchBuilder(progress, "missing-lesson"), null);
}

function testLearningPuzzleBoard() {
  const progress = createInitialProgress(1000);
  let board = learningPuzzleBoard(progress);
  assert.equal(board.length, course.chapters.length);
  assert.equal(board[0].status, "new");
  assert.equal(board[1].status, "locked");
  assert.equal(board[0].stages.length, 3);
  assert.ok(board[0].whyItMatters.length >= 20);
  assert.ok(board[0].nextAction.includes("micro-lesson") || board[0].nextAction.includes("選擇"));
  assert.doesNotMatch(board.map((piece) => piece.nextAction).join(" "), /repo|project implementation|實作專案/i);

  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);
  completeLesson(progress, chapterLessons[0].id, 1000);
  board = learningPuzzleBoard(progress);
  assert.equal(board[0].status, "learning");
  assert.ok(board[0].percent > 0);
  assert.equal(board[0].stages[0].progress, `1/${chapterLessons.length}`);

  for (const lesson of chapterLessons.slice(1)) {
    completeLesson(progress, lesson.id, 1000);
  }
  board = learningPuzzleBoard(progress);
  assert.equal(board[0].status, "boss_ready");
  assert.ok(board[0].nextAction.includes("Boss Quiz"));

  completeBossQuiz(progress, chapter.id, 8, 8, 1000);
  board = learningPuzzleBoard(progress);
  assert.equal(board[0].status, "proven");
  assert.equal(board[1].status, "new");

  for (const question of interviewQuestionsForChapter(chapter.id)) {
    answerQuestion(progress, question, question.type === "multi" ? question.answer : question.answer ?? question.keywords[0], 1000);
  }
  board = learningPuzzleBoard(progress);
  assert.equal(board[0].status, "complete");
  assert.equal(board[0].percent, 100);
  assert.equal(board[0].stages[2].done, true);
}

function testInterviewScenarioCoverage() {
  assert.equal(interviewScenarios.length, course.chapters.length);
  assert.equal(flattenInterviewQuestions().length, 24);
  for (const chapter of course.chapters) {
    const questions = interviewQuestionsForChapter(chapter.id);
    assert.equal(questions.length, 3);
    assert.ok(questions.every((question) => ["single", "multi", "short"].includes(question.type)));
    assert.ok(questions.every((question) => question.lessonId === `interview:${chapter.id}`));
    assert.ok(questions.every((question) => question.chapterId === chapter.id));
    assert.ok(questions.every((question) => question.prompt.includes("面試情境")));
  }
}

function testLowFrictionQuestionTypes() {
  const questions = flattenQuestions();
  const typeCounts = countBy(questions, (question) => question.type);
  assert.equal(typeCounts.single, 72);
  assert.equal(typeCounts.multi, 24);
  assert.equal(typeCounts.short, 24);
  for (const question of questions) {
    assert.ok(["single", "multi", "short"].includes(question.type));
    assert.doesNotMatch(question.prompt, /實作專案|請寫程式|建立 repo/i);
  }
}

function testQuestionCoachHints() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  for (const question of questions) {
    const hint = questionCoachHint(question);
    assert.ok(hint.title.length > 0);
    assert.ok(hint.body.length >= 20);
    assert.doesNotMatch(`${hint.title} ${hint.body} ${hint.starter ?? ""}`, /repo|project implementation|專案實作/i);
    if (question.type === "short") {
      assert.ok(hint.starter.includes(question.keywords[0]) || hint.body.includes(question.keywords[0]));
      assert.ok(hint.body.includes("agent workflow"));
    } else {
      assert.equal(hint.starter, null);
    }
  }
}

function testChoiceEliminationHints() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  for (const question of questions) {
    const hint = choiceEliminationHint(question);
    if (question.type === "short") {
      assert.equal(hint, null);
      continue;
    }
    assert.equal(hint.title, "Elimination hint");
    assert.ok(hint.body.length >= 60);
    assert.equal(hint.checks.length, 3);
    assert.ok(hint.checks.every((check) => check.length >= 15));
    assert.doesNotMatch(JSON.stringify(hint), /repo|project implementation|build a project/i);
    if (question.type === "single") {
      assert.ok(hint.body.includes("cross out"));
      assert.ok(hint.checks.some((check) => check.includes("workflow")));
    }
    if (question.type === "multi") {
      assert.ok(hint.body.includes("Keep every option"));
      assert.ok(hint.checks.some((check) => check.includes("Do not stop")));
    }
  }
}

function testChoiceLensCards() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  for (const question of questions) {
    const card = choiceLensCard(question);
    if (question.type === "short") {
      assert.equal(card, null);
      continue;
    }
    assert.equal(card.title, "Choice Lens");
    assert.equal(card.mode, question.type);
    assert.equal(card.steps.length, 3);
    assert.ok(card.body.includes(question.type === "single" ? "one answer" : "multiple answers"));
    assert.ok(card.checkpoint.length >= 35);
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);
    if (question.type === "single") {
      assert.deepEqual(card.steps.map((step) => step.id), ["goal", "signal", "trap"]);
      assert.ok(card.steps.some((step) => step.text.includes("workflow state")));
    }
    if (question.type === "multi") {
      assert.deepEqual(card.steps.map((step) => step.id), ["parts", "coverage", "extras"]);
      assert.ok(card.steps.some((step) => step.text.includes("human feedback")));
    }
  }
}

function testQuestionHintDeck() {
  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  const singleDeck = questionHintDeck(single);
  assert.equal(singleDeck.title, "Hint Deck");
  assert.equal(singleDeck.mode, "single");
  assert.ok(singleDeck.summary.includes("one answer"));
  assert.ok(singleDeck.primaryNudge.includes("optional"));
  assert.deepEqual(singleDeck.cardIds, ["stage", "signal", "coach", "choice-lens", "elimination", "safety"]);

  const multiDeck = questionHintDeck(multi);
  assert.equal(multiDeck.mode, "multi");
  assert.ok(multiDeck.summary.includes("several signals"));
  assert.ok(multiDeck.cardIds.includes("choice-lens"));

  const shortDeck = questionHintDeck(short);
  assert.equal(shortDeck.mode, "short");
  assert.ok(shortDeck.summary.includes("one sentence"));
  assert.deepEqual(shortDeck.cardIds, ["stage", "signal", "coach", "safety"]);
  assert.doesNotMatch(JSON.stringify([singleDeck, multiDeck, shortDeck]), /repo|project implementation|build a project|coding task/i);
}

function testUncertaintySafetyCards() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  for (const question of questions) {
    const card = uncertaintySafetyCard(question);
    assert.equal(card.title, "Not sure is a valid move");
    assert.ok(["Recognize", "Connect", "Explain"].includes(card.stage));
    assert.ok(card.body.includes(card.stage.toLowerCase()));
    assert.ok(card.body.includes("perfect confidence"));
    assert.ok(card.action.length >= 50);
    assert.ok(card.reviewPromise.includes("review"));
    assert.ok(card.reviewPromise.includes("blank-page"));
    assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);
    if (question.type === "single") assert.ok(card.action.includes("Pick the option"));
    if (question.type === "multi") assert.ok(card.action.includes("Select every workflow part"));
    if (question.type === "short") assert.ok(card.action.includes("concept chip"));
  }
}

function testQuestionMasteryStage() {
  const expectedByType = {
    single: "recognize",
    multi: "connect",
    short: "explain"
  };
  for (const question of [...flattenQuestions(), ...flattenInterviewQuestions()]) {
    const stage = questionMasteryStage(question);
    assert.equal(stage.id, expectedByType[question.type]);
    assert.ok(["Recognize", "Connect", "Explain"].includes(stage.label));
    assert.ok(stage.proof.includes("question"));
    assert.ok(stage.nextAction.length >= 20);
    assert.doesNotMatch(JSON.stringify(stage), /repo|project implementation|build a project/i);
  }
}

function testQuestionSignalPreview() {
  const expectedRewardByType = {
    single: "Decision signal",
    multi: "Workflow map signal",
    short: "Interview wording signal"
  };
  const expectedFormatByType = {
    single: "One choice",
    multi: "Several defensible choices",
    short: "One short sentence"
  };
  for (const question of [...flattenQuestions(), ...flattenInterviewQuestions()]) {
    const preview = questionSignalPreview(question);
    assert.equal(preview.title, "Question Signal");
    assert.equal(preview.reward, expectedRewardByType[question.type]);
    assert.equal(preview.format, expectedFormatByType[question.type]);
    assert.ok(["Recognize", "Connect", "Explain"].includes(preview.stage));
    assert.ok(preview.tinyMove.length >= 30);
    assert.ok(preview.proofUse.includes(question.chapterTitle));
    assert.deepEqual(preview.steps.map((step) => step.id), ["look", "answer", "save"]);
    assert.equal(preview.steps[1].text, preview.format);
    assert.equal(preview.steps[2].text, preview.reward);
    assert.doesNotMatch(JSON.stringify(preview), /repo|project implementation|build a project|coding task/i);
  }
}

function testSessionRhythmCard() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];
  const session = buildSessionQuestions(progress, lesson, 1000);
  let rhythm = sessionRhythmCard(session, 0);

  assert.equal(rhythm.title, "Session Rhythm");
  assert.equal(rhythm.choiceCount, 4);
  assert.equal(rhythm.shortCount, 1);
  assert.ok(rhythm.headline.includes("4 choice prompts"));
  assert.equal(rhythm.currentLabel, "Recognize");
  assert.equal(rhythm.steps[0].status, "current");
  assert.equal(rhythm.steps.at(-1).type, "short");
  assert.equal(rhythm.steps.at(-1).label, "Explain");
  assert.ok(rhythm.steps.slice(0, -1).every((step) => step.choiceBased));
  assert.doesNotMatch(JSON.stringify(rhythm), /repo|project implementation|build a project|coding task/i);

  rhythm = sessionRhythmCard(session, session.length - 1);
  assert.equal(rhythm.currentLabel, "Explain");
  assert.equal(rhythm.currentFormat, "One short sentence");
  assert.equal(rhythm.steps.at(-1).status, "current");
  assert.ok(rhythm.steps.slice(0, -1).every((step) => step.status === "done"));

  rhythm = sessionRhythmCard([], 10);
  assert.equal(rhythm.headline, "No active prompts");
  assert.equal(rhythm.steps.length, 0);
}

function testAbilityShardCard() {
  const progress = createInitialProgress(1000);
  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  let shard = abilityShardCard(progress, single);
  assert.equal(shard.title, "Ability Shard");
  assert.equal(shard.status, "available");
  assert.equal(shard.stage, "Recognize");
  assert.equal(shard.shard, "Decision shard");
  assert.ok(shard.headline.includes("Collect"));
  assert.ok(shard.jobUse.includes("agent"));
  assert.equal(shard.progressLabel, "0 clean / 0 review");
  assert.doesNotMatch(JSON.stringify(shard), /repo|project implementation|build a project|coding task/i);

  answerQuestion(progress, single, 99, 1000);
  shard = abilityShardCard(progress, single);
  assert.equal(shard.status, "repair");
  assert.ok(shard.body.includes("review target"));
  assert.equal(shard.progressLabel, "0 clean / 1 review");

  answerQuestion(progress, single, single.answer, 2000);
  shard = abilityShardCard(progress, single);
  assert.equal(shard.status, "collected");
  assert.ok(shard.nextUse.includes("short explanation"));
  assert.equal(shard.progressLabel, "1 clean / 1 review");

  assert.equal(abilityShardCard(progress, multi).shard, "Workflow link shard");
  assert.equal(abilityShardCard(progress, short).shard, "Interview line shard");
}

function testShortAnswerSupport() {
  const short = flattenQuestions().find((item) => item.type === "short");
  const single = flattenQuestions().find((item) => item.type === "single");
  const support = shortAnswerSupport(short);

  assert.equal(shortAnswerSupport(single), null);
  assert.equal(support.title, "概念積木");
  assert.equal(support.concepts.length, short.keywords.length);
  assert.deepEqual(support.concepts, short.keywords);
  assert.equal(support.needed, short.minMatches);
  assert.ok(support.prompt.includes("自己的話"));
  assert.ok(support.sentenceTemplate.includes(short.keywords[0]));
  assert.ok(support.sentenceTemplate.includes("agentic workflow"));
  assert.equal(gradeQuestion(short, support.sentenceTemplate).correct, true);
  assert.doesNotMatch(`${support.prompt} ${support.sentenceTemplate} ${support.concepts.join(" ")}`, /請寫程式|建立 repo|project implementation/i);
}

function testShortAnswerRecipe() {
  const short = flattenQuestions().find((item) => item.type === "short");
  const single = flattenQuestions().find((item) => item.type === "single");
  const recipe = shortAnswerRecipe(short);

  assert.equal(shortAnswerRecipe(single), null);
  assert.equal(recipe.title, "One-Sentence Recipe");
  assert.deepEqual(recipe.steps.map((step) => step.id), ["pick", "link", "stop"]);
  assert.ok(recipe.steps[0].text.includes(short.keywords[0]));
  assert.ok(recipe.steps[1].text.includes("workflow"));
  assert.ok(recipe.promise.includes("One useful sentence"));
  assert.doesNotMatch(JSON.stringify(recipe), /repo|project implementation|build a project|coding task/i);
}

function testAnswerEvidenceClips() {
  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  const savedClip = answerEvidenceClip(single, gradeQuestion(single, single.answer));
  assert.equal(savedClip.title, "Evidence Clip");
  assert.equal(savedClip.status, "saved");
  assert.equal(savedClip.stage, "Recognize");
  assert.ok(savedClip.headline.includes("reusable signal"));
  assert.ok(savedClip.line.startsWith("I can "));
  assert.ok(savedClip.useCase.includes("interview"));
  assert.ok(savedClip.nextAction.includes("next tiny prompt"));

  const repairClip = answerEvidenceClip(multi, gradeQuestion(multi, []));
  assert.equal(repairClip.status, "repair");
  assert.equal(repairClip.stage, "Connect");
  assert.ok(repairClip.headline.includes("repair target"));
  assert.ok(repairClip.useCase.includes("Review"));

  const shortClip = answerEvidenceClip(short, gradeQuestion(short, short.keywords[0]));
  assert.equal(shortClip.stage, "Explain");
  assert.ok(shortClip.line.includes(short.keywords[0]));
  assert.doesNotMatch(JSON.stringify([savedClip, repairClip, shortClip]), /repo|project implementation|build a project|coding task/i);
}

function testAnswerProofLines() {
  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  const singleProof = answerProofLine(single, gradeQuestion(single, single.answer));
  const multiProof = answerProofLine(multi, gradeQuestion(multi, multi.answer));
  const shortProof = answerProofLine(short, gradeQuestion(short, short.keywords[0]));

  assert.ok(singleProof.title.includes("Recognize"));
  assert.ok(multiProof.title.includes("Connect"));
  assert.ok(shortProof.title.includes("Explain"));
  for (const proof of [singleProof, multiProof, shortProof]) {
    assert.ok(proof.body.startsWith("I can "));
    assert.ok(proof.body.includes("workflow"));
    assert.doesNotMatch(`${proof.title} ${proof.body}`, /repo|project implementation|build a project/i);
  }
}

function testProofBoosterCard() {
  const progress = createInitialProgress(1000);
  const [single, nextSingle] = flattenQuestions().filter((item) => item.type === "single");

  let result = gradeQuestion(single, single.answer);
  answerQuestion(progress, single, single.answer, 1000);
  let booster = proofBoosterCard(single, result, progress);
  assert.equal(booster.title, "Proof Booster");
  assert.equal(booster.status, "proof");
  assert.equal(booster.stage, "Recognize");
  assert.equal(booster.correctCount, 1);
  assert.equal(booster.wrongCount, 0);
  assert.ok(booster.headline.includes("evidence"));
  assert.ok(booster.proofLine.startsWith("I can "));
  assert.ok(booster.nextUse.includes("one-line coach"));
  assert.doesNotMatch(JSON.stringify(booster), /repo|project implementation|build a project|coding task/i);

  result = gradeQuestion(nextSingle, 99);
  answerQuestion(progress, nextSingle, 99, 2000);
  booster = proofBoosterCard(nextSingle, result, progress);
  assert.equal(booster.status, "review");
  assert.equal(booster.correctCount, 0);
  assert.equal(booster.wrongCount, 1);
  assert.ok(booster.headline.includes("review seed"));
  assert.ok(booster.nextUse.includes("review loop"));
}

function testQuestionMasterySignals() {
  const progress = createInitialProgress(1000);
  const question = flattenQuestions().find((item) => item.type === "single");
  assert.equal(questionMasterySignal(progress, question), null);

  answerQuestion(progress, question, 99, 1000);
  let signal = questionMasterySignal(progress, question);
  assert.equal(signal.level, "review");
  assert.equal(signal.correctCount, 0);
  assert.equal(signal.wrongCount, 1);
  assert.ok(signal.body.includes("review"));
  assert.doesNotMatch(JSON.stringify(signal), /repo|project implementation|build a project/i);

  answerQuestion(progress, question, question.answer, 1000);
  signal = questionMasterySignal(progress, question);
  assert.equal(signal.level, "first-pass");
  assert.equal(signal.correctCount, 1);
  assert.equal(signal.wrongCount, 1);

  answerQuestion(progress, question, question.answer, 2000);
  signal = questionMasterySignal(progress, question);
  assert.equal(signal.level, "strengthening");

  answerQuestion(progress, question, question.answer, 3000);
  signal = questionMasterySignal(progress, question);
  assert.equal(signal.level, "stable");
  assert.ok(signal.body.includes("job-facing explanation"));
}

function testLearningReceiptReel() {
  const progress = createInitialProgress(1000);
  let reel = learningReceiptReel(progress);
  assert.equal(reel.title, "Learning Receipt Reel");
  assert.equal(reel.receipts.length, 0);
  assert.ok(reel.emptyAction.includes("choice question"));

  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  answerQuestion(progress, single, single.answer, 1000);
  answerQuestion(progress, multi, [], 2000);
  reel = learningReceiptReel(progress);

  assert.equal(reel.receipts.length, 2);
  assert.equal(reel.receipts[0].status, "review");
  assert.equal(reel.receipts[0].resultLabel, "Review seed");
  assert.equal(reel.receipts[1].status, "proof");
  assert.equal(reel.receipts[1].resultLabel, "Proof gained");
  assert.ok(reel.receipts.every((receipt) => ["Recognize", "Connect", "Explain"].includes(receipt.stage)));
  assert.ok(reel.receipts.every((receipt) => receipt.proof.includes(receipt.chapterTitle)));
  assert.ok(reel.receipts.every((receipt) => receipt.evidenceLine.startsWith("I can ")));
  assert.ok(reel.receipts.every((receipt) => receipt.evidenceHeadline.includes(receipt.status === "proof" ? "reusable signal" : "repair target")));
  assert.ok(reel.receipts.every((receipt) => receipt.evidenceUseCase.includes(receipt.status === "proof" ? "interview" : "Review")));
  assert.ok(reel.receipts.every((receipt) => receipt.nextUse.length >= 30));
  assert.doesNotMatch(JSON.stringify(reel), /repo|project implementation|build a project|coding task/i);
}

function testSignalPreviewCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let preview = signalPreviewCard(progress, now);
  assert.equal(preview.title, "Signal Preview");
  assert.equal(preview.mode, "lesson");
  assert.equal(preview.reward, "New learning receipt");
  assert.equal(preview.receiptCount, 0);
  assert.equal(preview.cleanRun, 0);
  assert.deepEqual(preview.steps.map((step) => step.id), ["start", "signal", "reuse"]);
  assert.ok(preview.headline.includes("unlock"));
  assert.doesNotMatch(JSON.stringify(preview), /repo|project implementation|build a project|coding task/i);

  const [question] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, question, 99, now);
  preview = signalPreviewCard(progress, now);
  assert.equal(preview.mode, "review");
  assert.equal(preview.reward, "Cleaner recall");
  assert.equal(preview.receiptCount, 1);
  assert.ok(preview.reuse.includes("repaired weak signal"));

  progress.reviewQueue = [];
  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  preview = signalPreviewCard(progress, now);
  assert.equal(preview.mode, "boss");
  assert.equal(preview.reward, "Boss-proven evidence");
}

function testAnswerRecallCues() {
  const single = flattenQuestions().find((item) => item.type === "single");
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  const singleCue = answerRecallCue(single, gradeQuestion(single, single.answer));
  const multiCue = answerRecallCue(multi, gradeQuestion(multi, multi.answer));
  const shortCue = answerRecallCue(short, gradeQuestion(short, short.keywords[0]));

  for (const cue of [singleCue, multiCue, shortCue]) {
    assert.ok(cue.title.length > 0);
    assert.ok(cue.body.includes("workflow"));
    assert.doesNotMatch(`${cue.title} ${cue.body}`, /repo|project implementation|專案實作/i);
  }
  assert.ok(singleCue.body.includes(single.choices[single.answer]));
  assert.ok(multiCue.body.includes(multi.choiceFeedback.find((item) => item.correct).choice));
  assert.ok(shortCue.body.includes(short.keywords[0]));
}

function testMistakeRescuePrompts() {
  const questions = [...flattenQuestions(), ...flattenInterviewQuestions()];
  for (const question of questions) {
    const wrongResult = gradeQuestion(question, question.type === "multi" ? [] : "__wrong__");
    const rescue = mistakeRescuePrompt(question, wrongResult);
    assert.equal(wrongResult.correct, false);
    assert.ok(rescue.title.length > 0);
    assert.ok(rescue.body.length >= 20);
    assert.doesNotMatch(`${rescue.title} ${rescue.body}`, /repo|project implementation|專案實作/i);
    assert.equal(mistakeRescuePrompt(question, { ...wrongResult, correct: true }), null);
  }
}

function testSingleChoice() {
  const question = flattenQuestions().find((item) => item.type === "single");
  assert.equal(gradeQuestion(question, question.answer).correct, true);
  assert.equal(gradeQuestion(question, 99).correct, false);
}

function testMultiChoice() {
  const question = flattenQuestions().find((item) => item.type === "multi");
  assert.equal(gradeQuestion(question, question.answer).correct, true);
  assert.equal(gradeQuestion(question, [question.answer[0]]).correct, false);
}

function testChoiceFeedback() {
  const selectableQuestions = [...flattenQuestions(), ...flattenInterviewQuestions()].filter((question) =>
    ["single", "multi"].includes(question.type)
  );
  for (const question of selectableQuestions) {
    assert.equal(question.choiceFeedback.length, question.choices.length);
    assert.ok(question.choiceFeedback.every((item) => item.choice && item.reason));
    assert.deepEqual(
      question.choiceFeedback.map((item) => item.correct),
      question.choices.map((_, index) =>
        question.type === "single" ? index === question.answer : question.answer.includes(index)
      )
    );
  }
}

function testShortAnswer() {
  const question = flattenQuestions().find((item) => item.type === "short");
  assert.equal(gradeQuestion(question, question.keywords[0]).correct, true);
  assert.equal(gradeQuestion(question, "完全無關").correct, false);
}

function testShortAnswerFeedback() {
  const shortQuestions = [...flattenQuestions(), ...flattenInterviewQuestions()].filter((question) => question.type === "short");
  for (const question of shortQuestions) {
    assert.ok(question.sampleAnswer.includes(question.keywords[0]));
    const result = gradeQuestion(question, question.keywords[0]);
    assert.deepEqual(result.matches, [question.keywords[0]]);
    assert.equal(result.missing.length, question.keywords.length - 1);
    assert.equal(result.expected, question.keywords);
  }
}

function testEmptyAnswersAreNotCorrect() {
  const single = flattenQuestions().find((item) => item.type === "single" && item.answer === 0);
  const multi = flattenQuestions().find((item) => item.type === "multi");
  const short = flattenQuestions().find((item) => item.type === "short");

  assert.equal(isAnswerReady(single, null), false);
  assert.equal(gradeQuestion(single, null).correct, false);
  assert.equal(isAnswerReady(multi, []), false);
  assert.equal(gradeQuestion(multi, []).correct, false);
  assert.equal(isAnswerReady(short, ""), false);
  assert.equal(gradeQuestion(short, "").correct, false);

  const progress = createInitialProgress(1000);
  answerQuestion(progress, single, null, 1000);
  assert.equal(getDueReviewQuestions(progress, 1000, 1)[0].id, single.id);
}

function testWrongAnswerReview() {
  const progress = createInitialProgress(1000);
  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, 99, 1000);
  const due = getDueReviewQuestions(progress, 1000, 3);
  assert.equal(due[0].id, question.id);
}

function testCorrectAnswerReview() {
  const progress = createInitialProgress(1000);
  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, 1000);
  assert.equal(getDueReviewQuestions(progress, 1000, 3).length, 0);
  assert.equal(getDueReviewQuestions(progress, 1000 + 24 * 60 * 60 * 1000, 3).length, 1);
}

function testLessonCompletion() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  const lesson = flattenLessons()[0];
  completeLesson(progress, lesson.id, now);
  assert.equal(progress.completedLessons.includes(lesson.id), true);
  assert.equal(progress.currentLessonIndex, 1);
  assert.equal(progress.streak, 1);
  assert.equal(dailyMomentum(progress, now).lessonsCompletedToday, 1);

  completeLesson(progress, lesson.id, now);
  assert.equal(progress.completedLessons.filter((id) => id === lesson.id).length, 1);
  assert.equal(progress.currentLessonIndex, 1);
  assert.equal(progress.streak, 1);
  assert.equal(dailyMomentum(progress, now).lessonsCompletedToday, 1);
}

function testSessionReview() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];
  const question = { ...lesson.questions[0], lessonId: lesson.id, lessonTitle: lesson.title, chapterId: lesson.chapterId, chapterTitle: lesson.chapterTitle };
  answerQuestion(progress, question, 99, 1000);
  const session = buildSessionQuestions(progress, lesson, 1000);
  assert.equal(session[0].id, question.id);
  assert.ok(masteryForLesson(progress, lesson) >= 0);
}

function testFreshSessionChoiceFirst() {
  for (const lesson of flattenLessons()) {
    const progress = createInitialProgress(1000);
    const session = buildSessionQuestions(progress, lesson, 1000);
    const typeCounts = countBy(session, (question) => question.type);
    const firstShortIndex = session.findIndex((question) => question.type === "short");

    assert.equal(typeCounts.single, 3);
    assert.equal(typeCounts.multi, 1);
    assert.equal(typeCounts.short, 1);
    assert.equal(firstShortIndex, session.length - 1);
    assert.ok(session.slice(0, firstShortIndex).every((question) => ["single", "multi"].includes(question.type)));
  }
}

function testFreshSessionQuestionKeys() {
  const progress = createInitialProgress(1000);
  const lesson = flattenLessons()[0];
  const session = buildSessionQuestions(progress, lesson, 1000);
  answerQuestion(progress, session[0], session[0].answer, 1000);
  assert.ok(progress.answered[`${lesson.id}:${session[0].id}`]);
  assert.equal(progress.answered[`undefined:${session[0].id}`], undefined);
}

function testReviewModeOnlyDue() {
  const progress = createInitialProgress(1000);
  const [dueQuestion, futureQuestion] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, dueQuestion, 99, 1000);
  answerQuestion(progress, futureQuestion, futureQuestion.answer, 1000);
  const review = buildReviewSessionQuestions(progress, 1000, 7);
  assert.equal(review.length, 1);
  assert.equal(review[0].id, dueQuestion.id);
  assert.equal(review[0].lessonId, dueQuestion.lessonId);
}

function testReviewStats() {
  const progress = createInitialProgress(1000);
  const [wrongQuestion, correctQuestion] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, wrongQuestion, 99, 1000);
  answerQuestion(progress, correctQuestion, correctQuestion.answer, 1000);
  const stats = reviewStats(progress, 1000);
  assert.equal(stats.dueCount, 1);
  assert.equal(stats.scheduledCount, 2);
  assert.equal(stats.wrongCount, 1);
}

function testReviewRhythmCard() {
  const now = 1000;
  const day = 24 * 60 * 60 * 1000;
  const progress = createInitialProgress(now);
  let card = reviewRhythmCard(progress, now);
  assert.equal(card.status, "No review debt");
  assert.equal(card.dueNow, 0);
  assert.equal(card.next24h, 0);
  assert.equal(card.next7d, 0);
  assert.ok(card.nextAction.includes("Answer a few questions"));
  assert.ok(card.proofLine.includes("Wrong answers"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project/i);

  const [wrongQuestion, firstCorrect, secondCorrect] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, wrongQuestion, 99, now);
  answerQuestion(progress, firstCorrect, firstCorrect.answer, now);
  answerQuestion(progress, secondCorrect, secondCorrect.answer, now);
  answerQuestion(progress, secondCorrect, secondCorrect.answer, now + day);
  card = reviewRhythmCard(progress, now);
  assert.equal(card.status, "Review ready now");
  assert.equal(card.dueNow, 1);
  assert.equal(card.next24h, 1);
  assert.equal(card.next7d, 1);
  assert.equal(card.wrongCount, 1);
  assert.equal(card.scheduledCount, 3);

  progress.reviewQueue = progress.reviewQueue.filter((item) => item.dueAt > now);
  card = reviewRhythmCard(progress, now);
  assert.equal(card.status, "Review coming soon");
  assert.equal(card.dueNow, 0);
  assert.equal(card.next24h, 1);
}

function testReviewSprintCard() {
  const now = 1000;
  const day = 24 * 60 * 60 * 1000;
  const progress = createInitialProgress(now);
  let card = reviewSprintCard(progress, now);
  assert.equal(card.title, "Review Sprint");
  assert.equal(card.mode, "empty");
  assert.equal(card.dueCount, 0);
  assert.equal(card.scheduledCount, 0);
  assert.equal(card.focus, null);
  assert.deepEqual(card.steps.map((step) => step.id), ["peek", "choose", "loop"]);
  assert.ok(card.primaryAction.includes("single-choice"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const [wrongQuestion, correctQuestion] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, wrongQuestion, 99, now);
  card = reviewSprintCard(progress, now);
  assert.equal(card.mode, "ready");
  assert.equal(card.dueCount, 1);
  assert.equal(card.focus.prompt, wrongQuestion.prompt);
  assert.ok(card.queueLabel.includes("due"));
  assert.ok(card.primaryAction.includes("review queue"));

  answerQuestion(progress, wrongQuestion, wrongQuestion.answer, now);
  answerQuestion(progress, correctQuestion, correctQuestion.answer, now);
  card = reviewSprintCard(progress, now + 1);
  assert.equal(card.mode, "scheduled");
  assert.equal(card.dueCount, 0);
  assert.ok(card.scheduledCount >= 1);

  card = reviewSprintCard(progress, now + day);
  assert.equal(card.mode, "ready");
  assert.ok(card.dueCount >= 1);
}

function testReviewRescueQuest() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let quest = reviewRescueQuest(progress, now);
  assert.equal(quest.title, "Rescue Quest");
  assert.equal(quest.mode, "empty");
  assert.equal(quest.cards.length, 0);
  assert.ok(quest.nextAction.includes("Missed answers"));
  assert.doesNotMatch(JSON.stringify(quest), /repo|project implementation|build a project|coding task/i);

  const [wrongQuestion, coolingQuestion] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, wrongQuestion, 99, now);
  answerQuestion(progress, coolingQuestion, 99, now);
  progress.reviewQueue = progress.reviewQueue.map((item) =>
    item.questionKey === questionKey(coolingQuestion) ? { ...item, dueAt: now + 60_000 } : item
  );
  quest = reviewRescueQuest(progress, now);
  assert.equal(quest.mode, "active");
  assert.equal(quest.dueCount, 1);
  assert.equal(quest.lockedCount, 1);
  assert.deepEqual(new Set(quest.cards.map((card) => card.status)), new Set(["active", "locked"]));
  assert.ok(quest.cards.find((card) => card.status === "active").reward.includes("Recover"));
  assert.ok(quest.promise.includes("tiny quiz move"));

  answerQuestion(progress, wrongQuestion, wrongQuestion.answer, now + 1);
  quest = reviewRescueQuest(progress, now + 2);
  assert.equal(quest.mode, "waiting");
  assert.equal(quest.rescuedCount, 1);
  assert.ok(quest.cards.find((card) => card.status === "rescued").reward.includes("memory"));
}

function testMistakeSafetyNetCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let card = mistakeSafetyNetCard(progress, now);
  assert.equal(card.title, "Mistake Safety Net");
  assert.equal(card.mode, "safe-start");
  assert.equal(card.dueCount, 0);
  assert.deepEqual(card.steps.map((step) => step.id), ["miss", "return", "repair"]);
  assert.ok(card.body.includes("review card"));
  assert.ok(card.nextAction.includes("choice"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, 99, now);
  card = mistakeSafetyNetCard(progress, now);
  assert.equal(card.mode, "rescue-now");
  assert.equal(card.dueCount, 1);
  assert.ok(card.headline.includes("memory"));

  answerQuestion(progress, question, question.answer, now + 1);
  card = mistakeSafetyNetCard(progress, now + 2);
  assert.equal(card.mode, "cooling");
  assert.equal(card.rescuedCount, 1);
}

function testBossQuizQuestions() {
  const chapter = course.chapters[0];
  const bossQuestions = bossQuestionsForChapter(chapter.id, 8);
  assert.equal(bossQuestions.length, 8);
  assert.ok(bossQuestions.every((question) => question.chapterId === chapter.id));
  assert.ok(bossQuestions.every((question) => question.type === "single" || question.type === "multi"));
  assert.ok(bossQuestions.every((question) => question.lessonId));
}

function testBossQuizCompletion() {
  const progress = createInitialProgress(1000);
  completeBossQuiz(progress, "agent-basics", 7, 8, 1000);
  assert.equal(progress.bossResults[0].passed, true);
  assert.equal(progress.xp, 50);
  completeBossQuiz(progress, "agent-basics", 4, 8, 2000);
  assert.equal(progress.bossResults.length, 1);
  assert.equal(progress.bossResults[0].passed, false);
  assert.equal(progress.xp, 65);
}

function testDailyMissions() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  const questions = flattenQuestions().filter((item) => item.type === "single");
  for (const question of questions.slice(0, 5)) {
    answerQuestion(progress, question, question.answer, now);
  }
  completeLesson(progress, flattenLessons()[0].id, now);
  completeBossQuiz(progress, "agent-basics", 7, 8, now);
  const missions = dailyMissions(progress, now);
  assert.equal(missions.every((mission) => mission.done), true);
  assert.ok(missions.find((mission) => mission.id === "bank-phrase").done);
}

function testDailyQuestSnapshot() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 0);
  assert.equal(snapshot.totalCount, 4);
  assert.equal(snapshot.percent, 0);
  assert.ok(snapshot.nextStep.includes("還差"));

  const questions = flattenQuestions().filter((item) => item.type === "single");
  for (const question of questions.slice(0, 5)) {
    answerQuestion(progress, question, question.answer, now);
  }
  snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 2);
  assert.ok(snapshot.percent > 0);

  completeLesson(progress, flattenLessons()[0].id, now);
  completeBossQuiz(progress, "agent-basics", 7, 8, now);
  snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 4);
  assert.equal(snapshot.percent, 100);
  assert.ok(snapshot.nextStep.includes("已完成"));
}

function testDailyMinimumCard() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let card = dailyMinimumCard(progress, now);
  assert.equal(card.title, "3-minute minimum");
  assert.equal(card.status, "open");
  assert.equal(card.doneCount, 1);
  assert.equal(card.totalCount, 3);
  assert.deepEqual(card.checks.map((check) => check.id), ["answer-one", "save-signal", "know-next"]);
  assert.equal(card.checks.find((check) => check.id === "answer-one").done, false);
  assert.equal(card.checks.find((check) => check.id === "know-next").done, true);
  assert.ok(card.body.includes("No project work"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  card = dailyMinimumCard(progress, now);
  assert.equal(card.status, "done");
  assert.equal(card.doneCount, 3);
  assert.equal(card.checks.find((check) => check.id === "answer-one").done, true);
  assert.ok(card.headline.includes("banked"));
}

function testDailyLandingStepCard() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let card = dailyLandingStepCard(progress, now);
  assert.equal(card.title, "Daily Landing Step");
  assert.equal(card.status, "open");
  assert.equal(card.minimumAction, "Clear one tiny lesson step");
  assert.ok(card.abilityPiece.includes("Recognize"));
  assert.ok(card.jobUse.includes("evidence"));
  assert.deepEqual(card.route.map((step) => step.id), ["today", "piece", "landing"]);
  assert.ok(card.route.find((step) => step.id === "today").text.includes("low-friction"));
  assert.ok(card.promise.includes("job-facing evidence"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  card = dailyLandingStepCard(progress, now);
  assert.equal(card.status, "done");
  assert.ok(card.headline.includes("landing path"));
  assert.ok(card.route.find((step) => step.id === "today").text.includes("banked"));

  answerQuestion(progress, question, 99, now + 1);
  card = dailyLandingStepCard(progress, now + 1);
  assert.equal(card.minimumAction, "Rescue one weak signal");
  assert.equal(card.abilityPiece, "recall stability");
}

function testDailyPhraseBankCard() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let card = dailyPhraseBankCard(progress);
  assert.equal(card.title, "Today Phrase Bank");
  assert.equal(card.status, "empty");
  assert.equal(card.proofCount, 0);
  assert.equal(card.repairCount, 0);
  assert.ok(card.latestLine.includes("one low-friction question"));
  assert.equal(card.roleSignal, "AI App Builder");
  assert.equal(card.roleLevel, "starter");
  assert.ok(card.roleUse.includes("role signal"));
  assert.ok(card.promise.includes("choice questions"));
  assert.deepEqual(card.rehearsalSteps.map((step) => step.id), ["read", "trim", "say"]);
  assert.ok(card.rehearsalSteps.find((step) => step.id === "say").text.includes("No blank-page"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const [single, multi] = flattenQuestions().filter((item) => ["single", "multi"].includes(item.type));
  answerQuestion(progress, single, single.answer, now);
  answerQuestion(progress, multi, [], now + 1);
  card = dailyPhraseBankCard(progress);
  assert.equal(card.status, "started");
  assert.equal(card.proofCount, 1);
  assert.equal(card.repairCount, 1);
  assert.ok(card.headline.includes("reusable lines"));
  assert.ok(card.latestLine.startsWith("I can "));
  assert.ok(card.latestUse.includes("Review"));
  assert.ok(card.roleSignal.length > 0);
  assert.ok(card.roleUse.includes(card.roleSignal));
  assert.ok(["starter", "warming up", "building evidence", "interview-ready"].includes(card.roleLevel));
  assert.ok(card.nextAction.includes("one-line coach"));
  assert.ok(card.rehearsalSteps.find((step) => step.id === "say").text.includes("interview sentence"));
}

function testZeroToLandingQuestCard() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let card = zeroToLandingQuestCard(progress, now);
  assert.equal(card.title, "Zero-to-Landing Quest");
  assert.equal(card.completedCount, 0);
  assert.equal(card.totalCount, 5);
  assert.equal(card.percent, 0);
  assert.equal(card.activeId, "first-choice");
  assert.deepEqual(card.milestones.map((milestone) => milestone.id), [
    "first-choice",
    "first-receipt",
    "boss-proof",
    "role-signal",
    "interview-line"
  ]);
  assert.equal(card.milestones[0].status, "active");
  assert.ok(card.promise.includes("choices"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  card = zeroToLandingQuestCard(progress, now);
  assert.equal(card.milestones.find((milestone) => milestone.id === "first-choice").status, "done");
  assert.equal(card.activeId, "first-receipt");

  completeLesson(progress, flattenLessons()[0].id, now);
  card = zeroToLandingQuestCard(progress, now);
  assert.equal(card.milestones.find((milestone) => milestone.id === "first-receipt").status, "done");

  const firstChapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === firstChapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  completeBossQuiz(progress, firstChapter.id, 8, 8, now);
  card = zeroToLandingQuestCard(progress, now);
  assert.equal(card.milestones.find((milestone) => milestone.id === "boss-proof").status, "done");
  assert.equal(card.milestones.find((milestone) => milestone.id === "role-signal").status, "done");
  assert.equal(card.activeId, "interview-line");
}

function testRoleSamplerCard() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let card = roleSamplerCard(progress);
  assert.equal(card.title, "Role Sampler");
  assert.equal(card.tracks.length, 3);
  assert.equal(card.sampledCount, 0);
  assert.equal(card.totalCount, 3);
  assert.equal(card.progressLabel, "0/3 sampled");
  assert.equal(card.activeRole, "AI App Builder");
  assert.ok(card.headline.includes("one choice"));
  assert.ok(card.nextAction.includes("single-choice"));
  assert.ok(card.promise.includes("choice-first"));
  assert.ok(card.tracks.every((track) => track.sampled === false));
  assert.ok(card.tracks.every((track) => track.statusLabel === "try next"));
  assert.ok(card.tracks.every((track) => track.samplePrompt.includes("?")));
  assert.ok(card.tracks.every((track) => track.choiceMove.includes("Pick")));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  card = roleSamplerCard(progress);
  assert.equal(card.sampledCount, 2);
  assert.equal(card.progressLabel, "2/3 sampled");
  assert.equal(card.tracks.find((track) => track.id === "ai-app-builder").sampled, true);
  assert.equal(card.tracks.find((track) => track.id === "agent-workflow-builder").sampled, true);
  assert.equal(card.activeRole, "Agent Reliability Builder");
  assert.ok(card.headline.includes("2/3"));
  assert.ok(card.activeMove.length > 0);
}

function testQuestCompass() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let compass = questCompass(progress, now);
  assert.equal(compass.title, "Quest Compass");
  assert.equal(compass.missionType, "lesson");
  assert.equal(compass.unlock, "New receipt");
  assert.equal(compass.receiptCount, 0);
  assert.deepEqual(compass.steps.map((step) => step.id), ["start", "capture", "reuse"]);
  assert.ok(compass.reward.includes("Recognize"));
  assert.doesNotMatch(JSON.stringify(compass), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, 99, now);
  compass = questCompass(progress, now);
  assert.equal(compass.missionType, "review");
  assert.equal(compass.unlock, "Cleaner recall");
  assert.equal(compass.receiptCount, 1);
  assert.ok(compass.reward.includes("Repair"));

  const bossProgress = createInitialProgress(now);
  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(bossProgress, lesson.id, now);
  }
  compass = questCompass(bossProgress, now);
  assert.equal(compass.missionType, "boss");
  assert.equal(compass.unlock, "Proof gate");
}

function testDailyMomentum() {
  const day = 24 * 60 * 60 * 1000;
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let momentum = dailyMomentum(progress, now);
  assert.equal(momentum.activeToday, false);
  assert.equal(momentum.streakDays, 0);
  assert.equal(momentum.correctRate, 0);
  assert.ok(momentum.nextNudge.includes("1"));

  const questions = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, questions[0], questions[0].answer, now);
  momentum = dailyMomentum(progress, now);
  assert.equal(momentum.activeToday, true);
  assert.equal(momentum.streakDays, 1);
  assert.equal(momentum.answersToday, 1);
  assert.equal(momentum.correctRate, 100);
  assert.ok(momentum.nextNudge.includes("4"));

  answerQuestion(progress, questions[1], 99, now + day);
  momentum = dailyMomentum(progress, now + day);
  assert.equal(momentum.streakDays, 2);
  assert.equal(momentum.correctRate, 0);

  momentum = dailyMomentum(progress, now + 3 * day);
  assert.equal(momentum.activeToday, false);
  assert.equal(momentum.streakDays, 0);

  completeLesson(progress, flattenLessons()[0].id, now + 3 * day);
  momentum = dailyMomentum(progress, now + 3 * day);
  assert.equal(momentum.activeToday, true);
  assert.equal(momentum.streakDays, 1);
  assert.equal(momentum.lessonsCompletedToday, 1);

  const localLateNight = new Date(2026, 4, 8, 23, 55).getTime();
  const localNextMorning = new Date(2026, 4, 9, 0, 5).getTime();
  const localProgress = createInitialProgress(localLateNight);
  answerQuestion(localProgress, questions[2], questions[2].answer, localLateNight);
  assert.equal(dailyMomentum(localProgress, localLateNight).streakDays, 1);
  assert.equal(dailyMomentum(localProgress, localNextMorning).activeToday, false);
  assert.equal(dailyMomentum(localProgress, localNextMorning).streakDays, 1);
  answerQuestion(localProgress, questions[3], questions[3].answer, localNextMorning);
  assert.equal(dailyMomentum(localProgress, localNextMorning).streakDays, 2);
}

function testRecallComboCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let combo = recallComboCard(progress);
  assert.equal(combo.title, "Recall Combo");
  assert.equal(combo.mode, "empty");
  assert.equal(combo.cleanRun, 0);
  assert.equal(combo.target, 3);
  assert.equal(combo.meters.length, 3);
  assert.ok(combo.nextAction.includes("single-choice"));
  assert.doesNotMatch(JSON.stringify(combo), /repo|project implementation|build a project|coding task/i);

  const questions = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, questions[0], questions[0].answer, now);
  answerQuestion(progress, questions[1], 99, now + 1);
  combo = recallComboCard(progress);
  assert.equal(combo.mode, "building");
  assert.equal(combo.cleanRun, 0);
  assert.equal(combo.repairedSignals, 0);

  answerQuestion(progress, questions[1], questions[1].answer, now + 2);
  combo = recallComboCard(progress);
  assert.equal(combo.mode, "repair");
  assert.equal(combo.cleanRun, 2);
  assert.equal(combo.repairedSignals, 1);
  assert.ok(combo.nextAction.includes("1 more clean answer"));

  answerQuestion(progress, questions[2], questions[2].answer, now + 3);
  combo = recallComboCard(progress);
  assert.equal(combo.mode, "combo");
  assert.equal(combo.cleanRun, 3);
  assert.equal(combo.repairedSignals, 1);
  assert.ok(combo.headline.includes("3 clean answers"));

  answerQuestion(progress, questions[2], questions[2].answer, now + 4);
  combo = recallComboCard(progress);
  assert.ok(combo.stableSignals >= 1);
}

function testAchievements() {
  const progress = createInitialProgress(1000);
  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, 99, 1000);
  completeLesson(progress, flattenLessons()[0].id, 1000);
  completeBossQuiz(progress, "agent-basics", 7, 8, 1000);
  const badges = achievements(progress);
  assert.equal(badges.find((badge) => badge.id === "first-lesson").unlocked, true);
  assert.equal(badges.find((badge) => badge.id === "mistake-hunter").unlocked, true);
  assert.equal(badges.find((badge) => badge.id === "boss-clear").unlocked, true);
}

function testMistakeNotebook() {
  const progress = createInitialProgress(1000);
  const [firstWrong, secondWrong, correctOnly] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, firstWrong, 99, 1000);
  answerQuestion(progress, correctOnly, correctOnly.answer, 1500);
  answerQuestion(progress, secondWrong, 99, 2000);
  const notebook = mistakeNotebook(progress, 2000, 5);
  assert.equal(notebook.length, 2);
  assert.equal(notebook[0].question.id, secondWrong.id);
  assert.equal(notebook[0].due, true);
  assert.equal(notebook[0].wrongCount, 1);
  assert.ok(notebook[0].rescue.title.length > 0);
  assert.ok(notebook[0].rescue.body.length >= 20);
  assert.ok(notebook[0].repairLine.startsWith("I can "));
  assert.ok(notebook[0].repairUseCase.includes("Review"));
  assert.equal(notebook.some((item) => item.question.id === correctOnly.id), false);
}

function testMistakeFocusCard() {
  const progress = createInitialProgress(1000);
  assert.equal(mistakeFocusCard(progress, 1000), null);

  const [firstWrong, secondWrong] = flattenQuestions().filter((item) => item.type === "single");
  answerQuestion(progress, firstWrong, 99, 1000);
  answerQuestion(progress, secondWrong, 99, 2000);
  answerQuestion(progress, secondWrong, 99, 3000);

  const focus = mistakeFocusCard(progress, 3000);
  assert.equal(focus.prompt, secondWrong.prompt);
  assert.equal(focus.wrongCount, 2);
  assert.equal(focus.due, true);
  assert.equal(focus.dueCount, 2);
  assert.equal(focus.totalWrong, 3);
  assert.ok(focus.rescue.body.length >= 20);
  assert.ok(focus.repairLine.startsWith("I can "));
  assert.ok(focus.repairUseCase.includes("Review"));
  assert.ok(focus.nextAction.includes("複習"));
}

function testChapterMap() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);
  completeLesson(progress, chapterLessons[0].id, 1000);
  completeBossQuiz(progress, chapter.id, 7, 8, 1000);
  const map = chapterMap(progress);
  const firstChapter = map[0];
  assert.equal(map.length, course.chapters.length);
  assert.equal(firstChapter.chapterId, chapter.id);
  assert.equal(firstChapter.completedLessons, 1);
  assert.equal(firstChapter.totalLessons, chapterLessons.length);
  assert.equal(firstChapter.lessonPercent, 33);
  assert.equal(firstChapter.bossPassed, true);
  assert.equal(firstChapter.status, "cleared");
}

function testChapterGateMap() {
  const progress = createInitialProgress(1000);
  let gates = chapterGateMap(progress);
  assert.equal(gates[0].gate, "current");
  assert.equal(gates[0].lessonsUnlocked, true);
  assert.equal(gates[0].bossUnlocked, false);
  assert.equal(gates[1].gate, "locked");
  assert.equal(gates[1].lessonsUnlocked, false);

  const firstChapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === firstChapter.id)) {
    completeLesson(progress, lesson.id, 1000);
  }
  gates = chapterGateMap(progress);
  assert.equal(gates[0].bossUnlocked, true);
  assert.equal(gates[0].interviewUnlocked, false);

  completeBossQuiz(progress, firstChapter.id, 7, 8, 1000);
  gates = chapterGateMap(progress);
  assert.equal(gates[0].gate, "cleared");
  assert.equal(gates[0].interviewUnlocked, true);
  assert.equal(gates[0].pitchUnlocked, true);
  assert.equal(gates[1].gate, "current");
  assert.equal(gates[1].lessonsUnlocked, true);
}

function testBossReadinessCard() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  let card = bossReadinessCard(progress, chapter.id);
  assert.equal(card.chapterId, chapter.id);
  assert.equal(card.status, "building");
  assert.equal(card.title, "Boss readiness");
  assert.equal(card.completedCount, 0);
  assert.equal(card.totalCount, 3);
  assert.deepEqual(card.checks.map((check) => check.id), ["lessons", "boss", "unlock"]);
  assert.ok(card.headline.includes("micro-lesson"));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project/i);

  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, 1000);
  }
  card = bossReadinessCard(progress, chapter.id);
  assert.equal(card.status, "ready");
  assert.equal(card.checks.find((check) => check.id === "lessons").done, true);
  assert.ok(card.nextAction.includes("Boss"));

  completeBossQuiz(progress, chapter.id, 7, 8, 1000);
  card = bossReadinessCard(progress, chapter.id);
  assert.equal(card.status, "cleared");
  assert.equal(card.completedCount, 3);
  assert.equal(card.checks.find((check) => check.id === "unlock").done, true);
  assert.equal(bossReadinessCard(progress, "missing-chapter"), null);
}

function testChapterSummaryCards() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);
  const wrongQuestion = flattenQuestions().find((question) => question.chapterId === chapter.id && question.type === "single");

  answerQuestion(progress, wrongQuestion, 99, 1000);
  completeLesson(progress, chapterLessons[0].id, 1000);
  const summaries = chapterSummaryCards(progress);
  const first = summaries[0];

  assert.equal(summaries.length, course.chapters.length);
  assert.equal(first.chapterId, chapter.id);
  assert.ok(first.ability.includes("agentic workflow") || first.ability.length > 20);
  assert.ok(first.interviewPitch.includes("我能說明"));
  assert.ok(first.commonMistake.includes("1"));
  assert.ok(first.nextAction.includes("Boss Quiz"));

  completeBossQuiz(progress, chapter.id, 7, 8, 1000);
  assert.ok(chapterSummaryCards(progress)[0].nextAction.includes("面試情境題"));
}

function testAbilityProofCards() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);

  let cards = abilityProofCards(progress);
  assert.equal(cards.length, course.chapters.length);
  assert.equal(cards[0].status, "new");
  assert.ok(cards[0].abilityStatement.includes("我能"));

  completeLesson(progress, chapterLessons[0].id, 1000);
  cards = abilityProofCards(progress);
  assert.equal(cards[0].status, "practicing");
  assert.ok(cards[0].proof.includes("%"));

  completeLesson(progress, chapterLessons[1].id, 1000);
  completeLesson(progress, chapterLessons[2].id, 1000);
  completeBossQuiz(progress, chapter.id, 8, 8, 1000);
  cards = abilityProofCards(progress);
  assert.equal(cards[0].status, "proven");

  for (const question of interviewQuestionsForChapter(chapter.id)) {
    answerQuestion(progress, question, question.answer ?? question.keywords?.[0] ?? "", 1000);
  }
  cards = abilityProofCards(progress);
  assert.equal(cards[0].status, "interview_ready");
  assert.equal(cards[0].interviewProgress, "3/3 interview drill");
}

function testCareerReadinessSnapshot() {
  const progress = createInitialProgress(1000);
  let snapshot = careerReadinessSnapshot(progress, 1000);
  assert.equal(snapshot.level, "Fresh start");
  assert.equal(snapshot.percent, 0);
  assert.equal(snapshot.provenCount, 0);
  assert.ok(snapshot.nextGap.length > 0);

  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);
  for (const lesson of chapterLessons) {
    completeLesson(progress, lesson.id, 1000);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, 1000);
  snapshot = careerReadinessSnapshot(progress, 1000);
  assert.equal(snapshot.provenCount, 1);
  assert.equal(snapshot.percent, 13);
  assert.ok(["Skill-building track", "Explanation signal track"].includes(snapshot.level));
}

function testSkillProfileCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let profile = skillProfileCard(progress, now);
  assert.equal(profile.title, "Agentic Workflow Skill Profile");
  assert.equal(profile.readiness, "Fresh start");
  assert.deepEqual(profile.metrics.map((metric) => metric.id), ["proof", "interview", "landing"]);
  assert.equal(profile.proofHighlights[0].id, "starter");
  assert.deepEqual(profile.lines.map((line) => line.id), ["skill", "evidence", "next"]);
  assert.ok(profile.summaryLine.includes("agentic workflow"));
  assert.ok(profile.nextProof.title.length > 0);
  assert.doesNotMatch(JSON.stringify(profile), /repo|project implementation|build a project|coding task/i);

  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, now);
  profile = skillProfileCard(progress, now);
  assert.ok(profile.headline.includes("1/8"));
  assert.ok(profile.proofHighlights.some((proof) => proof.status === "proven"));
  assert.ok(profile.roleSignal.includes("AI App Builder") || profile.roleSignal.includes("Agent Workflow Builder"));

  for (const question of interviewQuestionsForChapter(chapter.id)) {
    answerQuestion(progress, question, question.type === "multi" ? question.answer : question.answer ?? question.keywords[0], now);
  }
  profile = skillProfileCard(progress, now);
  assert.ok(profile.metrics.find((metric) => metric.id === "interview").value.startsWith("1/"));
  assert.ok(profile.proofHighlights.some((proof) => proof.status === "interview_ready"));
}

function testJobRoleFitCard() {
  const progress = createInitialProgress(1000);
  let card = jobRoleFitCard(progress);
  assert.equal(card.headline, "Role Fit Map");
  assert.equal(card.tracks.length, 3);
  assert.ok(card.tracks.every((track) => track.readyCount === 0));
  assert.ok(card.tracks.every((track) => track.total === 4));
  assert.ok(card.tracks.every((track) => track.proofLine.includes("low-friction")));
  assert.ok(card.tracks.every((track) => track.skillChips.length === track.total));
  assert.ok(card.tracks.every((track) => track.skillChips.every((chip) => chip.state === "next")));
  assert.ok(card.tracks.every((track) => track.skillChips.every((chip) => chip.detail.length > 0)));
  assert.ok(card.tracks.every((track) => track.recommendedPractice.cta.length > 0));
  assert.equal(card.tracks.find((track) => track.id === "ai-app-builder").recommendedPractice.type, "lesson");
  assert.equal(card.tracks.find((track) => track.id === "agent-reliability-builder").recommendedPractice.type, "lesson");
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|專案實作/i);

  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, 1000);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, 1000);
  card = jobRoleFitCard(progress);
  assert.ok(card.summary.includes("AI App Builder") || card.summary.includes("Agent Workflow Builder"));
  assert.ok(card.tracks.some((track) => track.readyCount === 1));
  assert.ok(card.tracks.some((track) => track.nextAction.includes("Boss-proven")));
  assert.ok(card.tracks.some((track) => track.skillChips.some((chip) => chip.state === "boss-proven")));
  assert.ok(card.tracks.find((track) => track.id === "ai-app-builder").proofLine.includes("Agent 基礎直覺"));
  assert.equal(card.tracks.find((track) => track.id === "ai-app-builder").recommendedPractice.type, "lesson");
  assert.equal(card.tracks.find((track) => track.id === "agent-workflow-builder").recommendedPractice.type, "lesson");
  assert.equal(card.tracks.find((track) => track.id === "agent-workflow-builder").recommendedPractice.chapterId, "tools");
}

function testJobSignalPassport() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let passport = jobSignalPassport(progress, now);
  assert.equal(passport.title, "Job Signal Passport");
  assert.equal(passport.status, "starter passport");
  assert.equal(passport.stamps.length, 3);
  assert.deepEqual(passport.stamps.map((stamp) => stamp.id), ["role", "evidence", "receipt"]);
  assert.ok(passport.stamps.find((stamp) => stamp.id === "role").detail.includes("low-friction"));
  assert.ok(passport.stamps.find((stamp) => stamp.id === "evidence").detail.includes("agentic workflow"));
  assert.ok(passport.stamps.find((stamp) => stamp.id === "receipt").value.includes("pending"));
  assert.doesNotMatch(JSON.stringify(passport), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, now);
  passport = jobSignalPassport(progress, now);
  assert.equal(passport.status, "evidence started");
  assert.ok(passport.summary.includes("Current strongest signal"));
  assert.ok(passport.stamps.find((stamp) => stamp.id === "receipt").value.includes("Proof gained"));
}

function testLandingGapRadar() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let radar = landingGapRadar(progress, now);
  assert.equal(radar.title, "Landing Gap Radar");
  assert.equal(radar.mode, "gap-open");
  assert.equal(radar.activeGate, "Start without setup");
  assert.equal(radar.progress, "0/1");
  assert.deepEqual(radar.steps.map((step) => step.id), ["spot", "move", "save"]);
  assert.ok(radar.microMove.length > 0);
  assert.ok(radar.after.includes("passport"));
  assert.doesNotMatch(JSON.stringify(radar), /repo|project implementation|build a project|coding task/i);

  completeLesson(progress, flattenLessons()[0].id, now);
  radar = landingGapRadar(progress, now);
  assert.equal(radar.percent, 25);
  assert.equal(radar.activeGate, "Boss-proven foundations");
  assert.equal(radar.progress, "0/3");

  for (const chapter of course.chapters.slice(0, 3)) {
    for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
      completeLesson(progress, lesson.id, now);
    }
    completeBossQuiz(progress, chapter.id, 8, 8, now);
  }
  for (const chapter of course.chapters.slice(0, 2)) {
    for (const question of interviewQuestionsForChapter(chapter.id)) {
      const response = question.type === "multi" ? question.answer : question.answer ?? question.keywords[0];
      answerQuestion(progress, question, response, now);
    }
  }
  radar = landingGapRadar(progress, now);
  assert.equal(radar.mode, "ready-loop");
  assert.equal(radar.percent, 100);
  assert.ok(radar.microMove.includes("Rehearse"));
}

function testLandingReadinessChecklist() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let checklist = landingReadinessChecklist(progress, now);

  assert.equal(checklist.headline, "Landing Checklist");
  assert.equal(checklist.percent, 0);
  assert.equal(checklist.completedCount, 0);
  assert.equal(checklist.totalCount, 4);
  assert.equal(checklist.items.length, 4);
  assert.equal(checklist.items[0].title, "Start without setup");
  assert.ok(checklist.nextAction.length > 0);
  assert.doesNotMatch(JSON.stringify(checklist), /repo|project implementation|build a project/i);

  completeLesson(progress, flattenLessons()[0].id, now);
  checklist = landingReadinessChecklist(progress, now);
  assert.equal(checklist.items.find((item) => item.id === "start").done, true);
  assert.equal(checklist.percent, 25);

  for (const chapter of course.chapters.slice(0, 3)) {
    for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
      completeLesson(progress, lesson.id, now);
    }
    completeBossQuiz(progress, chapter.id, 8, 8, now);
  }
  for (const chapter of course.chapters.slice(0, 2)) {
    for (const question of interviewQuestionsForChapter(chapter.id)) {
      answerQuestion(progress, question, question.type === "multi" ? question.answer : question.answer ?? question.keywords[0], now);
    }
  }

  checklist = landingReadinessChecklist(progress, now);
  assert.ok(checklist.completedCount >= 3);
  assert.ok(checklist.percent >= 75);
  assert.equal(checklist.items.find((item) => item.id === "boss-proof").done, true);
  assert.equal(checklist.items.find((item) => item.id === "role-paths").done, true);
  assert.equal(checklist.items.find((item) => item.id === "interview-lines").done, true);
}

function testSevenDayLandingPath() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let path = sevenDayLandingPath(progress, now);
  assert.equal(path.title, "7-Day Landing Path");
  assert.equal(path.days.length, 7);
  assert.equal(path.completedCount, 0);
  assert.equal(path.percent, 0);
  assert.equal(path.days[0].id, "first-answer");
  assert.equal(path.days[0].done, false);
  assert.equal(path.days[6].id, "landing-line");
  assert.ok(path.activeAction.includes("single-choice"));
  assert.deepEqual(path.days.map((day) => day.day), [1, 2, 3, 4, 5, 6, 7]);
  assert.doesNotMatch(JSON.stringify(path), /repo|project implementation|build a project|coding task/i);

  const question = flattenQuestions().find((item) => item.type === "single");
  answerQuestion(progress, question, question.answer, now);
  path = sevenDayLandingPath(progress, now);
  assert.equal(path.days.find((day) => day.id === "first-answer").done, true);
  assert.equal(path.completedCount, 2);
  assert.equal(path.days.find((day) => day.id === "review-loop").done, true);

  completeLesson(progress, flattenLessons()[0].id, now);
  path = sevenDayLandingPath(progress, now);
  assert.equal(path.days.find((day) => day.id === "first-lesson").done, true);

  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, now);
  path = sevenDayLandingPath(progress, now);
  assert.equal(path.days.find((day) => day.id === "boss-proof").done, true);
  assert.equal(path.days.find((day) => day.id === "role-evidence").done, true);

  for (const interviewQuestion of interviewQuestionsForChapter(chapter.id)) {
    const response =
      interviewQuestion.type === "multi"
        ? interviewQuestion.answer
        : interviewQuestion.answer ?? interviewQuestion.keywords[0];
    answerQuestion(progress, interviewQuestion, response, now);
  }
  path = sevenDayLandingPath(progress, now);
  assert.equal(path.days.find((day) => day.id === "interview-wording").done, true);
  assert.ok(path.completedCount >= 6);
}

function testJobEvidenceBrief() {
  const progress = createInitialProgress(1000);
  let brief = jobEvidenceBrief(progress, 1000);
  assert.equal(brief.readyCount, 0);
  assert.equal(brief.total, course.chapters.length);
  assert.ok(brief.interviewLine.includes("agentic workflow"));
  assert.equal(brief.scriptParts.length, 3);
  assert.deepEqual(brief.storySeeds.map((seed) => seed.id), ["situation", "judgment", "signal"]);
  assert.equal(brief.storySeeds.length, 3);
  assert.ok(brief.storySeeds.every((seed) => seed.text.length >= 30));
  assert.doesNotMatch(JSON.stringify(brief.storySeeds), /repo|project implementation|build a project/i);
  assert.ok(brief.scriptParts[0].includes("問題"));
  assert.ok(brief.scriptParts[1].includes("角色"));
  assert.ok(brief.scriptParts[2].includes("風險"));
  assert.ok(brief.nextGap.length > 0);

  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);
  for (const lesson of chapterLessons) {
    completeLesson(progress, lesson.id, 1000);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, 1000);
  brief = jobEvidenceBrief(progress, 1000);
  assert.equal(brief.strongestStatus, "proven");
  assert.equal(brief.readyCount, 1);
  assert.ok(brief.proof.includes("Boss"));

  for (const question of interviewQuestionsForChapter(chapter.id)) {
    answerQuestion(progress, question, question.type === "multi" ? question.answer : question.answer ?? question.keywords[0], 1000);
  }
  brief = jobEvidenceBrief(progress, 1000);
  assert.equal(brief.strongestStatus, "interview_ready");
  assert.ok(brief.headline.includes("interview-ready"));
  assert.ok(brief.storySeeds.find((seed) => seed.id === "signal").text.includes("interview answer"));
}

function testOneLineCoachCard() {
  const now = 1000;
  const progress = createInitialProgress(now);
  let card = oneLineCoachCard(progress, now);
  assert.equal(card.title, "One-Line Coach");
  assert.equal(card.lines.length, 3);
  assert.deepEqual(card.lines.map((line) => line.id), ["skill", "judgment", "next"]);
  assert.ok(card.headline.includes(card.lines[0].text.match(/explain (.*?) as/)?.[1] ?? "Agent"));
  assert.ok(card.cue.includes("one sentence"));
  assert.ok(card.lines[0].text.includes("agentic workflow"));
  assert.ok(card.lines[1].text.includes("agent"));
  assert.ok(card.lines[2].text.includes(card.nextAction));
  assert.doesNotMatch(JSON.stringify(card), /repo|project implementation|build a project|coding task/i);

  const chapter = course.chapters[0];
  for (const lesson of flattenLessons().filter((item) => item.chapterId === chapter.id)) {
    completeLesson(progress, lesson.id, now);
  }
  completeBossQuiz(progress, chapter.id, 8, 8, now);
  card = oneLineCoachCard(progress, now);
  assert.equal(card.readinessLabel, "Boss-proven");
  assert.ok(card.lines[0].text.includes("Boss-proven"));

  for (const question of interviewQuestionsForChapter(chapter.id)) {
    const response = question.type === "multi" ? question.answer : question.answer ?? question.keywords[0];
    answerQuestion(progress, question, response, now);
  }
  card = oneLineCoachCard(progress, now);
  assert.equal(card.readinessLabel, "interview-ready");
}

function testExerciseScopeCard() {
  const scope = exerciseScopeCard();
  const single = scope.formats.find((item) => item.label === "單選");
  const multi = scope.formats.find((item) => item.label === "複選");
  const short = scope.formats.find((item) => item.label === "簡答");
  const project = scope.formats.find((item) => item.label === "專案實作");

  assert.equal(single.count, 80);
  assert.equal(multi.count, 32);
  assert.equal(short.count, 32);
  assert.equal(project.count, 0);
  assert.ok(scope.headline.includes("不先寫專案"));
  assert.ok(scope.description.includes("單選"));
  assert.ok(scope.guardrails.some((item) => item.includes("不用建立 repo")));
  assert.ok(scope.guardrails.some((item) => item.includes("簡答")));
  assert.doesNotMatch(scope.guardrails.join(" "), /請寫程式|請建立 repo|需要建立 repo|build a project/i);
}

function testCompletionCards() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const lesson = flattenLessons().find((item) => item.chapterId === chapter.id);

  completeLesson(progress, lesson.id, 1000);
  const lessonCard = completionCard(progress, {
    type: "lesson",
    chapterId: chapter.id,
    title: lesson.title
  });
  assert.equal(lessonCard.type, "lesson");
  assert.equal(lessonCard.headline, lesson.title);
  assert.ok(lessonCard.ability.length > 20);
  assert.ok(lessonCard.roleSignal.includes("AI App Builder"));
  assert.ok(lessonCard.roleSignal.includes("Agent Workflow Builder"));
  assert.ok(lessonCard.nextAction.includes("Boss Quiz"));
  assert.deepEqual(lessonCard.rewards.map((reward) => reward.id), ["xp", "role", "next"]);
  assert.ok(lessonCard.rewards[0].label.includes("Micro XP"));
  assert.ok(lessonCard.rewards[1].detail.includes("AI App Builder"));
  assert.ok(lessonCard.rewards[2].detail.includes("Boss Quiz"));
  assert.doesNotMatch(JSON.stringify(lessonCard.rewards), /repo|project implementation|build a project/i);
  assert.deepEqual(lessonCard.exitTicket.map((item) => item.id), ["saved", "reuse", "next"]);
  assert.ok(lessonCard.exitTicket.find((item) => item.id === "saved").text.includes("micro-lesson"));
  assert.ok(lessonCard.exitTicket.find((item) => item.id === "reuse").text.includes("AI App Builder"));
  assert.ok(lessonCard.exitTicket.find((item) => item.id === "next").text.includes("Boss Quiz"));
  assert.doesNotMatch(JSON.stringify(lessonCard.exitTicket), /repo|project implementation|build a project|coding task/i);

  completeBossQuiz(progress, chapter.id, 7, 8, 1000);
  const bossCard = completionCard(progress, {
    type: "boss",
    chapterId: chapter.id,
    title: `${chapter.title} Boss Quiz`,
    score: 7,
    total: 8,
    passed: true
  });
  assert.equal(bossCard.title, "Boss cleared");
  assert.ok(bossCard.result.includes("7/8"));
  assert.ok(bossCard.roleSignal.includes("AI App Builder"));
  assert.equal(bossCard.rewards[0].label, "Boss proof saved");
  assert.ok(bossCard.nextAction.includes("面試情境題"));

  const reviewCard = completionCard(progress, { type: "review", title: "錯題複習" });
  assert.equal(reviewCard.title, "Review session complete");
  assert.ok(reviewCard.result.includes("複習"));
  assert.ok(reviewCard.roleSignal.includes("every role path"));
  assert.equal(reviewCard.rewards[0].label, "Recall strengthened");
  assert.ok(reviewCard.exitTicket.find((item) => item.id === "saved").text.includes("recall"));
  assert.doesNotMatch(JSON.stringify(reviewCard.exitTicket), /repo|project implementation|build a project|coding task/i);
}

function testNextPracticeRecommendation() {
  const now = 1000;
  const progress = createInitialProgress(now);
  const [wrongQuestion] = flattenQuestions().filter((question) => question.type === "single");

  answerQuestion(progress, wrongQuestion, 99, now);
  assert.equal(nextPracticeRecommendation(progress, now).type, "review");
  progress.reviewQueue = [];

  let recommendation = nextPracticeRecommendation(progress, now);
  assert.equal(recommendation.type, "lesson");
  assert.equal(recommendation.lessonIndex, progress.currentLessonIndex);

  const firstChapter = course.chapters[0];
  const firstChapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === firstChapter.id);
  for (const lesson of firstChapterLessons) {
    completeLesson(progress, lesson.id, now);
  }
  recommendation = nextPracticeRecommendation(progress, now);
  assert.equal(recommendation.type, "boss");
  assert.equal(recommendation.chapterId, firstChapter.id);

  completeBossQuiz(progress, firstChapter.id, 7, 8, now);
  recommendation = nextPracticeRecommendation(progress, now);
  assert.equal(recommendation.type, "interview");
  assert.equal(recommendation.chapterId, firstChapter.id);

  for (const question of flattenInterviewQuestions().filter((item) => item.chapterId === firstChapter.id)) {
    answerQuestion(progress, question, question.type === "multi" ? question.answer : question.answer ?? question.keywords[0], now);
  }
  recommendation = nextPracticeRecommendation(progress, now);
  assert.equal(recommendation.type, "lesson");
  assert.notEqual(recommendation.chapterId, firstChapter.id);
}

function testPitchPracticeCards() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const card = pitchPracticeCard(progress, chapter.id);

  assert.equal(card.chapterId, chapter.id);
  assert.equal(card.outline.length, 3);
  assert.equal(card.checks.length, 3);
  assert.ok(card.sampleAnswer.length > 20);

  const weak = gradePitchPractice(card, "agent");
  assert.equal(weak.ready, false);
  assert.ok(weak.doneCount < weak.total);

  const strong = gradePitchPractice(card, "我會說明 agent workflow 的角色，並補充實務風險與取捨，讓面試官知道我能把流程邊界講清楚。");
  assert.equal(strong.ready, true);
  assert.equal(strong.doneCount, strong.total);
}

function testJobReadinessMap() {
  const progress = createInitialProgress(1000);
  const chapter = course.chapters[0];
  const chapterLessons = flattenLessons().filter((lesson) => lesson.chapterId === chapter.id);

  let readiness = jobReadinessMap(progress);
  assert.equal(readiness.length, jobReadinessSkills.length);
  assert.equal(readiness[0].status, "new");
  assert.equal(readiness[0].lessonPercent, 0);

  completeLesson(progress, chapterLessons[0].id, 1000);
  readiness = jobReadinessMap(progress);
  assert.equal(readiness[0].status, "learning");
  assert.equal(readiness[0].lessonPercent, 33);

  completeBossQuiz(progress, chapter.id, 7, 8, 1000);
  readiness = jobReadinessMap(progress);
  assert.equal(readiness[0].status, "job_ready");
  assert.equal(readiness[0].bossPassed, true);
  assert.equal(readiness[0].bossScore, "7/8");
}

function testInterviewQuestionFlow() {
  const progress = createInitialProgress(1000);
  const questions = interviewQuestionsForChapter("tools");
  const first = questions[0];
  answerQuestion(progress, first, 99, 1000);
  assert.ok(progress.answered[`interview:tools:${first.id}`]);
  assert.equal(buildReviewSessionQuestions(progress, 1000, 3)[0].lessonId, "interview:tools");

  const second = questions[1];
  answerQuestion(progress, second, second.answer, 1000);
  assert.equal(progress.answered[`interview:tools:${second.id}`].correctCount, 1);
}

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
