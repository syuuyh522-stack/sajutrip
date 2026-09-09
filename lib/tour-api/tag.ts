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

// ── 레이어 매칭 (PRD F-2 3·4단계, CLAUDE.md §5.4) ────────────────────────────
// 오행-장소 매핑은 단일 기준이 아니라 두 레이어를 겹쳐 추천 다양성을 만든다.
//  · 속성(attribute): 그 공간이 무엇인가 — 산=木, 온천/계곡=水, 찜질방=火, 갯벌/도예=土, 사찰/공방=金
//  · 행위(action):   거기서 무엇을 하는가 — 걷기=木, 담그기=水, 두드리기=金
// primary는 기존 산출(강한 신호 → 테마코드 → 이름)을 유지하고, 비면 속성/행위로 보충한다.

/** 속성 레이어 — 공간의 성격 */
const ATTRIBUTE_RULES: ReadonlyArray<readonly [Element, readonly string[]]> = [
  ['earth', ['갯벌', '머드', '황토', '도예', '도자', '옹기', '소금', '동굴', '진흙', '광천', '약돌', '옥돌', '게르마늄', '토굴']],
  ['fire', ['찜질', '불가마', '한증', '사우나', '가마', '온돌', '화덕', '숯']],
  ['metal', ['사찰', '템플', '암자', '선원', '공방', '공예', '한방', '한의', '약령', '본초', '침', '뜸', '기공', '단전', '명상', '요가']],
  ['wood', ['숲', '산림', '수목', '휴양림', '자연휴양', '둘레길', '트레킹', '편백', '정원', '생태', '탐방', '다원', '녹차', '약초', '허브', '수목원', '산책로']],
  ['water', ['온천', '스파', '워터', '해수', '해양', '계곡', '약수', '아쿠아', '물놀이', '족욕', '유황', '원탕', '바스', '온수', '냉천', '해변', '해수욕', '호수', '폭포']],
];

/** 행위 레이어 — 그 장소에서 하는 동작 */
const ACTION_RULES: ReadonlyArray<readonly [Element, readonly string[]]> = [
  ['water', ['담그', '입욕', '목욕', '족욕', '수영', '물놀이', '해수욕', '탕']],
  ['wood', ['걷기', '산책', '트레킹', '등산', '둘레', '탐방', '숲길', '산림욕', '삼림욕']],
  ['fire', ['찜질', '한증', '구이', '굽기', '땀']],
  ['earth', ['빚기', '만들기', '체험', '캐기', '밟기', '도예']],
  ['metal', ['명상', '수행', '타종', '두드리', '공예', '다도', '요가', '침술']],
];

function matchRules(name: string, rules: ReadonlyArray<readonly [Element, readonly string[]]>): Element | undefined {
  for (const [element, kws] of rules) {
    if (kws.some((k) => name.includes(k))) return element;
  }
  return undefined;
}

export interface ElementLayers {
  /** 속성 레이어 */
  attribute?: Element;
  /** 행위 레이어 */
  action?: Element;
  /** 종합 산출값 — 강한 신호 → 테마코드 → 이름 → 속성 → 행위 */
  primary?: Element;
}

/** 장소 하나의 오행 3필드를 한 번에 산출 (PRD F-2 3·4단계) */
export function tagLayers(name: string, themaCode?: string): ElementLayers {
  const attribute = matchRules(name, ATTRIBUTE_RULES);
  const action = matchRules(name, ACTION_RULES);
  return { attribute, action, primary: tagElement(name, themaCode) ?? attribute ?? action };
}
