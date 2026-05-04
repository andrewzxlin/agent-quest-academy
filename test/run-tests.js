import assert from "node:assert/strict";
import { course, flattenLessons, flattenQuestions } from "../src/course.js";
import {
  answerQuestion,
  buildReviewSessionQuestions,
  buildSessionQuestions,
  completeLesson,
  createInitialProgress,
  getDueReviewQuestions,
  gradeQuestion,
  masteryForLesson,
  reviewStats
} from "../src/engine.js";

const tests = [
  ["course has MVP scope", testCourseScope],
  ["course covers job-ready agentic workflow map", testCourseCoverage],
  ["course stays low-friction", testLowFrictionQuestionTypes],
  ["single choice grading works", testSingleChoice],
  ["multi choice grading works", testMultiChoice],
  ["short answer keyword grading works", testShortAnswer],
  ["wrong answer is added to due review", testWrongAnswerReview],
  ["correct answer schedules future review", testCorrectAnswerReview],
  ["lesson completion advances progress", testLessonCompletion],
  ["session includes due review first", testSessionReview],
  ["fresh session questions keep stable keys", testFreshSessionQuestionKeys],
  ["review mode returns only due questions", testReviewModeOnlyDue],
  ["review stats separate due and scheduled", testReviewStats]
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

function testCourseCoverage() {
  const text = JSON.stringify(course);
  for (const topic of ["Tool", "RAG", "Memory", "Guardrails", "Evals", "Observability", "LangChain", "LangGraph"]) {
    assert.ok(text.includes(topic), `missing topic: ${topic}`);
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

function testShortAnswer() {
  const question = flattenQuestions().find((item) => item.type === "short");
  assert.equal(gradeQuestion(question, question.keywords[0]).correct, true);
  assert.equal(gradeQuestion(question, "完全無關").correct, false);
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
  const progress = createInitialProgress();
  const lesson = flattenLessons()[0];
  completeLesson(progress, lesson.id);
  assert.equal(progress.completedLessons.includes(lesson.id), true);
  assert.equal(progress.currentLessonIndex, 1);
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

function countBy(items, keyFn) {
  return items.reduce((counts, item) => {
    const key = keyFn(item);
    counts[key] = (counts[key] ?? 0) + 1;
    return counts;
  }, {});
}
