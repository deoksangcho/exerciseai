const GEMINI_URL = "https://gemini.google.com/";
const NOTEBOOK_URL = "https://notebooklm.google.com/";
const siteConfig = {
  programTitle: "수원교육지원청 지방공무원 역량강화 연수",
  appTitle: "AI 실습실",
  pageTitle: "수원 역량강화 AI 실습실",
  description: "수원교육지원청 지방공무원 역량강화 연수용 AI 실습 프롬프트 런처",
  lectureFile: "AI 역량강화 일반.pdf",
  lectureLabel: "강의안 PDF",
  lectureDownloadText: "강의안 다운받기",
  ...(window.EXERCISE_AI_SITE_CONFIG || {})
};

const helperPrompts = {
  fileIssue: `첨부 파일을 제대로 읽지 못한 것 같습니다.
현재 대화에 첨부된 파일 목록을 먼저 표로 정리하고, 각 파일을 어떤 용도로 사용할 수 있는지 판단해 주세요.
필수 파일이 빠졌다면 작업을 진행하지 말고 어떤 파일이 필요한지 짧게 알려 주세요.`,
  verify: `방금 만든 결과물을 원본 첨부자료와 다시 대조해 주세요.
누락, 숫자 오류, 표 형식 오류, 개인정보 노출 가능성을 점검한 뒤 수정본을 제시해 주세요.
원본에서 확인할 수 없는 내용은 임의로 채우지 말고 "확인 필요"로 표시해 주세요.`,
  shorten: `방금 결과가 너무 깁니다.
업무에 바로 붙여넣을 수 있도록 핵심 결과만 남기고, 설명 문장은 최소화해 주세요.
표가 필요한 부분은 표로 유지하고, 불필요한 해설은 삭제해 주세요.`,
  tableBroken: `표 형식이 깨졌습니다.
같은 내용을 다시 정리하되, 표의 열 이름과 순서를 유지하고 복사해서 엑셀 또는 한글에 붙여넣기 쉬운 형태로 다시 출력해 주세요.`,
  privacy: `결과물에 개인정보가 남아 있는지 다시 점검해 주세요.
학생, 학부모, 위원 실명, 연락처, 주소, 학급/반, 개인 식별 가능 정보는 마스킹하고, 공적 직책과 안건 내용은 유지해 주세요.`,
  promptImprove: `아래 초안 프롬프트를 실제 업무에서 반복 사용할 수 있도록 개선해 주세요.
역할, 입력자료, 처리절차, 출력형식, 검증기준, 금지사항을 분리하고, 사용자가 파일을 누락했을 때 확인 질문을 하도록 보완해 주세요.`
};

