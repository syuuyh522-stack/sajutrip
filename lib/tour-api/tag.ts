// 오행 자동 태깅 (§4 속성 규칙, 1차 휴리스틱). 한글 키워드 기반.
// 영문 응답도 title에 한글명이 괄호로 포함돼("AMORE Spa (아모레퍼시픽 스파)") 그대로 동작.
// ⚠️ 규칙 기반 1차값 → 실 서비스 전 curate 필요(§6.6).
import type { Element } from '../../types/saju';
import { WELLNESS_THEMA_ELEMENT } from '../../config/wellness-thema';

// 순서 중요(먼저 매칭). 속성 레이어 우선: earth/wood/fire/metal 먼저, water는 폭넓어 마지막.
const RULES: ReadonlyArray<readonly [Element, readonly string[]]> = [
  ['earth', ['갯벌', '머드', '황토', '도예', '도자', '소금', '동굴', '게르마늄', '약돌', '광천', '옥돌', '진흙']],
  ['wood', ['숲', '산림', '수목', '휴양림', '자연휴양', '둘레길', '트레킹', '편백', '정원', '생태', '탐방', '다원', '녹차', '약초', '허브']],
  ['fire', ['찜질', '사우나', '불가마', '한증', '가마']],
  ['metal', ['사찰', '템플', '명상', '요가', '한방', '한의', '본초', '침', '뜸', '기공', '단전']],
  ['water', ['온천', '스파', '워터', '해수', '해양', '계곡', '약수', '아쿠아', '물놀이', '탕', '족욕', '유황', '원탕', '스프링', '바스', '온수', '냉천', '천']],
];

export function tagByName(name: string): Element | undefined {
  for (const [element, kws] of RULES) {
    if (kws.some((k) => name.includes(k))) return element;
  }
  return undefined;
}

// 이름에 나오면 테마코드보다 우선하는 '강한' 신호 — 명백한 오분류 보정용.
// 예: fire 테마(EX050200)의 '강변스파랜드'는 이름에 '온천/스파'가 있어 실제 water.
const STRONG: ReadonlyArray<readonly [Element, readonly string[]]> = [
  ['water', ['온천', '스파', '해수', '워터', '아쿠아']],
  ['fire', ['찜질', '불가마', '한증']],
  ['wood', ['치유의숲', '수목원', '휴양림']],
];

function strongSignal(name: string): Element | undefined {
  for (const [element, kws] of STRONG) {
    if (kws.some((k) => name.includes(k))) return element;
  }
  return undefined;
}

/**
 * 오행 태깅 통합 — ① 이름의 강한 신호(오분류 보정) → ② 테마코드 → ③ 이름 키워드 fallback.
 * themaCode가 없으면(일반관광 등) 이름 기반만 사용.
 */
export function tagElement(name: string, themaCode?: string): Element | undefined {
  const strong = strongSignal(name);
  if (strong) return strong;
  if (themaCode) {
    const byCode = WELLNESS_THEMA_ELEMENT[themaCode];
    if (byCode) return byCode;
  }
  return tagByName(name);
}
