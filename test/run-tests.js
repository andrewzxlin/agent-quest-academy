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
  exerciseScopeCard,
  getDueReviewQuestions,
  gradePitchPractice,
  gradeQuestion,
  isAnswerReady,
  jobReadinessMap,
  jobEvidenceBrief,
  jobScenarioCard,
  lessonSkillCard,
  learningPuzzleBoard,
  masteryForLesson,
  mistakeFocusCard,
  mistakeRescuePrompt,
  mistakeNotebook,
  nextPracticeRecommendation,
  onboardingState,
  pitchPracticeCard,
  questionCoachHint,
  reviewStats,
  selectLearnerProfile,
  shortAnswerSupport
} from "../src/engine.js";

const tests = [
  ["course has MVP scope", testCourseScope],
  ["onboarding profile starts empty and can be selected", testOnboardingProfile],
  ["course covers job-ready agentic workflow map", testCourseCoverage],
  ["beginner glossary covers every chapter with plain-language terms", testBeginnerGlossaryCoverage],
  ["chapter visuals cover every chapter", testChapterVisuals],
  ["job readiness skills cover every chapter", testJobReadinessCoverage],
  ["job scenario cards map chapters to workplace signals", testJobScenarioCards],
  ["lesson micro skill cards explain low-friction job signals", testLessonSkillCards],
  ["learning puzzle board tracks job-readiness pieces", testLearningPuzzleBoard],
  ["interview scenarios cover every chapter with low-friction questions", testInterviewScenarioCoverage],
  ["course stays low-friction", testLowFrictionQuestionTypes],
  ["question coach hints reduce blank-page friction", testQuestionCoachHints],
  ["short answer support provides concept chips", testShortAnswerSupport],
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
  ["boss quiz uses low-friction chapter questions", testBossQuizQuestions],
  ["boss quiz records pass and fail results", testBossQuizCompletion],
  ["daily missions track answers lessons and boss passes", testDailyMissions],
  ["daily quest snapshot shows nearest small progress", testDailyQuestSnapshot],
  ["daily momentum derives real active-day streaks", testDailyMomentum],
  ["achievements unlock from real progress", testAchievements],
  ["mistake notebook lists recent wrong answers with due state", testMistakeNotebook],
  ["mistake focus card picks the highest-priority wrong answer", testMistakeFocusCard],
  ["chapter map summarizes lesson and boss progress", testChapterMap],
  ["chapter gate map stages lessons boss interview and pitch unlocks", testChapterGateMap],
  ["chapter summary cards turn progress into interview-ready guidance", testChapterSummaryCards],
  ["ability proof cards derive evidence from real progress", testAbilityProofCards],
  ["career readiness snapshot summarizes proof progress", testCareerReadinessSnapshot],
  ["job evidence brief turns progress into an interview line", testJobEvidenceBrief],
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
}

function testDailyQuestSnapshot() {
  const now = Date.UTC(2026, 4, 4);
  const progress = createInitialProgress(now);
  let snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 0);
  assert.equal(snapshot.totalCount, 3);
  assert.equal(snapshot.percent, 0);
  assert.ok(snapshot.nextStep.includes("還差"));

  const questions = flattenQuestions().filter((item) => item.type === "single");
  for (const question of questions.slice(0, 5)) {
    answerQuestion(progress, question, question.answer, now);
  }
  snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 1);
  assert.ok(snapshot.percent > 0);

  completeLesson(progress, flattenLessons()[0].id, now);
  completeBossQuiz(progress, "agent-basics", 7, 8, now);
  snapshot = dailyQuestSnapshot(progress, now);
  assert.equal(snapshot.completedCount, 3);
  assert.equal(snapshot.percent, 100);
  assert.ok(snapshot.nextStep.includes("已完成"));
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

function testJobEvidenceBrief() {
  const progress = createInitialProgress(1000);
  let brief = jobEvidenceBrief(progress, 1000);
  assert.equal(brief.readyCount, 0);
  assert.equal(brief.total, course.chapters.length);
  assert.ok(brief.interviewLine.includes("agentic workflow"));
  assert.equal(brief.scriptParts.length, 3);
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
  assert.ok(lessonCard.nextAction.includes("Boss Quiz"));

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
  assert.ok(bossCard.nextAction.includes("面試情境題"));

  const reviewCard = completionCard(progress, { type: "review", title: "錯題複習" });
  assert.equal(reviewCard.title, "Review session complete");
  assert.ok(reviewCard.result.includes("複習"));
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
