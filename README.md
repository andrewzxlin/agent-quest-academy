# Agent Quest Academy

## Job Readiness Map

- Maps each chapter to one concrete AI / Agent engineering skill signal.
- Uses lesson completion and Boss results to derive status: new, learning, or job-ready.
- Keeps the current learning flow low-friction: choice questions, multi-select, short answers, mistake review, and spaced review before project implementation tasks.

## Interview Scenarios

- Adds one interview-style scenario per chapter, focused on architecture judgment instead of project implementation.
- Each scenario uses only single choice, multi-select, and short answer questions.
- Wrong interview answers enter the same review queue and mistake notebook as normal lesson questions.

## Choice-Level Feedback

- Single choice and multi-select questions explain why each option is a core answer or a distractor.
- Feedback highlights both the selected answer and the expected answer after checking.
- This turns mistakes into architecture judgment practice instead of simple right/wrong memorization.

## Short Answer Coaching

- Short answers show matched concepts, missing concepts, and a compact sample answer.
- Keyword grading stays lenient so beginners can answer in plain language.
- The goal is to build interview explanation muscle without forcing project implementation tasks too early.

## Chapter Summary Cards

- Each chapter gets a compact summary card with the learned skill, interview pitch, current mistake signal, and next action.
- Cards are derived from real progress, Boss results, and answered mistakes.
- The cards help learners translate small daily drills into job-facing explanations.

## Completion Cards

- Finishing a lesson, Boss Quiz, interview drill, or review session now shows an immediate completion card.
- Cards summarize the result, the relevant job-facing skill, and the next recommended action.
- This keeps the loop game-like while still pointing back to interview-ready explanations.

## Next Practice Recommendation

- The home screen recommends one next action based on due reviews, lesson progress, Boss status, and interview drills.
- Due review is prioritized first, then unfinished lessons, Boss checks, and interview practice.
- The recommendation removes decision friction so beginners can keep moving without planning the curriculum themselves.

## 60-Second Pitch Practice

- Chapter summary cards can open a lightweight interview pitch drill.
- Learners write a short answer using a three-part outline: problem, workflow role, and risk or tradeoff.
- The drill checks for enough detail, agent/workflow language, and risk-aware reasoning without requiring audio recording.

## Stage Gates

- Chapters now follow a clear unlock rhythm: lesson, Boss, interview drill, pitch practice, then the next chapter.
- Future chapters and advanced drills are still visible, but marked as locked until the prerequisite is done.
- This keeps the curriculum readable for beginners while preserving a game-like progression path.

## Onboarding Profile

- First-time learners choose one starting point: complete beginner, AI user new to agents, or interview prep.
- The home screen shows a coach note matched to that profile.
- The profile is stored in local progress and can be reset without affecting course progress.

## Focused Home Screen

- Secondary details such as maps, achievements, mistake notebook, readiness map, and summary cards are grouped into a collapsible learning library.
- The first view keeps attention on onboarding, today's recommendation, and the active low-friction drill.
- The full progression remains available without overwhelming complete beginners.

## Beginner Glossary Cards

- Every chapter starts with three plain-language terms before the quiz.
- The cards explain what the term means and why it matters in an agentic workflow.
- This reduces jargon friction while keeping the learning loop focused on choice questions, multi-select, and short answers.

## Question Coach Hints

- Every question now shows a small hint before answering.
- Single-choice and multi-select hints teach how to spot workflow-relevant options.
- Short-answer hints include a sentence starter so beginners can begin without staring at a blank box.

## Workplace Scenario Cards

- Every chapter has a work-facing scenario before the quiz.
- Each card explains the likely workplace task, the common beginner trap, and the interview signal.
- This connects low-friction practice to job-ready agent workflow judgment without adding project implementation tasks.

## Profile Quest Routes

- Each onboarding profile now gets three small next-step goals.
- Complete beginners, AI users, and interview-focused learners see different routes after choosing a profile.
- The routes keep the first steps concrete: glossary, micro-lessons, review, Boss, interview drill, and pitch practice.

## Ability Proof Cards

- Progress is translated into "I can judge..." ability statements.
- Each chapter moves from new, to practicing, to Boss-proven, to interview-ready based on real completion data.
- The cards help learners see job-facing evidence without adding project implementation tasks.

## Job Readiness Snapshot

- The home screen summarizes proven chapters, interview-ready chapters, and the next gap.
- The snapshot derives its level from real ability proof progress.
- It keeps the learner oriented toward job-facing readiness without adding planning overhead.

## Mistake Rescue Prompts

- Wrong answers now show a short rescue prompt before the detailed explanation.
- The prompt tells the learner what to look for next time, instead of only marking the answer wrong.
- This keeps mistake replay supportive and low-friction.

