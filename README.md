# Agent Quest Academy

一個用 Duolingo 式節奏學 Agentic Workflow 的互動學習小遊戲。

目標不是先逼初學者寫專案，而是先用選擇題、複選題、少量簡答、錯題重現與定期複習，把「Agent 到底在做什麼」變成可以每天 5 分鐘累積的直覺。

## 目前內容

- 8 個章節：Agent 基礎、Tool Calling、RAG、Memory、Guardrails、Evals、Observability、LangChain / LangGraph
- 24 個 micro-lessons
- 120 題低阻力題目：單選、複選、少量簡答
- 答錯立即進入 review queue
- 答對後排入間隔複習
- 可單獨進入「錯題複習」模式，只刷到期題
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
- 課程完成後推進進度
- session 優先插入到期複習題
- session 新題保留穩定題目 key

## 接下來可以補的拼圖

- 用 Image 2.0 產生角色、流程圖、卡牌、概念圖，讓每個知識點更像遊戲關卡
- 加入更精細的 spaced repetition 演算法
- 加入每日任務與錯題本
- 加入章節 Boss Quiz 與成就徽章
- 等基礎直覺穩定後，再加入少量 code reading 與 LangGraph 實作任務
