import assert from "node:assert/strict";
import { course, flattenLessons, flattenQuestions } from "../src/course.js";
import {
  answerQuestion,
  buildSessionQuestions,
  completeLesson,
  createInitialProgress,
  getDueReviewQuestions,
  gradeQuestion,
  masteryForLesson
} from "../src/engine.js";

const tests = [
  ["course has MVP scope", testCourseScope],
  ["single choice grading works", testSingleChoice],
  ["multi choice grading works", testMultiChoice],
  ["short answer keyword grading works", testShortAnswer],
  ["wrong answer is added to due review", testWrongAnswerReview],
  ["correct answer schedules future review", testCorrectAnswerReview],
  ["lesson completion advances progress", testLessonCompletion],
  ["session includes due review first", testSessionReview],
  ["fresh session questions keep stable keys", testFreshSessionQuestionKeys]
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
  assert.equal(course.chapters.length, 3);
  assert.equal(flattenLessons().length, 9);
  assert.equal(flattenQuestions().length, 45);
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
