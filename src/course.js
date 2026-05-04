const chapters = [
  {
    id: "agent-basics",
    title: "Agent 基礎直覺",
    theme: "先分清楚 chatbot、workflow、agent 的差別",
    lessons: [
      lesson({
        id: "chatbot-vs-agent",
        title: "Chatbot、Workflow、Agent 怎麼分",
        concept: "Chatbot 偏向回答；workflow 偏向固定流程；agentic workflow 則是讓模型在受控邊界內判斷下一步、使用工具、更新狀態。",
        analogy: "把 agent 想成會看任務狀態的實習生，而不是只會接一句回一句的客服視窗。",
        focus: "agentic workflow 的核心是模型、工具、狀態與檢查點的組合",
        best: {
          prompt: "哪個最像 agentic workflow？",
          correct: "先判斷任務狀態，再決定要查資料、叫工具或請人確認",
          distractors: ["只把 prompt 寫得更長", "只做一個聊天視窗", "只把所有步驟寫死"]
        },
        multi: {
          prompt: "一個可靠的 agentic workflow 通常需要哪些元素？",
          correct: ["Model", "Tool", "State", "Guardrail"],
          distractors: ["越多 emoji 越好"]
        },
        shortKeywords: ["工具", "狀態", "步驟", "檢查", "判斷"],
        boundary: {
          prompt: "何時不該直接做成 agent？",
          correct: "需求完全固定、規則清楚、沒有判斷彈性時",
          distractors: ["需要查資料時", "需要使用工具時", "需要保留狀態時"]
        },
        mistake: {
          prompt: "初學者最常誤會 agent 是什麼？",
          correct: "以為 agent 只是更長的 prompt",
          distractors: ["以為 agent 需要狀態", "以為 agent 能用工具", "以為 agent 需要評估"]
        }
      }),
      lesson({
        id: "state-and-steps",
        title: "State 與 Step",
        concept: "State 是 workflow 的記憶板，step 是一次可檢查的動作。沒有 state，就很難知道做過什麼、下一步該做什麼。",
        analogy: "像闖關遊戲的任務面板：已拿到鑰匙、還缺地圖、下一步去找 NPC。",
        focus: "state 讓多步任務能被追蹤、恢復與檢查",
        best: {
          prompt: "State 在 workflow 裡最重要的作用是什麼？",
          correct: "保存目前任務進度與關鍵中間結果",
          distractors: ["讓 UI 更好看", "取代所有工具", "讓模型不用輸入"]
        },
        multi: {
          prompt: "哪些東西適合放進 workflow state？",
          correct: ["使用者目標", "已完成步驟", "工具結果", "風險標記"],
          distractors: ["無關閒聊全部逐字保存"]
        },
        shortKeywords: ["進度", "結果", "狀態", "下一步", "追蹤"],
        boundary: {
          prompt: "哪個狀況最需要 state？",
          correct: "任務要跨多個步驟並根據前一步結果分岔",
          distractors: ["只回覆一句固定文案", "只顯示靜態圖片", "只做一次加總計算"]
        },
        mistake: {
          prompt: "State 設計太鬆散會造成什麼問題？",
          correct: "後續 step 不知道該相信哪個欄位",
          distractors: ["模型一定變快", "工具一定不能用", "測試一定更多"]
        }
      }),
      lesson({
        id: "human-approval",
        title: "Human-in-the-loop",
        concept: "高風險動作不該讓 agent 自動放行。approval gate 讓人類在付款、刪除、寄送、退款等關鍵點確認。",
        analogy: "像遊戲裡進 Boss 房前跳出的確認視窗：按下去之前先看清楚代價。",
        focus: "human approval 是把風險決策從自動化中切出來",
        best: {
          prompt: "哪個動作最需要 human approval？",
          correct: "刪除客戶資料或執行退款",
          distractors: ["整理公開 FAQ", "摘要一段文章", "計算字數"]
        },
        multi: {
          prompt: "設計 approval gate 時應該顯示什麼？",
          correct: ["將執行的動作", "受影響對象", "風險原因", "可取消選項"],
          distractors: ["模型的所有內部推理逐字稿"]
        },
        shortKeywords: ["風險", "確認", "人類", "刪除", "退款"],
        boundary: {
          prompt: "approval gate 放在哪裡最合理？",
          correct: "放在不可逆或高成本動作之前",
          distractors: ["每次顯示文字之前", "所有低風險摘要之後", "只放在頁面載入時"]
        },
        mistake: {
          prompt: "哪個 approval 設計最差？",
          correct: "只顯示『是否繼續』，不說明後果",
          distractors: ["顯示風險原因", "顯示目標對象", "提供取消按鈕"]
        }
      })
    ]
  },
  {
    id: "tools",
    title: "Tool Calling",
    theme: "讓模型不只會說，還能安全地做事",
    lessons: [
      lesson({
        id: "what-is-tool",
        title: "Tool 是 Agent 的手",
        concept: "Tool 是 agent 對外部世界的受控接口，例如查訂單、搜尋知識庫、寄信、建立 ticket。",
        analogy: "模型像大腦，tool 像手。大腦決定要拿哪個工具，但工具要有清楚用途與邊界。",
        focus: "tool calling 把自然語言判斷連到可執行能力",
        best: {
          prompt: "哪個例子最像 tool calling？",
          correct: "模型決定呼叫 trackShipment(orderId)",
          distractors: ["模型用想像回答物流狀態", "把所有 API 文件貼進 prompt", "只改按鈕顏色"]
        },
        multi: {
          prompt: "常見 tool 類型包含哪些？",
          correct: ["查資料", "寫入系統", "搜尋", "發通知"],
          distractors: ["讓模型永遠不犯錯"]
        },
        shortKeywords: ["API", "工具", "呼叫", "外部", "執行"],
        boundary: {
          prompt: "哪個任務不該只靠模型記憶？",
          correct: "查詢最新訂單狀態",
          distractors: ["改寫語氣", "分類一句話", "解釋一個固定概念"]
        },
        mistake: {
          prompt: "tool description 寫得太模糊會怎樣？",
          correct: "模型容易在錯誤時機呼叫錯工具",
          distractors: ["工具會自動變安全", "不需要測試", "schema 會消失"]
        }
      }),
      lesson({
        id: "tool-schema",
        title: "Tool Schema",
        concept: "Schema 告訴模型 tool 需要哪些欄位、型別與限制。schema 越清楚，錯誤呼叫越少。",
        analogy: "像表單欄位：必填、格式、範圍都說清楚，填錯就能提早擋下。",
        focus: "schema 是 tool calling 的輸入契約",
        best: {
          prompt: "查訂單工具最需要哪個欄位？",
          correct: "orderId",
          distractors: ["favoriteColor", "randomMood", "pageTheme"]
        },
        multi: {
          prompt: "好的 schema 會描述哪些事？",
          correct: ["欄位名稱", "型別", "是否必填", "允許範圍"],
          distractors: ["模型人格故事"]
        },
        shortKeywords: ["欄位", "型別", "必填", "限制", "契約"],
        boundary: {
          prompt: "哪個 schema 最清楚？",
          correct: "orderId: string, required",
          distractors: ["input: any", "data: whatever", "text: maybe"]
        },
        mistake: {
          prompt: "把所有 tool input 都設成 any 的風險是什麼？",
          correct: "錯誤格式會拖到執行時才爆開",
          distractors: ["測試更容易完整", "工具更安全", "使用者更少出錯"]
        }
      }),
      lesson({
        id: "tool-errors",
        title: "Tool Error 與 Retry",
        concept: "真實工具會 timeout、回傳錯誤、找不到資料。agent 必須知道何時 retry、fallback、拒答或升級給人。",
        analogy: "像外送查詢失敗時，不該假裝查到了，而是重試、換路線或告知目前無法確認。",
        focus: "tool error handling 決定 agent 是否可靠",
        best: {
          prompt: "工具 timeout 時最好的第一反應是什麼？",
          correct: "按策略 retry 或回報暫時無法確認",
          distractors: ["捏造一個結果", "刪掉錯誤訊息", "直接完成高風險動作"]
        },
        multi: {
          prompt: "常見 tool error 策略有哪些？",
          correct: ["retry", "fallback", "human escalation", "清楚記錄錯誤"],
          distractors: ["把錯誤藏起來"]
        },
        shortKeywords: ["retry", "fallback", "timeout", "錯誤", "升級"],
        boundary: {
          prompt: "哪種錯誤最不該靜默忽略？",
          correct: "付款、退款、刪除類工具失敗",
          distractors: ["非關鍵動畫載入失敗", "提示文字換行", "背景顏色不一致"]
        },
        mistake: {
          prompt: "工具失敗後直接讓模型補一個答案，最大的問題是什麼？",
          correct: "使用者會以為那是真實系統結果",
          distractors: ["字數會變少", "UI 會變慢", "題目會變簡單"]
        }
      })
    ]
  },
  {
    id: "rag",
    title: "RAG 與知識檢索",
    theme: "讓 Agent 查得到、引得到、信心不足時停得下來",
    lessons: [
      lesson({
        id: "why-rag",
        title: "為什麼需要 RAG",
        concept: "RAG 用 retrieval 把外部知識帶進回答，解決模型知識過期、上下文有限與來源不可查的問題。",
        analogy: "像開卷考：不是憑記憶猜，而是先翻資料，再根據資料回答。",
        focus: "RAG 的核心是先檢索，再根據證據回答",
        best: {
          prompt: "哪個任務最適合 RAG？",
          correct: "根據公司最新政策回答員工問題",
          distractors: ["把一句話改得更客氣", "產生一個押韻標語", "判斷 2+2"]
        },
        multi: {
          prompt: "RAG pipeline 通常包含哪些元件？",
          correct: ["Documents", "Chunks", "Retriever", "Citations"],
          distractors: ["沒有來源的猜測"]
        },
        shortKeywords: ["檢索", "文件", "來源", "回答", "知識"],
        boundary: {
          prompt: "檢索不到相關資料時，RAG agent 應該怎麼做？",
          correct: "說明找不到足夠來源，不要硬答",
          distractors: ["編造一段政策", "假裝有引用", "隨機選一個答案"]
        },
        mistake: {
          prompt: "把整份知識庫直接塞進 prompt 的問題是什麼？",
          correct: "上下文有限且成本高，還可能塞不到重點",
          distractors: ["一定比檢索快", "一定更準", "不用分段"]
        }
      }),
      lesson({
        id: "chunking",
        title: "Chunking",
        concept: "Chunking 是把文件切成可檢索的小段。切太大會稀釋重點，切太小會失去上下文。",
        analogy: "像把課本切成便條。太大找不到重點，太小又不知道前後文。",
        focus: "chunk size 與 overlap 會影響 retrieval 品質",
        best: {
          prompt: "chunk 太大最常造成什麼問題？",
          correct: "檢索結果包含太多無關內容",
          distractors: ["引用一定消失", "模型不能輸出", "工具不能呼叫"]
        },
        multi: {
          prompt: "調整 chunking 時要考慮哪些因素？",
          correct: ["語意完整", "chunk 大小", "overlap", "token 成本"],
          distractors: ["按鈕圓角"]
        },
        shortKeywords: ["chunk", "段落", "大小", "overlap", "檢索"],
        boundary: {
          prompt: "哪個文件最需要小心 chunking？",
          correct: "一份包含多個條款與例外規則的政策文件",
          distractors: ["單一句歡迎詞", "只有標題的海報", "一個固定數字"]
        },
        mistake: {
          prompt: "chunk 太小的典型問題是什麼？",
          correct: "缺少前後文，模型難以判斷真正意思",
          distractors: ["永遠找不到任何結果", "資料庫會自動刪除", "引用一定更準"]
        }
      }),
      lesson({
        id: "citations-confidence",
        title: "Citations 與 Confidence",
        concept: "引用來源讓使用者能檢查答案；confidence gate 則讓 agent 在證據不足時停下來。",
        analogy: "像寫報告附註腳：不是只說我覺得，而是讓別人追到資料來源。",
        focus: "可靠 RAG 必須能附來源，也能拒絕回答",
        best: {
          prompt: "citation 最主要的價值是什麼？",
          correct: "讓使用者能追查答案根據",
          distractors: ["讓字數變長", "取代所有檢索", "讓 UI 變漂亮"]
        },
        multi: {
          prompt: "哪些做法能降低 RAG 胡說？",
          correct: ["引用來源", "confidence gate", "只根據 retrieved context 回答", "找不到就拒答"],
          distractors: ["禁止使用文件"]
        },
        shortKeywords: ["來源", "引用", "信心", "拒答", "證據"],
        boundary: {
          prompt: "哪個回答最健康？",
          correct: "根據來源 A 與 B，目前只確認到這兩點",
          distractors: ["我猜大概是這樣", "沒有資料但答案一定是 X", "來源忘了但我很確定"]
        },
        mistake: {
          prompt: "只有 citation 格式但來源不存在，問題是什麼？",
          correct: "看似可信，實際上更危險",
          distractors: ["閱讀速度一定變快", "檢索成本為零", "答案一定更短"]
        }
      })
    ]
  },
  {
    id: "memory",
    title: "Memory 與 Context",
    theme: "讓 Agent 記得該記的，也忘得掉不該記的",
    lessons: [
      lesson({
        id: "short-vs-long-memory",
        title: "短期記憶 vs 長期記憶",
        concept: "短期記憶通常存在單次任務 state；長期記憶跨對話保存偏好、規則與可重用知識。",
        analogy: "短期像白板，長期像筆記本。白板解這題，筆記本留給下次。",
        focus: "memory 讓 agent 能跨回合延續上下文",
        best: {
          prompt: "哪個最像長期記憶？",
          correct: "使用者偏好回覆要先給結論",
          distractors: ["本輪第 2 步的暫時計算", "目前按鈕 hover 狀態", "一次性驗證碼"]
        },
        multi: {
          prompt: "適合存入 memory 的資料有哪些？",
          correct: ["穩定偏好", "長期規則", "可重用專案背景", "使用者明確同意保存的資訊"],
          distractors: ["敏感資料原文全部保存"]
        },
        shortKeywords: ["偏好", "規則", "長期", "短期", "保存"],
        boundary: {
          prompt: "哪個資料最不適合直接長期保存？",
          correct: "信用卡號或一次性密碼",
          distractors: ["偏好的語言", "常用輸出格式", "專案公開名稱"]
        },
        mistake: {
          prompt: "把所有對話逐字存成 memory 的風險是什麼？",
          correct: "隱私風險高，且會污染未來上下文",
          distractors: ["一定降低成本", "一定提升準確率", "一定更容易測試"]
        }
      }),
      lesson({
        id: "memory-retrieval",
        title: "Memory Retrieval",
        concept: "記憶不是全部塞進 prompt，而是需要按任務檢索相關片段，保持 context 精簡。",
        analogy: "像查筆記：只翻今天會用到的頁面，而不是把整本書攤在桌上。",
        focus: "memory retrieval 要在相關性與 context 成本之間取平衡",
        best: {
          prompt: "為什麼 memory 需要 retrieval？",
          correct: "只取和當前任務相關的記憶，避免 context 爆炸",
          distractors: ["讓模型完全不用工具", "讓所有資料公開", "取代 guardrails"]
        },
        multi: {
          prompt: "設計 memory retrieval 時要注意哪些事？",
          correct: ["相關性", "時間新舊", "權限範圍", "衝突處理"],
          distractors: ["把最長的記憶永遠放第一"]
        },
        shortKeywords: ["檢索", "相關", "context", "權限", "衝突"],
        boundary: {
          prompt: "兩條記憶互相衝突時，最合理的處理是什麼？",
          correct: "根據時間、來源與明確程度決定，必要時詢問使用者",
          distractors: ["永遠相信最舊的", "隨機選一條", "兩條都硬塞進答案"]
        },
        mistake: {
          prompt: "memory retrieval 沒有權限隔離可能造成什麼問題？",
          correct: "A 使用者的資訊被帶到 B 使用者回覆中",
          distractors: ["模型完全不能回答", "CSS 失效", "工具 schema 變短"]
        }
      }),
      lesson({
        id: "memory-governance",
        title: "Memory Governance",
        concept: "長期記憶需要可看、可改、可刪、可限制範圍。否則 agent 會把錯誤偏好帶到未來。",
        analogy: "像通訊錄：要能新增，也要能改錯、刪除、分群。",
        focus: "memory governance 讓記憶可控而不是黑箱",
        best: {
          prompt: "好的 memory 系統應該提供什麼能力？",
          correct: "讓使用者查看、修改與刪除已保存記憶",
          distractors: ["永遠不能刪", "全部存在 prompt 裡", "只讓模型知道"]
        },
        multi: {
          prompt: "memory governance 包含哪些設計？",
          correct: ["同意保存", "可刪除", "範圍隔離", "敏感資料過濾"],
          distractors: ["偷偷保存所有內容"]
        },
        shortKeywords: ["刪除", "同意", "隱私", "範圍", "過濾"],
        boundary: {
          prompt: "哪個記憶更新最需要確認？",
          correct: "把使用者健康、財務或身份資訊設為長期記憶",
          distractors: ["使用者喜歡條列摘要", "使用者偏好繁體中文", "使用者喜歡先看結論"]
        },
        mistake: {
          prompt: "沒有 memory governance 的 agent 最像什麼？",
          correct: "會自己做筆記但沒有人能檢查筆記內容",
          distractors: ["完全沒有狀態的函式", "只會顯示圖片", "不能使用工具的模型"]
        }
      })
    ]
  },
  {
    id: "guardrails",
    title: "Guardrails 與安全邊界",
    theme: "不是限制 AI，而是讓 AI 能被信任地使用",
    lessons: [
      lesson({
        id: "input-output-guardrails",
        title: "Input / Output Guardrails",
        concept: "Input guardrail 檢查使用者輸入；output guardrail 檢查最終輸出。兩者守的邊界不同。",
        analogy: "像機場安檢：進門先檢查，出貨前也要驗收。",
        focus: "guardrails 是 workflow 邊界的檢查層",
        best: {
          prompt: "input guardrail 最適合檢查什麼？",
          correct: "使用者要求是否越界或惡意",
          distractors: ["最終答案是否附來源", "CSS 是否好看", "伺服器 port 是多少"]
        },
        multi: {
          prompt: "output guardrail 可能檢查哪些事？",
          correct: ["是否洩漏敏感資訊", "是否符合格式", "是否包含禁止內容", "是否需要拒答"],
          distractors: ["使用者滑鼠位置"]
        },
        shortKeywords: ["輸入", "輸出", "檢查", "阻擋", "邊界"],
        boundary: {
          prompt: "哪個最適合 output guardrail？",
          correct: "送出前檢查回覆是否包含不該公開的資料",
          distractors: ["使用者打字之前改模型", "資料庫備份", "圖片壓縮"]
        },
        mistake: {
          prompt: "只靠 prompt 說『不要做壞事』的問題是什麼？",
          correct: "缺少可測試、可阻擋的檢查點",
          distractors: ["一定比 guardrail 更穩", "完全不需要 eval", "工具會自動安全"]
        }
      }),
      lesson({
        id: "tool-guardrails",
        title: "Tool Guardrails",
        concept: "Tool guardrails 包在工具呼叫前後，特別適合檢查每一次 API 或函式工具的輸入與輸出。",
        analogy: "像每台機器旁邊自己的安全鎖，而不是只在工廠大門口檢查。",
        focus: "tool guardrails 保護每一次工具執行",
        best: {
          prompt: "何時應該用 tool guardrail？",
          correct: "每次退款工具執行前都要檢查金額與權限",
          distractors: ["只檢查首頁標題", "只在最後摘要加表情", "只計算 XP"]
        },
        multi: {
          prompt: "tool guardrail 可以做哪些事？",
          correct: ["阻擋危險輸入", "替換不合格輸出", "丟出 tripwire", "記錄風險"],
          distractors: ["讓工具不需要 schema"]
        },
        shortKeywords: ["工具", "權限", "阻擋", "tripwire", "檢查"],
        boundary: {
          prompt: "哪個工具最需要 tool guardrail？",
          correct: "deleteUser(userId)",
          distractors: ["formatMarkdown(text)", "countWords(text)", "capitalizeTitle(text)"]
        },
        mistake: {
          prompt: "只在 workflow 最後才檢查工具結果的風險是什麼？",
          correct: "危險工具可能早就已經執行完了",
          distractors: ["速度一定更慢", "模型一定不能輸出", "引用一定消失"]
        }
      }),
      lesson({
        id: "policy-routing",
        title: "Policy Routing",
        concept: "安全不是只有拒絕。好的 routing 會把請求導到允許、拒絕、澄清、人工處理等不同路徑。",
        analogy: "像客服分流：能自助的自助，敏感的升級，資料不足的先追問。",
        focus: "policy routing 把安全規則變成可執行分岔",
        best: {
          prompt: "使用者要求刪除帳號但身份未確認，最合理路徑是？",
          correct: "先要求身份確認或升級人工",
          distractors: ["直接刪除", "假裝刪除", "回答一首詩"]
        },
        multi: {
          prompt: "常見 policy route 包含哪些？",
          correct: ["allow", "refuse", "clarify", "escalate"],
          distractors: ["always execute"]
        },
        shortKeywords: ["分流", "拒絕", "澄清", "人工", "規則"],
        boundary: {
          prompt: "哪種輸入最需要 clarify route？",
          correct: "目標不明但可能有多種安全解讀",
          distractors: ["明確低風險摘要", "固定問候語", "已驗證的查詢"]
        },
        mistake: {
          prompt: "把 guardrail 只做成黑名單關鍵字會有什麼問題？",
          correct: "容易漏掉變形說法，也容易誤擋正常需求",
          distractors: ["一定覆蓋所有情況", "完全不需要維護", "能理解上下文"]
        }
      })
    ]
  },
  {
    id: "evals",
    title: "Evals 與品質驗證",
    theme: "不靠感覺說 agent 變好了",
    lessons: [
      lesson({
        id: "why-evals",
        title: "為什麼需要 Evals",
        concept: "Agent 的品質不能只看 demo 順不順。evals 用固定案例追蹤正確性、安全性、格式與回歸。",
        analogy: "像遊戲關卡測試：不能只玩最簡單那關，要測正常、邊界、失敗路線。",
        focus: "evals 把主觀感覺變成可追蹤指標",
        best: {
          prompt: "哪個最像 eval？",
          correct: "用一組固定客服案例測回覆是否符合 policy",
          distractors: ["看一次 demo 覺得順", "改大標題", "只問朋友喜不喜歡"]
        },
        multi: {
          prompt: "agent eval 可以測哪些面向？",
          correct: ["正確性", "安全性", "格式", "引用品質"],
          distractors: ["開發者心情"]
        },
        shortKeywords: ["測試", "案例", "指標", "回歸", "品質"],
        boundary: {
          prompt: "什麼時候最需要 eval suite？",
          correct: "調整 prompt、模型、retriever 或工具後",
          distractors: ["只改 README 空白", "只換資料夾名稱", "只開瀏覽器"]
        },
        mistake: {
          prompt: "只用 happy path 測 agent 的問題是什麼？",
          correct: "看不到錯誤輸入、邊界條件與安全失敗",
          distractors: ["一定更可靠", "一定更省錢", "能證明全部功能"]
        }
      }),
      lesson({
        id: "eval-dataset",
        title: "Eval Dataset",
        concept: "好的 eval dataset 要包含真實任務、邊界案例、惡意輸入、低信心情境與預期行為。",
        analogy: "像考題庫：只考定義背誦不夠，還要考應用題與陷阱題。",
        focus: "eval dataset 決定你到底在測什麼能力",
        best: {
          prompt: "哪個最適合加入 RAG eval dataset？",
          correct: "問題答案不在文件中，期待 agent 拒答",
          distractors: ["永遠能從第一段找到答案", "完全無關的笑話", "只有 UI 顏色"]
        },
        multi: {
          prompt: "eval dataset 應該包含哪些案例？",
          correct: ["正常案例", "邊界案例", "拒答案例", "惡意或越界案例"],
          distractors: ["只保留最容易的案例"]
        },
        shortKeywords: ["資料集", "案例", "邊界", "拒答", "預期"],
        boundary: {
          prompt: "預期答案應該寫到什麼程度？",
          correct: "寫清楚可接受行為與不可接受行為",
          distractors: ["只寫『看起來不錯』", "完全不寫", "只寫 emoji"]
        },
        mistake: {
          prompt: "eval dataset 一直不更新會有什麼問題？",
          correct: "無法覆蓋新功能、新風險與真實錯誤",
          distractors: ["測試會自動更完整", "模型會停止變動", "資料會自動清理"]
        }
      }),
      lesson({
        id: "scoring-regression",
        title: "Scoring 與 Regression",
        concept: "Scoring 把表現轉成分數或通過條件；regression test 確保改動沒有破壞已知能力。",
        analogy: "像成績單與回歸測試：新能力增加，也不能讓舊關卡壞掉。",
        focus: "評分規則要穩定、可解釋、能比較",
        best: {
          prompt: "哪個是比較好的 eval scoring？",
          correct: "答案需包含來源，且找不到來源時必須拒答",
          distractors: ["我覺得可以", "越長越高分", "語氣像 AI 就高分"]
        },
        multi: {
          prompt: "常見 scoring signals 有哪些？",
          correct: ["是否正確", "是否附來源", "是否符合格式", "是否安全拒答"],
          distractors: ["答案越神秘越好"]
        },
        shortKeywords: ["分數", "通過", "回歸", "格式", "來源"],
        boundary: {
          prompt: "為什麼 regression 很重要？",
          correct: "避免新 prompt 或新模型破壞原本通過的行為",
          distractors: ["讓 UI 一定變漂亮", "讓資料庫不用備份", "讓工具自動消失"]
        },
        mistake: {
          prompt: "用不穩定評分規則的問題是什麼？",
          correct: "分數波動時不知道是品質變了還是評分器變了",
          distractors: ["一定更準", "更容易比較", "不需要記錄版本"]
        }
      })
    ]
  },
  {
    id: "observability",
    title: "Observability",
    theme: "看得見每一步，才修得好 agent",
    lessons: [
      lesson({
        id: "traces-spans",
        title: "Trace 與 Span",
        concept: "Trace 記錄一次完整 workflow；span 記錄其中一段，例如模型呼叫、工具呼叫、guardrail、handoff。",
        analogy: "像遊戲回放：trace 是整場，span 是每次出招。",
        focus: "tracing 讓多步 agent 的問題可定位",
        best: {
          prompt: "trace 最主要用來看什麼？",
          correct: "一次 agent run 中每個步驟發生了什麼",
          distractors: ["只看首頁點擊率", "替代所有測試", "產生圖片"]
        },
        multi: {
          prompt: "哪些事件適合成為 span？",
          correct: ["LLM generation", "tool call", "guardrail check", "handoff"],
          distractors: ["無關的螢幕亮度"]
        },
        shortKeywords: ["trace", "span", "步驟", "工具", "模型"],
        boundary: {
          prompt: "agent 回答錯時，trace 可以幫你先看哪裡？",
          correct: "是檢索錯、工具錯、模型判斷錯，還是 guardrail 沒擋",
          distractors: ["只看字體大小", "只重開電腦", "只改 logo"]
        },
        mistake: {
          prompt: "沒有 tracing 的多步 agent 最難處理什麼？",
          correct: "不知道錯誤是在哪一步發生",
          distractors: ["不能顯示文字", "不能使用 CSS", "不能打開 README"]
        }
      }),
      lesson({
        id: "latency-cost",
        title: "Latency、Tokens、Cost",
        concept: "可用的 agent 不只要準，還要知道慢在哪、花在哪、哪個步驟最貴。",
        analogy: "像餐廳出餐：不只問好不好吃，也要知道卡在備料、烹調還是結帳。",
        focus: "observability 要追蹤速度、token 與成本",
        best: {
          prompt: "哪個指標最能幫你找出 agent 變慢的原因？",
          correct: "每個 step 的 latency",
          distractors: ["README 字數", "按鈕顏色", "repo stars"]
        },
        multi: {
          prompt: "agent dashboard 常追蹤哪些指標？",
          correct: ["latency", "tokens", "cost", "failure rate"],
          distractors: ["使用者星座"]
        },
        shortKeywords: ["latency", "token", "cost", "失敗", "指標"],
        boundary: {
          prompt: "哪個情況最需要拆 step 看 cost？",
          correct: "一次 run 會呼叫多個模型與工具",
          distractors: ["只有一行靜態文字", "沒有任何輸入", "只顯示圖片"]
        },
        mistake: {
          prompt: "只看總耗時的問題是什麼？",
          correct: "不知道是哪個 step 造成延遲",
          distractors: ["一定能省成本", "一定能找到錯字", "一定能修 retrieval"]
        }
      }),
      lesson({
        id: "failure-analysis",
        title: "Failure Analysis",
        concept: "失敗要分類：輸入問題、檢索問題、工具問題、模型判斷問題、guardrail 問題。分類後才知道怎麼修。",
        analogy: "像醫生看診：先分清楚是發燒、過敏、受傷，不能一律吃同一種藥。",
        focus: "failure taxonomy 讓改進有方向",
        best: {
          prompt: "RAG 回答錯但 trace 顯示沒檢索到正確文件，應優先修哪裡？",
          correct: "retrieval 或 chunking",
          distractors: ["只改按鈕", "只加 emoji", "刪掉 evals"]
        },
        multi: {
          prompt: "常見 agent failure 類型有哪些？",
          correct: ["retrieval failure", "tool failure", "policy failure", "format failure"],
          distractors: ["天氣太好"]
        },
        shortKeywords: ["失敗", "分類", "檢索", "工具", "格式"],
        boundary: {
          prompt: "為什麼要保留失敗案例？",
          correct: "可以加入 eval dataset，避免同樣錯誤回來",
          distractors: ["讓 repo 變大就好", "讓 UI 更花", "讓測試更少"]
        },
        mistake: {
          prompt: "看到錯誤就直接換模型的問題是什麼？",
          correct: "可能掩蓋真正問題，例如 retrieval 或 tool schema 設計錯",
          distractors: ["一定最便宜", "一定解決所有錯", "不需要 trace"]
        }
      })
    ]
  },
  {
    id: "frameworks",
    title: "LangChain / LangGraph",
    theme: "理解框架，不被框架牽著走",
    lessons: [
      lesson({
        id: "langchain-role",
        title: "LangChain 解決什麼",
        concept: "LangChain 提供 models、tools、retrievers、agents 等元件，幫你把 LLM 應用常見積木接起來。",
        analogy: "像一盒 AI 樂高：模型、工具、檢索器、記憶、agent 都是可組合零件。",
        focus: "LangChain 是組裝 LLM 應用的元件層",
        best: {
          prompt: "LangChain 最適合被理解成什麼？",
          correct: "組裝模型、工具、retriever 與 agent 的框架",
          distractors: ["只是一個聊天 UI", "只是一個資料庫", "只是一個圖片編輯器"]
        },
        multi: {
          prompt: "LangChain 常見元件包含哪些？",
          correct: ["Models", "Tools", "Retrievers", "Agents"],
          distractors: ["滑鼠墊"]
        },
        shortKeywords: ["模型", "工具", "retriever", "agent", "組合"],
        boundary: {
          prompt: "什麼時候不需要急著上 LangChain？",
          correct: "任務只有一兩個固定 API 呼叫，原生程式碼已經很清楚",
          distractors: ["需要 RAG 時", "需要工具時", "需要多元件組合時"]
        },
        mistake: {
          prompt: "學 LangChain 最常見的錯誤心態是什麼？",
          correct: "先背 API，卻不懂背後 workflow 拼圖",
          distractors: ["先懂工具概念", "先懂 retrieval", "先懂 eval"]
        }
      }),
      lesson({
        id: "langgraph-role",
        title: "LangGraph 解決什麼",
        concept: "LangGraph 用 graph 表達 stateful workflow，適合需要分岔、循環、human-in-the-loop、durable execution 的 agent。",
        analogy: "像任務地圖：每個 node 是一步，edge 決定下一站，state 帶著你走完整張圖。",
        focus: "LangGraph 是 stateful agent workflow 的圖狀執行層",
        best: {
          prompt: "哪個任務最適合 LangGraph？",
          correct: "需要多步、分岔、可恢復與人工審核的 agent workflow",
          distractors: ["只回覆固定字串", "只顯示一張圖片", "只計算 1+1"]
        },
        multi: {
          prompt: "LangGraph 常處理哪些需求？",
          correct: ["stateful graph", "durable execution", "human-in-the-loop", "branching"],
          distractors: ["自動保證商業成功"]
        },
        shortKeywords: ["graph", "state", "node", "edge", "恢復"],
        boundary: {
          prompt: "durable execution 的價值是什麼？",
          correct: "workflow 中斷後能從保存的狀態恢復",
          distractors: ["讓所有回答變短", "刪掉所有 state", "不用處理錯誤"]
        },
        mistake: {
          prompt: "把所有流程都塞進一個巨大 node 的問題是什麼？",
          correct: "失去可觀察、可測試與可恢復的優勢",
          distractors: ["一定更清楚", "一定更容易追蹤", "一定更可靠"]
        }
      }),
      lesson({
        id: "choosing-abstractions",
        title: "何時用框架，何時不用",
        concept: "框架是加速器，不是目標。先懂 workflow 形狀，再決定用原生程式、LangChain、LangGraph 或 Agents SDK。",
        analogy: "像交通工具：走路、腳踏車、捷運、車都有適合距離，不是每趟都開卡車。",
        focus: "選框架要看任務複雜度、狀態、工具與可觀察需求",
        best: {
          prompt: "選框架前最該先問什麼？",
          correct: "這個 workflow 需要哪些步驟、狀態、工具與檢查點？",
          distractors: ["哪個名字最潮", "哪個 logo 最好看", "哪個安裝最長"]
        },
        multi: {
          prompt: "選型時要考慮哪些因素？",
          correct: ["workflow 複雜度", "state 需求", "可觀察性", "團隊熟悉度"],
          distractors: ["只看社群聲量"]
        },
        shortKeywords: ["選型", "複雜度", "狀態", "工具", "觀察"],
        boundary: {
          prompt: "哪個說法最成熟？",
          correct: "先用最小可理解架構，複雜度出現後再引入框架",
          distractors: ["所有東西一律 LangGraph", "所有東西一律不用框架", "只看流行度"]
        },
        mistake: {
          prompt: "只為了履歷感覺漂亮而硬套框架，最大的風險是什麼？",
          correct: "作品看起來複雜，但說不清楚為什麼需要它",
          distractors: ["一定更好維護", "一定更容易 debug", "一定更低成本"]
        }
      })
    ]
  }
];

