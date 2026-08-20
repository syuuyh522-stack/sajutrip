// TourAPI 웰니스 테마코드(wellnessThemaCd) → 오행. 실데이터 169건의 코드 분포로 도출(§4).
// 이름 키워드보다 정확·미태깅 0. 코드 의미는 샘플명 기반 추정 — 필요 시 curate(§6.6).
import type { Element } from '../types/saju';

export const WELLNESS_THEMA_ELEMENT: Record<string, Element> = {
  EX050100: 'water', // 온천·스파·해수 (93)
  EX050200: 'fire', //  찜질·불가마·사우나 (22)
  EX050300: 'metal', // 한방·약령 (6)
  EX050400: 'metal', // 힐링·명상 센터 (10)
  EX050500: 'water', // 스파·뷰티 (11)
  EX050600: 'wood', //  치유의 숲 (24)
  EX050700: 'wood', //  자연·생태·해양치유 (3)
};