const inlinePrompts = {
  customSettings: `답변은 특별한 요청이 없는 한 한국어로 해 주세요.
전문가답게 대답하되, 근거가 없는 내용은 지어내지 말고 없다고 말해 주세요.
과업 시작 전 최상의 결과물 기준을 스스로 세우고, 결과 생성 후 기준에 맞는지 자체 검증해 주세요.
따뜻하고 친절하게 답변하되, 설명은 중학생도 이해할 수 있게 쉽게 풀어 주세요.
Take a deep breath, and work on this step by step.`,
  metaPrompt: `당신은 행정업무용 프롬프트를 설계하는 전문가입니다.
아래 업무 설명을 바탕으로 실제 AI 도구에 붙여넣어 반복 사용할 수 있는 고품질 프롬프트를 작성해 주세요.

업무 설명:
[여기에 내가 처리하려는 업무를 적습니다]

프롬프트에는 다음 항목을 반드시 포함해 주세요.
1. 역할
2. 입력자료
3. 처리절차
4. 출력형식
5. 검증기준
6. 금지사항
7. 파일이 부족하거나 정보가 불명확할 때의 확인 질문

결과는 복사해서 바로 사용할 수 있는 하나의 프롬프트로 작성해 주세요.`,
  budgetRequest: `# 역할
당신은 학교 교육환경개선사업 예산 신청서를 작성하는 교육행정 문서 전문가입니다.
기존 신청서 양식에서 분석된 번호 체계, 기호 사용 방식, 문체와 형식을 유지하면서 신청서를 작성합니다.

# 입력자료
- 기존 참고신청서
- 공사 견적서 또는 산출내역서
- 작성 대상 사업 설명

# 과업
학교의 노후화된 복도 개선을 위한 예산신청서를 작성합니다.
학교현황 및 최근 3년간 유사 사업 지원현황은 작성하지 않습니다.
사업비는 전액 신청액(교육청)란에 작성합니다.
견적서를 근거로 산출기초를 최대한 세부적으로 나눠 작성합니다.

# 강조할 상황
한정된 교육청 예산 안에서 여러 학교가 신청하는 상황이므로, 우리 학교의 예산 필요성과 학생 안전, 교육환경 개선 효과가 분명히 드러나야 합니다.

# 출력
기존 양식의 구조를 유지한 완성본 형태로 작성해 주세요.
근거자료에서 확인되지 않는 수치나 사실은 임의로 만들지 말고 확인 필요로 표시해 주세요.`,
  gemBuilder: `Gemini Gem에 넣을 맞춤 지침을 만들어 주세요.
목표는 학교 행정업무 프롬프트를 짧은 키워드만으로도 안정적으로 생성하는 것입니다.

Gem의 역할, 사용자가 입력할 내용, 결과물 형식, 확인 질문 기준, 개인정보 주의사항, 출력 전 자체 검증 기준을 포함해 주세요.
회의록, 예산, OCR, 엑셀 정리 업무에 공통으로 쓸 수 있게 작성해 주세요.`,
  notebookSetup: `NotebookLM에 업로드한 공식 문서와 참고자료를 기준으로 답변해 주세요.
답변할 때는 어떤 자료를 근거로 삼았는지 함께 알려 주고, 자료에서 확인되지 않는 내용은 추정하지 말아 주세요.
실무자가 바로 사용할 수 있도록 업무 절차, 주의사항, 예시 문구를 구분해 정리해 주세요.`,
  spreadsheetHelp: `첨부한 엑셀 파일을 분석해 주세요.
반복 작업, 누락 데이터, 중복 데이터, 수식으로 자동화할 수 있는 부분을 찾아 정리하고, 업무 담당자가 따라 할 수 있는 개선 절차를 제안해 주세요.
가능하면 새 시트 구성안, 필요한 수식, 검증 방법까지 함께 알려 주세요.`,
  facilityData: `첨부한 도면 또는 시설 관련 PDF를 분석해 주세요.
학교 시설 관리자가 활용할 수 있도록 공간명, 층, 주요 설비, 공사 범위, 확인이 필요한 항목을 표로 정리해 주세요.
도면에서 확인되지 않는 내용은 추정하지 말고 확인 필요로 표시해 주세요.`
};

function lectureMaterial() {
  return { label: siteConfig.lectureLabel, path: siteConfig.lectureFile, type: "PDF" };
}