export const course = {
  title: "Agent Quest",
  subtitle: "用選擇題、錯題重現與間隔複習，從 0 建立 Agentic Workflow 直覺",
  chapters
};

export function flattenLessons() {
  return course.chapters.flatMap((chapter) =>
    chapter.lessons.map((item) => ({
      ...item,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterTheme: chapter.theme
    }))
  );
}

export function flattenQuestions() {
  return flattenLessons().flatMap((item) =>
    item.questions.map((question) => ({
      ...question,
      lessonId: item.id,
      lessonTitle: item.title,
      chapterId: item.chapterId,
      chapterTitle: item.chapterTitle
    }))
  );
}

export function bossQuestionsForChapter(chapterId, limit = 8) {
  return flattenQuestions()
    .filter((question) => question.chapterId === chapterId && question.type !== "short")
    .filter((question) => question.id === "q1" || question.id === "q2" || question.id === "q4")
    .slice(0, limit);
}

function lesson({ id, title, concept, analogy, focus, best, multi, shortKeywords, boundary, mistake }) {
  return {
    id,
    title,
    concept,
    analogy,
    questions: [
      single("q1", best.prompt, best.correct, best.distractors, `重點是：${focus}。`),
      multiChoice("q2", multi.prompt, multi.correct, multi.distractors, `這些選項都是 ${title} 會用到的核心判斷。`),
      short("q3", `用一句話說明：${title} 為什麼重要？`, shortKeywords, `可以抓住「${shortKeywords.slice(0, 3).join("、")}」這類關鍵詞來回答。`),
      single("q4", boundary.prompt, boundary.correct, boundary.distractors, "判斷邊界比背定義更重要，因為真實工作常是在選路線。"),
      single("q5", mistake.prompt, mistake.correct, mistake.distractors, "這是常見誤區，能辨認它就能少走很多彎路。")
    ]
  };
}

function single(id, prompt, correct, distractors, explanation) {
  return {
    id,
    type: "single",
    prompt,
    choices: shuffleStable([correct, ...distractors], id),
    answer: shuffleStable([correct, ...distractors], id).indexOf(correct),
    explanation
  };
}

function multiChoice(id, prompt, correct, distractors, explanation) {
  const choices = [...correct, ...distractors];
  return {
    id,
    type: "multi",
    prompt,
    choices,
    answer: correct.map((item) => choices.indexOf(item)),
    explanation
  };
}

function short(id, prompt, keywords, explanation) {
  return {
    id,
    type: "short",
    prompt,
    keywords,
    minMatches: 1,
    explanation
  };
}

function shuffleStable(items, seed) {
  if (seed === "q1") return [items[1], items[0], items[2], items[3]];
  if (seed === "q4") return [items[0], items[2], items[1], items[3]];
  return items;
}