一個用 Duolingo 式節奏學 Agentic Workflow 的互動學習小遊戲。

目標不是先逼初學者寫專案，而是先用選擇題、複選題、少量簡答、錯題重現與定期複習，把「Agent 到底在做什麼」變成可以每天 5 分鐘累積的直覺。

## 目前內容

- 8 個章節：Agent 基礎、Tool Calling、RAG、Memory、Guardrails、Evals、Observability、LangChain / LangGraph
- 24 個 micro-lessons
- 120 題低阻力題目：單選、複選、少量簡答
- 答錯立即進入 review queue
- 答對後排入間隔複習
- 可單獨進入「錯題複習」模式，只刷到期題
- 每個章節都有 Boss Quiz，用選擇題檢查整章是否真的理解
- 每日任務追蹤答題、完成課程與 Boss 通關
- 成就徽章鼓勵第一課、錯題複習、章節通關與 XP 累積
- 錯題本列出最近答錯題、來源課程、答錯次數與到期狀態
- 章節通關地圖顯示每個 Agentic Workflow 拼圖的課程進度與 Boss 狀態
- 章節視覺卡牌提供每章符號、色彩、概念文案與 Image 2.0 prompt seed
- 即時回饋、XP、streak、熟練度
- 使用 `localStorage` 保存進度
- 暫不包含專案實作題，先專注建立判斷力與概念直覺

## 為什麼這對 Agentic Workflow 重要

很多人一開始卡住，不是因為不會背 LangChain 或 LangGraph API，而是還沒分清楚：

1. agent、workflow、tool、RAG、memory 各自解決什麼問題
2. 什麼時候該讓模型自由判斷，什麼時候該用固定流程約束
3. guardrails、evals、observability 為什麼會變成真實產品的核心
4. LangChain 是元件組裝層，LangGraph 是 stateful workflow 執行層
5. 真實 agent 系統如何在速度、成本、安全、可恢復性與可測試性之間取捨

這個專案把學習拼圖切小，讓初學者先建立可重複辨識的判斷力，再進入程式碼與專案實作。

## 學習循環

```text
選一個短課程
  -> 先答低阻力題目
  -> 立即得到解析
  -> 錯題進入複習隊列
  -> 答對題目排入間隔複習
  -> 用熟練度推進下一課
```

## 參考脈絡

課程內容參考了目前主流 agent 系統的分工方式：

- LangChain agents：models、tools、agent loop 與 graph-based runtime
- LangGraph durable execution：用 state persistence 支援中斷後恢復、human-in-the-loop 與長任務
- OpenAI Agents SDK guardrails：input、output、tool guardrails 與 tripwire
- OpenAI Agents SDK tracing：trace/span 追蹤 LLM generation、tool calls、guardrails、handoffs
- Spacing and retrieval practice：用間隔複習與主動回想降低遺忘

## 使用方式

需要 Node.js 20+。

```bash
npm test
npm run dev
```

然後打開：

```text
http://127.0.0.1:4174/
```

因為前端使用 ES modules，建議用 `npm run dev` 啟動本機伺服器，不建議直接用 `file://` 開 `index.html`。

## 測試

```bash
npm test
```

測試覆蓋：

- 課程總數與題目總數
- 是否涵蓋 Tool、RAG、Memory、Guardrails、Evals、Observability、LangChain、LangGraph
- 題型是否仍維持單選、複選、少量簡答
- 單選、複選、簡答評分
- 答錯後加入錯題複習
- 答對後排入間隔複習
- 錯題複習模式只取到期題
- 複習統計能區分到期題、已排程題與最近答錯題
- Boss Quiz 只使用低阻力題型，並記錄通關或待重戰
- 每日任務能追蹤答題、課程完成與 Boss 通關
- 成就徽章會根據真實進度解鎖
- 錯題本會從真實答題紀錄整理最近錯題與到期狀態
- 章節通關地圖會整理每章課程完成度與 Boss 通關狀態
- 每個章節都有視覺卡牌資料與 Image 2.0 prompt seed
- 課程完成後推進進度
- session 優先插入到期複習題
- session 新題保留穩定題目 key

## 接下來可以補的拼圖

- 用 Image 2.0 把 `docs/image-prompts.md` 的 prompt seeds 轉成正式章節卡牌圖
- 加入更精細的 spaced repetition 演算法
- 加入錯題本的篩選、搜尋與章節分類
- 加入更細緻的成就徽章視覺與章節地圖互動
- 等基礎直覺穩定後，再加入少量 code reading 與 LangGraph 實作任務