const practices = [
  {
    id: "custom-settings",
    title: "맞춤설정 세팅",
    category: "기초",
    pages: "강의안 60~65쪽",
    time: "5분",
    level: "쉬움",
    tool: "ChatGPT/Gemini",
    description: "AI가 항상 같은 기본 태도로 답하도록 나만의 맞춤설정을 구성합니다.",
    materials: [lectureMaterial()],
    steps: ["사용하는 AI의 맞춤설정 또는 사용자 지침 메뉴를 엽니다.", "아래 문구를 복사해 기본 지침에 붙여넣습니다.", "짧은 질문을 던져 한국어, 검증, 쉬운 설명이 반영되는지 확인합니다."],
    prompts: [{ title: "맞춤설정 문구", text: inlinePrompts.customSettings }],
    checks: ["한국어로 답변하나요?", "모르는 내용은 모른다고 말하나요?", "답변 전후 기준과 검증을 언급하나요?"],
    trouble: ["shorten"]
  },
  {
    id: "prompt-making",
    title: "프롬프트 만들기",
    category: "기초",
    pages: "강의안 66~75쪽",
    time: "10분",
    level: "쉬움",
    tool: "Gemini 권장",
    description: "역할, 상황, 행동, 기대 결과를 넣어 반복 업무용 프롬프트를 만듭니다.",
    materials: [lectureMaterial()],
    steps: ["Gemini 새 창을 엽니다.", "아래 메타 프롬프트를 복사합니다.", "내가 자동화하고 싶은 업무 설명을 한 문단으로 적습니다.", "생성된 프롬프트를 저장하거나 Gem 지침으로 옮깁니다."],
    prompts: [{ title: "메타 프롬프트", text: inlinePrompts.metaPrompt }],
    checks: ["역할과 입력자료가 분리되어 있나요?", "출력형식과 검증기준이 있나요?", "파일 누락 시 확인 질문 조건이 있나요?"],
    trouble: ["promptImprove", "shorten"]
  },
  {
    id: "gem-builder",
    title: "나만의 Gem 만들기",
    category: "자동화",
    pages: "강의안 76~89쪽",
    time: "15분",
    level: "보통",
    tool: "Gemini Gem",
    description: "자주 쓰는 행정업무 프롬프트 생성기를 Gem으로 저장합니다.",
    materials: [
      { label: "프롬프트 확장 예시 1", path: "강의실습자료/06 프롬프트 확장/chat_01.png", type: "PNG" },
      { label: "프롬프트 확장 예시 2", path: "강의실습자료/06 프롬프트 확장/chat_02.png", type: "PNG" }
    ],
    steps: ["Gemini에서 Gem 만들기 화면을 엽니다.", "아래 지침 생성 프롬프트를 실행합니다.", "생성된 지침을 Gem 설명과 지침란에 맞게 붙여넣습니다.", "회의록 또는 OCR 같은 키워드만 입력해 작동을 확인합니다."],
    prompts: [{ title: "Gem 지침 생성 프롬프트", text: inlinePrompts.gemBuilder }],
    checks: ["키워드만 넣어도 프롬프트 초안이 나오나요?", "개인정보 주의 문구가 포함되어 있나요?", "출력 전 검증 기준이 있나요?"],
    trouble: ["promptImprove", "verify"]
  },
  {
    id: "notebook-rag",
    title: "NotebookLM/RAG 연결",
    category: "자동화",
    pages: "강의안 81~89쪽",
    time: "12분",
    level: "보통",
    tool: "NotebookLM",
    description: "공식 문서와 학교 자료를 소스로 넣어 근거 기반 답변 흐름을 만듭니다.",
    materials: [lectureMaterial()],
    steps: ["NotebookLM 새 창을 엽니다.", "공식 문서 또는 학교 내부 참고자료를 소스로 추가합니다.", "아래 프롬프트를 복사해 질문합니다.", "답변에 근거자료가 표시되는지 확인합니다."],
    prompts: [{ title: "근거 기반 답변 요청", text: inlinePrompts.notebookSetup }],
    checks: ["답변에 근거자료가 언급되나요?", "자료에 없는 내용은 추정하지 않나요?", "업무 절차와 주의사항이 분리되나요?"],
    trouble: ["fileIssue", "verify"]
  },
  {
    id: "minutes",
    title: "학운위 회의록 자동 작성",
    category: "문서작성",
    pages: "강의안 90~103쪽",
    time: "15분",
    level: "보통",
    tool: "Gemini 권장",
    privacy: true,
    description: "녹취 스크립트와 등록부를 업로드해 정식 회의록과 홈페이지 게시용 회의록을 만듭니다.",
    materials: [
      { label: "녹취 스크립트 TXT", path: "강의실습자료/01 학운위 회의록 실습/12회 학운위 녹음_마스킹.txt", type: "TXT" },
      { label: "등록부 PDF", path: "강의실습자료/01 학운위 회의록 실습/제12회 학교운영위원회 등록부.pdf", type: "PDF" },
      { label: "회의록 참고 양식", path: "강의실습자료/01 학운위 회의록 실습/학교운영위원회 임시회의록(양식참고용).pdf", type: "PDF" },
      { label: "안건 목록", path: "강의실습자료/01 학운위 회의록 실습/학교운영위원회 심의안건 목록.hwpx", type: "HWPX" }
    ],
    steps: ["Gemini 새 창을 엽니다.", "녹취 TXT, 등록부 PDF, 회의록 양식, 안건 목록을 업로드합니다.", "메인 프롬프트를 복사해 붙여넣습니다.", "정식 회의록과 홈페이지 게시용 회의록을 확인합니다.", "검증 프롬프트로 개인정보와 안건 순서를 다시 점검합니다."],
    prompts: [
      { title: "회의록 생성 메인 프롬프트", path: "강의실습자료/01 학운위 회의록 실습/회의록_생성_프롬프트.md" },
      { title: "회의록 재검증 프롬프트", text: helperPrompts.verify }
    ],
    checks: ["파일 점검 결과가 먼저 나오나요?", "정식 회의록과 홈페이지 게시용 회의록이 모두 나오나요?", "게시용에서 실명과 연락처가 마스킹되었나요?", "확인 필요 항목이 따로 정리되나요?"],
    trouble: ["fileIssue", "privacy", "verify", "shorten"]
  },
  {
    id: "budget-summary",
    title: "추경예산안 요약",
    category: "예산",
    pages: "실습자료 02",
    time: "12분",
    level: "보통",
    tool: "Gemini 권장",
    description: "추경예산안 PDF를 분석해 학교운영위원회 심의용 요약서를 만듭니다.",
    materials: [
      { label: "추경예산안 PDF", path: "강의실습자료/02 추경안 요약 실습/2026학년도 송곡초등학교회계 세입세출 1차추경예산(안).pdf", type: "PDF" },
      { label: "요약 양식 HWPX", path: "강의실습자료/02 추경안 요약 실습/양식.hwpx", type: "HWPX" }
    ],
    steps: ["Gemini 새 창을 엽니다.", "추경예산안 PDF를 업로드합니다.", "메인 프롬프트를 복사해 붙여넣습니다.", "예산규모 표의 기정, 금회, 소계가 맞는지 확인합니다.", "주요사항 표의 증감 방향을 검증합니다."],
    prompts: [{ title: "추경예산안 요약 프롬프트", path: "강의실습자료/02 추경안 요약 실습/추경예산안_요약_자동작성_프롬프트.md" }],
    checks: ["금액은 천원 단위와 콤마로 표시되나요?", "세입 소계와 세출 소계가 일치하나요?", "과부족액이 올바른가요?", "감액과 증액 방향이 뒤바뀌지 않았나요?"],
    trouble: ["fileIssue", "tableBroken", "verify"]
  },
  {
    id: "budget-request",
    title: "예산신청서 작성",
    category: "예산",
    pages: "강의안 71~75쪽, 실습자료 03",
    time: "10분",
    level: "쉬움",
    tool: "Gemini 권장",
    description: "견적서와 참고 신청서를 바탕으로 소규모 교육환경개선사업 신청서를 작성합니다.",
    materials: [
      { label: "참고신청서 PDF", path: "강의실습자료/03 예산신청서 작성/참고신청서.pdf", type: "PDF" },
      { label: "복도 개선공사 견적서", path: "강의실습자료/03 예산신청서 작성/복도 개선공사 내역서(견적).pdf", type: "PDF" },
      { label: "신청서 양식", path: "강의실습자료/03 예산신청서 작성/소규모교육환경개선사업 신청서(학교명).hwpx", type: "HWPX" }
    ],
    steps: ["Gemini 새 창을 엽니다.", "참고신청서와 견적서를 업로드합니다.", "아래 프롬프트를 복사해 붙여넣습니다.", "산출기초와 필요성 문구가 견적서 근거와 맞는지 확인합니다."],
    prompts: [{ title: "예산신청서 작성 프롬프트", text: inlinePrompts.budgetRequest }],
    checks: ["기존 양식의 번호와 문체를 유지하나요?", "견적서 금액을 임의로 바꾸지 않았나요?", "사업 필요성과 기대효과가 분명한가요?"],
    trouble: ["fileIssue", "verify", "shorten"]
  },
  {
    id: "ocr-items",
    title: "영수증 OCR 물품내역",
    category: "OCR",
    pages: "강의안 104~112쪽, 실습자료 04",
    time: "10분",
    level: "쉬움",
    tool: "Gemini 권장",
    description: "거래명세서 이미지를 분석해 K-에듀파인 물품내역 업로드용 표를 만듭니다.",
    materials: [
      { label: "쿠팡 거래명세서 이미지", path: "강의실습자료/04 ocr 연습/쿠팡 거래명세서.png", type: "PNG" },
      { label: "물품내역 엑셀 서식", path: "강의실습자료/04 ocr 연습/물품내역(서식).xls", type: "XLS" }
    ],
    steps: ["Gemini 새 창을 엽니다.", "거래명세서 이미지를 업로드합니다.", "개선 프롬프트를 복사해 붙여넣습니다.", "탭 구분 텍스트를 엑셀 서식에 붙여넣습니다.", "합계와 결제금액 차이가 0인지 확인합니다."],
    prompts: [
      { title: "OCR 물품내역 개선 프롬프트", path: "강의실습자료/04 ocr 연습/프롬프트_v2.md" },
      { title: "OCR 기본 프롬프트", path: "강의실습자료/04 ocr 연습/프롬프트.md" }
    ],
    checks: ["품명, 규격, 수량, 단위, 예상단가, 예상금액, 용도 순서인가요?", "배송비가 별도 행으로 분리되었나요?", "합계와 결제금액이 일치하나요?"],
    trouble: ["tableBroken", "verify", "shorten"]
  },
  {
    id: "hdd",
    title: "불용품 HDD 시리얼 정리",
    category: "OCR",
    pages: "강의안 113~117쪽, 실습자료 05",
    time: "15분",
    level: "보통",
    tool: "Gemini 권장",
    privacy: true,
    description: "본체 라벨과 HDD 사진을 촬영 순서대로 매칭해 엑셀 목록을 만듭니다.",
    materials: [
      { label: "HDD 사진 IMG_4461", path: "강의실습자료/05 불용품 정리/image/IMG_4461.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4462", path: "강의실습자료/05 불용품 정리/image/IMG_4462.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4463", path: "강의실습자료/05 불용품 정리/image/IMG_4463.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4464", path: "강의실습자료/05 불용품 정리/image/IMG_4464.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4465", path: "강의실습자료/05 불용품 정리/image/IMG_4465.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4466", path: "강의실습자료/05 불용품 정리/image/IMG_4466.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4467", path: "강의실습자료/05 불용품 정리/image/IMG_4467.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4468", path: "강의실습자료/05 불용품 정리/image/IMG_4468.JPG", type: "JPG" },
      { label: "HDD 사진 IMG_4469", path: "강의실습자료/05 불용품 정리/image/IMG_4469.JPG", type: "JPG" }
    ],
    steps: ["Gemini 새 창을 엽니다.", "사진을 촬영 순서대로 업로드합니다.", "HDD 시리얼 정리 프롬프트를 복사합니다.", "라벨 1개당 HDD 1~2개로 매칭되는지 확인합니다.", "판독 실패와 중복 시리얼 경고를 확인합니다."],
    prompts: [{ title: "HDD 시리얼 정리 프롬프트", path: "강의실습자료/05 불용품 정리/하드디스크_시리얼정리_프롬프트.md" }],
    checks: ["촬영 순서가 먼저 표로 정리되나요?", "본체 라벨과 시리얼이 1:N으로 매칭되나요?", "판독 실패와 HDD 누락이 경고로 표시되나요?"],
    trouble: ["fileIssue", "verify", "privacy"]
  },
  {
    id: "spreadsheet",
    title: "엑셀/구글 협업 자동화",
    category: "자동화",
    pages: "강의안 118~143쪽",
    time: "12분",
    level: "보통",
    tool: "Gemini/Google",
    privacy: true,
    description: "엑셀 정리, 구글폼 취합, 공동 문서 작업을 AI와 함께 설계합니다.",
    materials: [lectureMaterial()],
    steps: ["업무에 사용하는 엑셀 또는 취합 양식을 준비합니다.", "개인정보가 있으면 마스킹 샘플로 바꿉니다.", "아래 프롬프트를 복사해 자동화 가능성을 점검합니다.", "필요한 수식, 시트 구조, 검증 방법을 따라 적용합니다."],
    prompts: [{ title: "엑셀 자동화 점검 프롬프트", text: inlinePrompts.spreadsheetHelp }],
    checks: ["중복, 누락, 수식화 가능 항목이 구분되나요?", "개인정보 업로드 위험을 줄였나요?", "따라 할 수 있는 절차가 나오나요?"],
    trouble: ["privacy", "verify", "shorten"]
  },
  {
    id: "facility",
    title: "시설자료/도면 활용",
    category: "문서작성",
    pages: "강의안 144~150쪽",
    time: "10분",
    level: "보통",
    tool: "NotebookLM/Gemini",
    description: "도면 PDF나 시설자료를 근거로 공간, 설비, 공사 범위를 정리합니다.",
    materials: [lectureMaterial()],
    steps: ["도면 또는 시설 관련 PDF를 준비합니다.", "NotebookLM 또는 Gemini에 파일을 업로드합니다.", "아래 프롬프트를 복사해 표 정리를 요청합니다.", "확인 필요 항목을 현장 자료와 대조합니다."],
    prompts: [{ title: "시설자료 분석 프롬프트", text: inlinePrompts.facilityData }],
    checks: ["도면 근거와 확인 필요 항목이 분리되나요?", "공간명, 층, 설비, 공사 범위가 표로 나오나요?", "추정 내용을 사실처럼 쓰지 않나요?"],
    trouble: ["fileIssue", "verify", "shorten"]
  }
];

