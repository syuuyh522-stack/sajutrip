# 사주트립 (SajuTrip)

> 2026 관광데이터 활용 공모전 ②-2 웹·앱 구현 부문 출품작.
> 외국인 관광객의 성별·생년월일만으로 사주(오행) 프로필을 산출하고,
> "부족한 기운을 곁에 두는 한국 여행"으로 관광객을 지방으로 분산시키는 웹 서비스.

- **라이브**: https://sajutrip.vercel.app (기본 영어, ko 전환 가능)
- **플로우**: F-1 입력 → F-2 사주 결과 → F-3 추천 탐색 → F-4 상세(PDP) → F-5 일정 → 여행 후 공유 카드
- **실시간 API**: KASI 음양력(사주 산출) + TourAPI 6종(웰니스·국문/영문 관광·두루누비·연관관광지·축제)

## 개발

```bash
npm install
cp .env.example .env.local   # 키 입력 (공공데이터포털)
npm run dev                  # localhost:3000
```

## 문서

- 개발 가이드·스펙 정본: [CLAUDE.md](./CLAUDE.md) (충돌 시 최신 Notion PRD 우선)
- 디자인 시스템: [docs/design-system.md](./docs/design-system.md) + `app/styles/design-tokens.css`
- PO 체크포인트: [PO-체크포인트.md](./PO-체크포인트.md)
- 공모전 공고·지정과제 원문: `context/`

종료된 기획 과정 문서와 디자인 산출물 사본(`[삭제]/`, `files/`, 루트 기획 HTML)은 정리했다. 필요하면 git 히스토리에서 꺼낸다.
