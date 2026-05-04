export const course = {
  title: "Agent Quest：AI 工作流修煉場",
  subtitle: "從 0 開始，用選擇題、少量簡答與錯題複習學會 Agentic Workflow。",
  chapters: [
    {
      id: "agent-basics",
      title: "Agent 入門村",
      theme: "從 chatbot 到 agentic workflow",
      lessons: [
        {
          id: "chatbot-vs-agent",
          title: "Chatbot、Workflow、Agent 差在哪？",
          concept: "Chatbot 主要回應訊息；workflow 按固定步驟做事；agentic workflow 會結合模型、工具、狀態、檢查與人工審核。",
          analogy: "把 agent 想成任務小隊長：它不是只會聊天，而是知道何時查資料、何時叫工具、何時停下來問人。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "哪個描述最接近 agentic workflow？",
              choices: [
                "只把 prompt 寫得更長",
                "把模型、工具、狀態、檢查與人工審核串成流程",
                "只做一個聊天視窗",
                "完全不需要人類介入"
              ],
              answer: 1,
              explanation: "Agentic workflow 的重點是多步驟流程，不只是單次聊天。"
            },
            {
              id: "q2",
              type: "single",
              prompt: "哪個任務最需要 agentic workflow？",
              choices: ["翻譯一句短句", "把文字改成大寫", "處理退款：查訂單、判斷政策、產生草稿、人工審核", "計算 2+2"],
              answer: 2,
              explanation: "多步驟、涉及工具和風險的任務，比較適合 agentic workflow。"
            },
            {
              id: "q3",
              type: "multi",
              prompt: "agentic workflow 常見零件有哪些？",
              choices: ["Model", "Tool", "State", "Guardrail", "完全不記錄任何步驟"],
              answer: [0, 1, 2, 3],
              explanation: "Model 負責理解與生成，Tool 負責行動，State 負責保存進度，Guardrail 負責安全邊界。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "用一句話說明 agent 和 chatbot 的差別。",
              keywords: ["工具", "步驟", "狀態", "流程", "行動"],
              minMatches: 1,
              explanation: "好的答案會提到 agent 不只聊天，還能透過工具和流程完成任務。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "human-in-the-loop 代表什麼？",
              choices: ["人類完全不能碰流程", "高風險步驟交給人審核或批准", "把所有工作都交給模型", "只讓人看最後分數"],
              answer: 1,
              explanation: "Human-in-the-loop 是在關鍵節點加入人工判斷，降低風險。"
            }
          ]
        },
        {
          id: "state-and-steps",
          title: "為什麼流程需要 State？",
          concept: "State 是 workflow 的任務背包：保存目前已知資訊、每一步結果、下一步要做什麼。",
          analogy: "沒有 state 的 agent 像失憶的冒險者，每進一個房間都忘記剛剛拿過鑰匙。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "State 在 workflow 裡主要負責什麼？",
              choices: ["保存流程中的資料與進度", "讓畫面更漂亮", "取代所有工具", "隨機產生答案"],
              answer: 0,
              explanation: "State 保存已知資訊與步驟結果，後續節點才能接著用。"
            },
            {
              id: "q2",
              type: "multi",
              prompt: "哪些適合放進 state？",
              choices: ["使用者問題", "查到的訂單資料", "guardrail 結果", "下一步 action", "未經處理的密碼明文"],
              answer: [0, 1, 2, 3],
              explanation: "State 應保存任務需要的資料，但敏感資訊要避免或先處理。"
            },
            {
              id: "q3",
              type: "single",
              prompt: "沒有 state 最容易造成什麼問題？",
              choices: ["流程忘記前面查到的結果", "CSS 變慢", "圖片太大", "鍵盤不能輸入"],
              answer: 0,
              explanation: "多步驟任務如果不保存狀態，後面就無法利用前面的結果。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "用一句話說明 state 像什麼。",
              keywords: ["背包", "記錄", "進度", "資料", "上下文"],
              minMatches: 1,
              explanation: "State 可以理解成保存任務資料與進度的背包或紀錄本。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "哪個最像 workflow step？",
              choices: ["查訂單", "把整個產品一次做完", "刪除所有紀錄", "不管輸入直接回答"],
              answer: 0,
              explanation: "Step 是流程中的一個明確動作，例如查訂單、分類、審核。"
            }
          ]
        },
        {
          id: "human-approval",
          title: "什麼時候要停下來問人？",
          concept: "Agent 不該每件事都自動執行。涉及金錢、法律、安全、名譽或不可逆操作時，應該加入人工審核。",
          analogy: "就像遊戲裡按下核彈按鈕前要二次確認，agent 也需要 approval gate。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "哪個情況最需要 human approval？",
              choices: ["改按鈕顏色", "送出退款通知給客戶", "顯示說明文字", "排序本地陣列"],
              answer: 1,
              explanation: "退款通知會影響金錢與客戶關係，應該人工確認。"
            },
            {
              id: "q2",
              type: "multi",
              prompt: "哪些屬於高風險操作？",
              choices: ["付款", "刪除資料", "發送法律威脅信", "查公開 FAQ", "修改生產資料庫"],
              answer: [0, 1, 2, 4],
              explanation: "金錢、資料、法律與生產環境變更都需要更嚴格控制。"
            },
            {
              id: "q3",
              type: "single",
              prompt: "approval gate 的作用是什麼？",
              choices: ["讓流程永遠停止", "在高風險步驟前暫停並等待批准", "自動跳過所有測試", "增加動畫效果"],
              answer: 1,
              explanation: "Approval gate 讓人能在重要步驟前檢查與批准。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "列出一種 agent 應該停下來問人的情況。",
              keywords: ["金錢", "付款", "刪除", "法律", "安全", "客戶", "資料"],
              minMatches: 1,
              explanation: "涉及金錢、資料刪除、安全、法律或客戶外部溝通時，都適合停下來問人。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "哪個流程比較安全？",
              choices: ["AI 直接寄出所有退款信", "AI 產生草稿，人類確認後送出", "AI 自動刪資料", "AI 不記錄任何步驟"],
              answer: 1,
              explanation: "AI 做草稿、人做最後確認，是更安全的協作方式。"
            }
          ]
        }
      ]
    },
    {
      id: "tools",
      title: "Tool Calling 工坊",
      theme: "讓 Agent 從會說變成會做",
      lessons: [
        {
          id: "what-is-tool",
          title: "Tool 是 Agent 的手",
          concept: "Tool 是 agent 可以呼叫的外部能力，例如查訂單、搜尋文件、寄信、查資料庫。",
          analogy: "模型是大腦，tool 是工具箱。沒有工具，agent 只能說；有工具，agent 才能做。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "哪個最像 tool calling？",
              choices: ["模型猜測訂單狀態", "模型呼叫 search_order(orderId) 查訂單", "模型改變字體", "模型重複使用者問題"],
              answer: 1,
              explanation: "Tool calling 是模型選擇並呼叫外部工具取得結果。"
            },
            {
              id: "q2",
              type: "multi",
              prompt: "哪些可以設計成 tool？",
              choices: ["查訂單", "搜尋文件", "寄 email", "查天氣 API", "幻想資料"],
              answer: [0, 1, 2, 3],
              explanation: "Tool 應該連到可執行或可查詢的能力，不是幻想資料。"
            },
            {
              id: "q3",
              type: "single",
              prompt: "tool description 為什麼重要？",
              choices: ["讓模型知道何時使用這個 tool", "讓圖片更清楚", "取代資料庫", "讓程式不用測試"],
              answer: 0,
              explanation: "好的 tool description 幫助模型在正確情境選對工具。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "用一句話說明 tool calling 是什麼。",
              keywords: ["工具", "呼叫", "外部", "API", "查詢", "執行"],
              minMatches: 1,
              explanation: "Tool calling 是讓模型呼叫外部工具查資料或執行動作。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "使用者問「我的包裹在哪？」最適合呼叫哪個 tool？",
              choices: ["refund_order", "track_shipment", "delete_user", "generate_poem"],
              answer: 1,
              explanation: "查包裹狀態應該呼叫物流追蹤工具。"
            }
          ]
        },
        {
          id: "tool-schema",
          title: "Tool Schema：把輸入說清楚",
          concept: "Tool schema 定義工具需要哪些輸入，避免模型傳錯格式。",
          analogy: "Tool schema 像任務表單：要查訂單，就要填 orderId，而不是隨便塞一段文字。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "查訂單 tool 最可能需要哪個欄位？",
              choices: ["orderId", "favoriteColor", "bossName", "randomText"],
              answer: 0,
              explanation: "查訂單通常需要訂單 ID。"
            },
            {
              id: "q2",
              type: "single",
              prompt: "schema 的主要用途是什麼？",
              choices: ["限制與說明 tool 的輸入格式", "讓模型變便宜", "讓 UI 變大", "讓錯誤消失"],
              answer: 0,
              explanation: "Schema 讓 tool input 可檢查、可預期。"
            },
            {
              id: "q3",
              type: "multi",
              prompt: "好的 tool schema 應該包含什麼？",
              choices: ["必要欄位", "欄位型別", "欄位描述", "完全模糊的 any input"],
              answer: [0, 1, 2],
              explanation: "必要欄位、型別、描述都有助於模型正確呼叫工具。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "為什麼 tool schema 能降低錯誤？",
              keywords: ["格式", "欄位", "檢查", "型別", "輸入"],
              minMatches: 1,
              explanation: "Schema 讓輸入格式明確，系統可以檢查欄位與型別。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "哪個 schema 比較好？",
              choices: ["input: any", "orderId: string, required", "data: whatever", "text: maybe"],
              answer: 1,
              explanation: "明確欄位和型別比模糊輸入更可靠。"
            }
          ]
        },
        {
          id: "tool-errors",
          title: "Tool 失敗時怎麼辦？",
          concept: "Tool 可能 timeout、回傳錯誤、找不到資料。Agent 需要處理錯誤，而不是硬掰答案。",
          analogy: "工具壞掉時，不應該假裝成功；應該重試、換路線，或請人處理。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "tool timeout 時，agent 最不應該做什麼？",
              choices: ["重試一次", "回報暫時失敗", "硬編一個結果", "請人稍後確認"],
              answer: 2,
              explanation: "工具失敗時不能捏造結果。"
            },
            {
              id: "q2",
              type: "multi",
              prompt: "tool error 的合理處理方式有哪些？",
              choices: ["retry", "fallback", "human escalation", "記錄錯誤", "假裝成功"],
              answer: [0, 1, 2, 3],
              explanation: "重試、fallback、人工升級、記錄錯誤都比假裝成功安全。"
            },
            {
              id: "q3",
              type: "single",
              prompt: "為什麼要記錄 tool error？",
              choices: ["方便 debug 和監控", "讓畫面變暗", "避免使用者輸入", "取代測試"],
              answer: 0,
              explanation: "錯誤紀錄能幫助後續 debug、監控與改進。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "列出一種 tool 失敗時的處理方式。",
              keywords: ["重試", "retry", "fallback", "人工", "記錄", "timeout"],
              minMatches: 1,
              explanation: "常見做法包含 retry、fallback、記錄錯誤、人工處理。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "哪個回答最安全？",
              choices: ["我查不到，但我猜你的訂單已寄出", "查詢工具暫時失敗，我會稍後重試或請人工確認", "你的訂單一定沒問題", "系統不可能錯"],
              answer: 1,
              explanation: "安全的 agent 應承認工具失敗並走重試或人工路線。"
            }
          ]
        }
      ]
    },
    {
      id: "rag",
      title: "RAG 圖書館",
      theme: "讓 Agent 先查資料再回答",
      lessons: [
        {
          id: "why-rag",
          title: "為什麼需要 RAG？",
          concept: "RAG 讓模型先檢索外部資料，再根據資料回答，降低幻覺並提供引用來源。",
          analogy: "RAG 就像考試可以翻書：先找資料，再回答，還要說出你翻到哪一頁。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "RAG 主要解決什麼問題？",
              choices: ["模型不知道最新或私有資料", "按鈕顏色太醜", "網頁太慢", "使用者不想登入"],
              answer: 0,
              explanation: "RAG 讓模型能使用外部知識，而不是只靠訓練記憶。"
            },
            {
              id: "q2",
              type: "single",
              prompt: "RAG 的基本流程是什麼？",
              choices: ["亂猜 -> 回答", "檢索資料 -> 放入上下文 -> 根據資料回答", "刪除文件 -> 回答", "只輸出圖片"],
              answer: 1,
              explanation: "RAG 先 retrieval，再把相關內容給模型回答。"
            },
            {
              id: "q3",
              type: "multi",
              prompt: "RAG 系統常見零件有哪些？",
              choices: ["Documents", "Chunks", "Retriever", "Citations", "憑空捏造"],
              answer: [0, 1, 2, 3],
              explanation: "文件、切片、檢索器、引用來源是 RAG 的基本零件。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "用一句話說明 RAG。",
              keywords: ["檢索", "資料", "外部", "引用", "回答", "幻覺"],
              minMatches: 1,
              explanation: "RAG 是先檢索外部資料，再根據資料回答。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "如果查不到可靠資料，RAG agent 應該怎麼做？",
              choices: ["硬答", "承認信心不足或要求更多資料", "捏造引用", "刪除問題"],
              answer: 1,
              explanation: "低信心時拒絕硬答，是降低幻覺的重要策略。"
            }
          ]
        },
        {
          id: "chunking",
          title: "Chunking：把書切成好找的小段",
          concept: "文件太長時，要切成 chunks。切太小會失去上下文，切太大會埋掉重點。",
          analogy: "圖書館員不會把整本書塞給你，而是找出最相關的頁面。Chunk 就像可搜尋的頁面。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "chunking 是什麼？",
              choices: ["把長文件切成可檢索的小段", "把模型刪掉", "讓圖片變大", "把所有資料壓成一個字"],
              answer: 0,
              explanation: "Chunking 是把文件切成可檢索、可放進上下文的段落。"
            },
            {
              id: "q2",
              type: "single",
              prompt: "chunk 太小可能造成什麼問題？",
              choices: ["失去上下文", "電腦不能開機", "資料庫變彩色", "模型不用回答"],
              answer: 0,
              explanation: "太小的 chunk 可能缺少足夠上下文。"
            },
            {
              id: "q3",
              type: "single",
              prompt: "chunk 太大可能造成什麼問題？",
              choices: ["重點被埋掉，檢索不精準", "答案一定更好", "不需要 citations", "使用者不能打字"],
              answer: 0,
              explanation: "太大的 chunk 可能包含太多無關內容，降低檢索精準度。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "為什麼 chunking 需要平衡大小？",
              keywords: ["上下文", "重點", "檢索", "太小", "太大"],
              minMatches: 1,
              explanation: "chunk 太小會少上下文，太大會埋掉重點。"
            },
            {
              id: "q5",
              type: "multi",
              prompt: "好的 chunking 會考慮哪些因素？",
              choices: ["段落邊界", "上下文", "搜尋精準度", "token 限制", "隨機亂切"],
              answer: [0, 1, 2, 3],
              explanation: "切分要考慮語意邊界、上下文、搜尋品質和 token 限制。"
            }
          ]
        },
        {
          id: "citations-confidence",
          title: "Citations 與信心不足",
          concept: "RAG 回答應附上引用來源；如果檢索結果不可靠，就應該標記低信心或拒答。",
          analogy: "好的 RAG 像負責任的研究員：不只回答，還告訴你資料從哪裡來。",
          questions: [
            {
              id: "q1",
              type: "single",
              prompt: "citation 的作用是什麼？",
              choices: ["讓回答可追查來源", "讓字變小", "讓 tool 消失", "避免任何測試"],
              answer: 0,
              explanation: "Citation 讓使用者知道答案依據哪段資料。"
            },
            {
              id: "q2",
              type: "single",
              prompt: "檢索結果和問題不相關時，agent 應該怎麼做？",
              choices: ["標記低信心或請求更多資料", "硬答", "捏造來源", "把問題改掉"],
              answer: 0,
              explanation: "檢索不可靠時應避免硬答。"
            },
            {
              id: "q3",
              type: "multi",
              prompt: "哪些能降低 RAG 幻覺？",
              choices: ["citations", "confidence gate", "只根據 retrieved context 回答", "查不到也硬答"],
              answer: [0, 1, 2],
              explanation: "引用、信心門檻和根據檢索內容回答，都能降低幻覺。"
            },
            {
              id: "q4",
              type: "short",
              prompt: "用一句話說明 citation 為什麼重要。",
              keywords: ["來源", "引用", "追查", "根據", "證據"],
              minMatches: 1,
              explanation: "Citation 讓回答有來源、有證據、可追查。"
            },
            {
              id: "q5",
              type: "single",
              prompt: "哪個回答比較像好的 RAG 行為？",
              choices: ["根據文件 A 第 2 段，答案是...", "我不知道但我猜...", "資料不存在但我編一個", "不看文件直接回答"],
              answer: 0,
              explanation: "好的 RAG 回答會根據明確來源。"
            }
          ]
        }
      ]
    }
  ]
};

export function flattenLessons() {
  return course.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      ...lesson,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterTheme: chapter.theme
    }))
  );
}

export function flattenQuestions() {
  return flattenLessons().flatMap((lesson) =>
    lesson.questions.map((question) => ({
      ...question,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      chapterId: lesson.chapterId,
      chapterTitle: lesson.chapterTitle
    }))
  );
}