const categories = ["전체", ...Array.from(new Set(practices.map((item) => item.category)))];
let state = {
  selectedId: location.hash ? location.hash.replace("#", "") : practices[0].id,
  filter: "전체",
  search: "",
  promptCache: new Map(),
  expandedCards: new Set(),
  done: new Set(JSON.parse(localStorage.getItem("exerciseai.done") || "[]"))
};

const els = {
  programTitle: document.querySelector("#programTitle"),
  appTitle: document.querySelector("#appTitle"),
  siteDescription: document.querySelector("#siteDescription"),
  lectureDownloadLink: document.querySelector("#lectureDownloadLink"),
  search: document.querySelector("#searchInput"),
  filters: document.querySelector("#filterTabs"),
  nav: document.querySelector("#sideNav"),
  cards: document.querySelector("#cardGrid"),
  detail: document.querySelector("#detailPanel"),
  progressCount: document.querySelector("#progressCount"),
  progressBar: document.querySelector("#progressBar"),
  toast: document.querySelector("#toast")
};

function applySiteConfig() {
  document.title = siteConfig.pageTitle || `${siteConfig.programTitle} ${siteConfig.appTitle}`;
  if (els.programTitle) els.programTitle.textContent = siteConfig.programTitle;
  if (els.appTitle) els.appTitle.textContent = siteConfig.appTitle;
  if (els.siteDescription) els.siteDescription.setAttribute("content", siteConfig.description);
  if (els.lectureDownloadLink) {
    els.lectureDownloadLink.href = `./${encodedPath(siteConfig.lectureFile)}`;
    els.lectureDownloadLink.download = siteConfig.lectureFile;
    els.lectureDownloadLink.textContent = siteConfig.lectureDownloadText;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function encodedPath(path) {
  return encodeURI(path);
}

function visiblePractices() {
  const keyword = state.search.trim().toLowerCase();
  return practices.filter((item) => {
    const matchesCategory = state.filter === "전체" || item.category === state.filter;
    const haystack = `${item.title} ${item.category} ${item.description} ${item.tool}`.toLowerCase();
    return matchesCategory && (!keyword || haystack.includes(keyword));
  });
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => els.toast.classList.remove("visible"), 1800);
}

function saveDone() {
  localStorage.setItem("exerciseai.done", JSON.stringify(Array.from(state.done)));
}

function setSelected(id) {
  state.selectedId = id;
  history.replaceState(null, "", `#${id}`);
  render();
  document.querySelector("#detailPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateProgress() {
  const doneCount = state.done.size;
  els.progressCount.textContent = `${doneCount} / ${practices.length} 완료`;
  els.progressBar.style.width = `${Math.round((doneCount / practices.length) * 100)}%`;
}

function renderFilters() {
  els.filters.innerHTML = categories
    .map((category) => `<button class="filter-tab ${state.filter === category ? "active" : ""}" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`)
    .join("");
}

function renderNav(items) {
  els.nav.innerHTML = items
    .map((item) => {
      const done = state.done.has(item.id);
      return `<button class="side-link ${item.id === state.selectedId ? "active" : ""} ${done ? "done" : ""}" data-select="${item.id}">
        <span class="done-dot">${done ? "✓" : ""}</span>
        <span>${escapeHtml(item.title)}</span>
      </button>`;
    })
    .join("");
}

function cardMeta(item) {
  return `
    <div class="meta-row">
      <span class="pill blue">${escapeHtml(item.pages)}</span>
      <span class="pill">${escapeHtml(item.time)}</span>
      <span class="pill">${escapeHtml(item.level)}</span>
      <span class="pill green">${escapeHtml(item.tool)}</span>
    </div>
  `;
}

function renderCards(items) {
  if (!items.length) {
    els.cards.innerHTML = `<div class="empty-state">검색 조건에 맞는 실습이 없습니다.</div>`;
    return;
  }

  els.cards.innerHTML = items
    .map((item) => {
      const done = state.done.has(item.id);
      const expanded = state.expandedCards.has(item.id);
      return `
      <article class="practice-card ${item.id === state.selectedId ? "active" : ""} ${done ? "done" : ""}" data-card-id="${item.id}">
        <div class="practice-card-summary">
          <button class="launcher-select" data-select="${item.id}">
            <span class="done-dot">${done ? "✓" : ""}</span>
            <span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.category)} · ${escapeHtml(item.time)} · ${escapeHtml(item.tool)}</small>
            </span>
          </button>
          <div class="launcher-actions">
            ${done ? `<span class="pill green">완료</span>` : ""}
            <button class="ghost-button launcher-toggle" data-toggle-card="${item.id}" aria-expanded="${expanded ? "true" : "false"}">
              ${expanded ? "접기" : "펼치기"}
            </button>
          </div>
        </div>
        ${
          expanded
            ? `<div class="practice-card-body">
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          ${cardMeta(item)}
          <button class="button primary" data-select="${item.id}">시작하기</button>
        </div>`
            : ""
        }
      </article>
    `;
    })
    .join("");
}

function renderMaterials(item) {
  if (!item.materials?.length) return `<p>별도 준비물이 없습니다.</p>`;
  return `<div class="materials-grid">
    ${item.materials
      .map((material) => `<a class="material-link" href="./${encodedPath(material.path)}" target="_blank" rel="noreferrer">
        <strong>${escapeHtml(material.label)}</strong>
        <span>${escapeHtml(material.type)}</span>
      </a>`)
      .join("")}
  </div>`;
}

function troubleItems(item) {
  return (item.trouble || []).map((key) => ({ key, title: troubleTitle(key), text: helperPrompts[key] })).filter((entry) => entry.text);
}

function troubleTitle(key) {
  const titles = {
    fileIssue: "파일을 못 읽을 때",
    verify: "다시 검증할 때",
    shorten: "너무 길 때",
    tableBroken: "표가 깨졌을 때",
    privacy: "개인정보 확인",
    promptImprove: "프롬프트 개선"
  };
  return titles[key] || key;
}

async function getPrompt(prompt) {
  if (prompt.text) return prompt.text;
  if (!prompt.path) return "";
  if (state.promptCache.has(prompt.path)) return state.promptCache.get(prompt.path);
  const response = await fetch(`./${encodedPath(prompt.path)}`);
  if (!response.ok) throw new Error("프롬프트 파일을 불러오지 못했습니다.");
  const text = await response.text();
  state.promptCache.set(prompt.path, text);
  return text;
}

async function renderPromptPreviews(item) {
  const boxes = Array.from(document.querySelectorAll("[data-prompt-index]"));
  await Promise.all(
    boxes.map(async (box) => {
      const index = Number(box.dataset.promptIndex);
      const preview = box.querySelector(".prompt-preview");
      try {
        const text = await getPrompt(item.prompts[index]);
        preview.textContent = text.slice(0, 2200) + (text.length > 2200 ? "\n\n..." : "");
      } catch (error) {
        preview.textContent = "프롬프트 미리보기를 불러오지 못했습니다. 파일 링크를 열어 확인해 주세요.";
      }
    })
  );
}

function renderPrompts(item) {
  return `<div class="prompt-grid">
    ${item.prompts
      .map((prompt, index) => `<section class="prompt-box" data-prompt-index="${index}">
        <div class="prompt-head">
          <h4>${escapeHtml(prompt.title)}</h4>
          <div class="top-actions">
            ${prompt.path ? `<a class="ghost-button" href="./${encodedPath(prompt.path)}" target="_blank" rel="noreferrer">파일 열기</a>` : ""}
            <button class="copy-button" data-copy-prompt="${index}">복사</button>
            <button class="ghost-button" data-expand-prompt="${index}">펼치기</button>
          </div>
        </div>
        <pre class="prompt-preview">불러오는 중입니다...</pre>
      </section>`)
      .join("")}
  </div>`;
}

function renderTroubles(item) {
  const entries = troubleItems(item);
  if (!entries.length) return "";
  return `<section class="section-block">
    <h3>안 될 때 쓰는 프롬프트</h3>
    <div class="trouble-grid">
      ${entries
        .map((entry) => `<section class="trouble-box">
          <div class="trouble-head">
            <h4>${escapeHtml(entry.title)}</h4>
            <button class="copy-button" data-copy-trouble="${entry.key}">복사</button>
          </div>
        </section>`)
        .join("")}
    </div>
  </section>`;
}

function renderChecks(item) {
  return `<div class="check-list">
    ${item.checks
      .map((check, index) => `<label>
        <input type="checkbox" data-check="${item.id}.${index}" />
        <span>${escapeHtml(check)}</span>
      </label>`)
      .join("")}
  </div>`;
}

function renderDetail(item) {
  const done = state.done.has(item.id);
  els.detail.innerHTML = `
    <header class="detail-header">
      <div>
        <p class="eyebrow">${escapeHtml(item.category)} · ${escapeHtml(item.pages)} · ${escapeHtml(item.time)} · ${escapeHtml(item.tool)}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p>${escapeHtml(item.description)}</p>
      </div>
      <div class="detail-actions">
        <button class="button ${done ? "complete" : ""}" data-toggle-done="${item.id}">${done ? "완료 해제" : "실습 완료"}</button>
        <a class="button" href="${GEMINI_URL}" target="_blank" rel="noreferrer">Gemini 새 창</a>
        <a class="button" href="${NOTEBOOK_URL}" target="_blank" rel="noreferrer">NotebookLM 새 창</a>
      </div>
    </header>
    <div class="detail-body">
      <div>
        <section class="section-block">
          <h3>준비물</h3>
          ${renderMaterials(item)}
        </section>
        <section class="section-block">
          <h3>실행 순서</h3>
          <ol class="steps">
            ${item.steps.map((step, index) => `<li><span class="step-number">${index + 1}</span><span>${escapeHtml(step)}</span></li>`).join("")}
          </ol>
        </section>
        <section class="section-block">
          <h3>복사할 프롬프트</h3>
          ${renderPrompts(item)}
        </section>
        ${renderTroubles(item)}
      </div>
      <aside>
        <section class="tool-panel">
          <h3>AI 작업창</h3>
          <p>Gemini와 NotebookLM은 보안상 이 사이트 안에 직접 넣지 않고 새 창으로 엽니다. 화면을 좌우로 나눠 사용하면 가장 편합니다.</p>
          <div class="tool-buttons">
            <a class="button primary" href="${GEMINI_URL}" target="_blank" rel="noreferrer">Gemini 열기</a>
            <a class="button" href="${NOTEBOOK_URL}" target="_blank" rel="noreferrer">NotebookLM 열기</a>
          </div>
        </section>
        ${item.privacy ? `<section class="section-block privacy-note">개인정보가 들어간 실제 자료는 수강 실습 전에 마스킹하거나 샘플 자료로 바꿔 사용하세요.</section>` : ""}
        <section class="check-panel">
          <h3>결과 확인</h3>
          <p>AI 결과가 아래 기준을 통과하는지 확인하세요.</p>
          ${renderChecks(item)}
        </section>
      </aside>
    </div>
  `;
  renderPromptPreviews(item);
}

async function copyText(text, label = "복사했습니다.") {
  await navigator.clipboard.writeText(text);
  showToast(label);
}

async function handleCopyPrompt(item, index) {
  try {
    const text = await getPrompt(item.prompts[index]);
    await copyText(text, "프롬프트를 복사했습니다.");
  } catch (error) {
    showToast("프롬프트를 불러오지 못했습니다.");
  }
}

function bindEvents(currentItem) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      render();
    });
  });

  document.querySelectorAll("[data-select]").forEach((button) => {
    button.addEventListener("click", () => setSelected(button.dataset.select));
  });

  document.querySelectorAll("[data-toggle-card]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.toggleCard;
      if (state.expandedCards.has(id)) state.expandedCards.delete(id);
      else state.expandedCards.add(id);
      render();
    });
  });

  document.querySelectorAll("[data-copy-prompt]").forEach((button) => {
    button.addEventListener("click", () => handleCopyPrompt(currentItem, Number(button.dataset.copyPrompt)));
  });

  document.querySelectorAll("[data-expand-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      const box = button.closest(".prompt-box");
      const preview = box.querySelector(".prompt-preview");
      preview.classList.toggle("expanded");
      button.textContent = preview.classList.contains("expanded") ? "접기" : "펼치기";
    });
  });

  document.querySelectorAll("[data-copy-trouble]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.copyTrouble;
      copyText(helperPrompts[key], "오류 대응 프롬프트를 복사했습니다.");
    });
  });

  document.querySelectorAll("[data-toggle-done]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.toggleDone;
      if (state.done.has(id)) state.done.delete(id);
      else state.done.add(id);
      saveDone();
      render();
    });
  });
}

function render() {
  const items = visiblePractices();
  const selected = practices.find((item) => item.id === state.selectedId) || items[0] || practices[0];
  state.selectedId = selected.id;

  renderFilters();
  renderNav(items);
  renderCards(items);
  renderDetail(selected);
  updateProgress();
  bindEvents(selected);
}

els.search.addEventListener("input", (event) => {
  state.search = event.target.value;
  render();
});

window.addEventListener("hashchange", () => {
  const id = location.hash.replace("#", "");
  if (practices.some((item) => item.id === id)) {
    state.selectedId = id;
    render();
  }
});

applySiteConfig();
render();
