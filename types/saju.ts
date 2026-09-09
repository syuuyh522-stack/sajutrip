// 사주 도메인 타입 (단일 정의). 근거: CLAUDE.md §4 도메인 모델, §5.2 산출.
// 화면·lib·config 어디서든 이 타입만 재사용한다(§6.2).
// 시주(時柱)는 제외 — 태어난 시간 미입력. 정밀 산출은 P2 유료 리포트에서만.

/** 오행 五行 — enum이 아닌 유니온으로 고정 (§4) */
export type Element = 'wood' | 'fire' | 'earth' | 'water' | 'metal';

/** 천간 天干 10 (갑을병정무기경신임계) */
export const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
/** 지지 地支 12 (자축인묘진사오미신유술해) */
export const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];
export type YinYang = 'yang' | 'yin';

/** 간지 = 천간 + 지지 (하나의 기둥) */
export interface Pillar {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
}

/** 사주 프로필 = 연주·월주·일주 (+ 시간을 아는 경우 시주) */
export interface SajuProfile {
  /** 연주(세차) — KASI 음양력정보. 경계는 입춘 */
  year: Pillar;
  /** 월주(월건) — KASI 24절기로 節 판정 + 월두법 */
  month: Pillar;
  /** 일주(일진) — KASI 음양력정보. 그대로 사용 */
  day: Pillar;
  /** 시주(오자시두법) — 태어난 시각을 아는 경우에만 (date-based 리딩은 미포함) */
  hour?: Pillar;
}

/** 오행 분포 — 글자 수 카운트. 시간 미상=6글자(합 6), 시간 포함=8글자(합 8) (§5.2) */
export type ElementDistribution = Record<Element, number>;

/** 음력 생년월일 (KASI 음양력 변환 결과, PRD F-1 1단계) */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  /** 윤달 여부 */
  leap: boolean;
}

/** 산출 결과 — 타깃 오행은 결핍+과잉 둘 다 (§5.3) */
export interface SajuResult {
  profile: SajuProfile;
  distribution: ElementDistribution;
  /**
   * 일주를 어디서 얻었는지 — 'kasi'는 실시간 호출 성공, 'local'은 자체계산 폴백.
   * 심사 기간에 KASI 장애가 조용히 묻히지 않도록 응답에 실어 보낸다.
   */
  source: 'kasi' | 'local';
  /** KASI 음양력 변환 결과. 폴백 시에는 없다 */
  lunar?: LunarDate;
  /** 최다 결핍 — F-5 일정 pre-fill 값(수정 불가) */
  deficient: Element;
  /** 최다 과잉 — F-3 탐색에서 함께 노출 */
  excess: Element;
}
