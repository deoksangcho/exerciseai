# 수원 역량강화 AI 실습실

수원교육지원청 지방공무원 역량강화 연수용 AI 실습 프롬프트 런처입니다.

## 배포 URL

- Vercel: https://exercise-ashen.vercel.app
- GitHub: https://github.com/deoksangcho/exerciseai

## 사용 방법

1. 왼쪽에서 실습을 선택합니다.
2. 준비물 파일을 확인합니다.
3. Gemini 또는 NotebookLM을 새 창으로 엽니다.
4. 프롬프트를 복사해 AI 작업창에 붙여넣습니다.
5. 결과 확인 체크리스트로 검증합니다.

## 연수명 변경

좌상단 연수명과 브라우저 제목은 `assets/site-config.js`에서 수정합니다.

```js
window.EXERCISE_AI_SITE_CONFIG = {
  programTitle: "새 연수명",
  appTitle: "AI 실습실",
  pageTitle: "새 연수명 AI 실습실",
  description: "새 연수명용 AI 실습 프롬프트 런처"
};
```

## 배포

정적 사이트이므로 별도 빌드 없이 Vercel에서 루트 디렉터리를 그대로 배포하면 됩니다.

```bash
vercel --prod
```

## 구성

- `index.html`: 앱 진입점
- `assets/site-config.js`: 연수명, 사이트 제목, 설명 설정
- `assets/styles.css`: 화면 스타일
- `assets/app.js`: 실습 데이터, 프롬프트 복사, 체크 상태 저장
- `강의실습자료/`: 실습용 자료와 원본 프롬프트
- `수원 역량강화(20260518).pdf`: 강의안
