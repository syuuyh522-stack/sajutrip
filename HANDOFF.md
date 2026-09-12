# HANDOFF — 사주트립 개발 환경 세팅 (CLAUDE.md 작성)

> 회사 컴퓨터에서 개인 컴퓨터로 작업을 옮기기 위한 인수인계 문서.
> 새 환경에서 이 파일 경로만 주고 대화를 시작하면 이어서 작업 가능.
> 작성일: 2026-08-17

## 목표
저장소 루트에 올릴 **CLAUDE.md**(프로젝트 개발 가이드)를 PRD 기반으로 작성하고,
git 저장소를 초기화해 GitHub(`github.com/syuuyh522-stack/sajutrip`)에 올리는 것.

## 진행 상황 (완료)
- **CLAUDE.md 작성 완료** — 근거: [PRD] 사주트립(Notion) + WBS. 구성:
  1. 프로젝트 개요 (범위·공모전 제약)
  2. 기술 스택
  3. 외부 API
  4. 도메인 모델 (용어 통일)
  5. 추천 로직 (F-3) — PRD 공란이던 부분, 이번에 확정
  6. 코딩 규칙
  7. 폴더 구조
  8. 목표 지표 — PRD 공란이던 부분, 이번에 확정
  9. 확정 대기 항목
- **git 저장소 초기화 완료** — 커밋 2개, 브랜치 `main`, 로컬 아이덴티티 `sonya <sonya@gccompany.co.kr>`
  - `2400441` chore: 저장소 초기화 및 CLAUDE.md 추가
  - `acd14d6` docs: 사주 산출 방침 명확화 (WBS 반영)
- **`.gitignore` 작성** — `.env*`(단 `.env.example`은 허용), `node_modules/`, `.next/`, `.DS_Store`, `.bkit/` 제외
- 원격 연결: `origin = https://github.com/syuuyh522-stack/sajutrip.git`

## 이번 세션에서 내린 결정 (CLAUDE.md에 반영됨)
- **아키텍처**: Next.js(App Router) 풀스택 단일 앱 — Vercel 네이티브라 별도 백엔드 서버 불필요. 외부 API·Airtable 호출은 서버 사이드에서만 → 키 보호 자동 해결.
- **언어**: TypeScript 통일(프론트·백엔드), strict, `any` 금지.
- **DB**: Airtable (장소 데이터 + 유저/회원 데이터 모두).
- **회원가입**: scope-in 확정. 유저 데이터(성별·생년월일·사주결과·일정·엘레먼트)를 Airtable에 저장.
- **캐싱**: PRD의 "전역 메모리 캐싱"은 Vercel 서버리스와 안 맞음 → Next.js 데이터 캐시(`unstable_cache`/`revalidate`)로 대체. 실시간 호출이 기본값이고, 캐시를 쓰려면 `REALTIME_API_MODE=false`로 명시적으로 꺼야 함.
- **추천 로직 타깃 오행**: **결핍 + 과잉 둘 다** (5.3). F-5 일정 pre-fill은 결핍 원소.
- **카피 프레임**: **공명·어울림 중심** (5.8). "효과 검증"이 아닌 문화적 해석 톤.
- **North Star 지표**: **지방 포함 완성 일정 수** (미션형, 8.1). 목표 수치는 론칭 후 TBD.
- **사주 산출**: 참조 기준표(천간·지지·24절기·오행 매핑)는 자체 구축, 실제 날짜→간지 산출은 KASI 실시간 호출 (5.2). WBS "외부 API X" 메모는 *기준표 자체 구축* 의미로 확정.

## 막힌 것 (다음 환경에서 해결)
- **GitHub push 차단** — 회사 네트워크/관리 기기의 DLP가 외부 GitHub로의 push(`git-receive-pack`)를 가로채 403 반환 (`remote: This Message is created for test`).
  - 저장된 git 자격증명은 사내 GitLab(`gitlab-ce.abouthere.kr`)용뿐, github.com용 없음.
  - **개인 컴퓨터(비관리 네트워크)에서 push하면 해결될 것.** 필요 시 GitHub PAT(repo 권한) 또는 SSH 키 등록.

## 다음 단계 (개인 컴퓨터에서)
1. 이 저장소를 개인 컴퓨터로 옮긴다 (또는 GitHub push 후 clone).
2. `git push -u origin main` 실행 → 인증(PAT 또는 SSH).
   - 저장소는 **private** 권장 (API 키·내부 로직·데이터 노출 방지).
3. **커밋에 포함된 민감 파일 점검** — `[사주트립] api 원천 데이터.xlsx`가 현재 추적 중.
   외부(특히 public) 저장소에 올릴 거면 `git rm --cached`로 제외 검토 필요.
4. (선택) CLAUDE.md 9장 **확정 대기 항목** 채우기:
   - 스타일링 스택 (Tailwind 등, 8/12 미팅 결정)
   - 검색 UX 도입 여부 (F-5 P1)
   - 목표 지표 구체 수치 (론칭 후 베이스라인 확보 후)

## 참고
- PRD: https://app.notion.com/p/3b052b61354c804cb62be7a5daae69d5
- 저장소 경로(회사 컴퓨터): `~/Desktop/code-with-claude/brain/project5_관광콘텐츠랩`
- 회사 정책 확인 필요: 이 프로젝트가 회사 자산이면 외부 GitHub 반출이 공모전/정보보안 규정상 허용되는지 확인.
