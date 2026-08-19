// 장소 도메인 타입 (단일 정의). 근거: CLAUDE.md §4, TourAPI 웰니스관광정보 원본 필드.
import type { Element } from './saju';

/** 서버에서 Airtable → 정제해 클라이언트로 내려주는 장소 (원본 내부 필드 제외, §6.1) */
export interface Place {
  contentId: string;
  name: string; // TourAPI title
  region: string; // 표시용 지역명(주소 또는 지역코드 변환)
  regionCode?: string; // lDongRegnCd (시도)
  signguCode?: string; // lDongSignguCd (시군구)
  category?: string; // wellnessThemaCd (웰니스 테마)
  image?: string; // firstimage
  mapX?: number;
  mapY?: number;
  tel?: string;
  // 오행 매핑 (Airtable에서 태깅 — 속성/행위 레이어 + 종합, §4·§5.4)
  attributeElement?: Element;
  actionElement?: Element;
  primaryElement?: Element;
}
