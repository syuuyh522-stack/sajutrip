// 사주 산출 오케스트레이션 (시주 제외). (CLAUDE.md §5.2)
//
// 소스 전략:
//  - 연주(세차): 입춘 기준 자체 산출 (KASI 세차는 음력설 기준이라 어긋날 수 있음).
//  - 월주: 절기(태양황경) 자체 산출 — KASI 24절기 API 연도 제한(2000~) 우회.
//  - 일주(일진): KASI 실시간 1차(공모전 요건), 실패 시 자체계산 fallback.
import type { LunarDate, SajuProfile, SajuResult } from '../../types/saju';
import { computeSajuLocal } from './local';
import { elementDistribution, deficientElement, excessElement } from './distribution';
import { fetchLunInfo } from './kasi';
import { hourPillar } from './hour-pillar';

export { computeSajuLocal } from './local';

export interface ComputeOptions {
  /** false면 KASI 호출 없이 전부 자체계산 (테스트/오프라인) */
  useKasi?: boolean;
  /** 태어난 시각(0~23) — 있으면 시주 포함 8글자 산출, 없으면 date-based 6글자 */
  hour?: number;
}

/** 프로필에 (있다면) 시주를 붙이고 분포·타깃 재산출 */
function finalize(
  base: SajuProfile,
  hour: number | undefined,
  source: 'kasi' | 'local',
  lunar?: LunarDate,
): SajuResult {
  const profile: SajuProfile =
    hour === undefined ? base : { ...base, hour: hourPillar(base.day.stem, hour) };
  const distribution = elementDistribution(profile);
  return {
    profile,
    distribution,
    source,
    lunar,
    deficient: deficientElement(distribution),
    excess: excessElement(distribution),
  };
}

export async function computeSaju(
  year: number,
  month: number,
  day: number,
  opts: ComputeOptions = {},
): Promise<SajuResult> {
  const local = computeSajuLocal(year, month, day);
  if (opts.useKasi === false) return finalize(local.profile, opts.hour, 'local');

  try {
    const kasi = await fetchLunInfo(year, month, day);
    // 일주만 KASI 일진으로 교체 (일주 오행이 바뀔 수 있음 — 시주도 일간 기준이라 교체 후 산출)
    return finalize({ ...local.profile, day: kasi.iljin }, opts.hour, 'kasi', kasi.lunar);
  } catch (e) {
    // 폴백은 하되 조용히 넘어가지 않는다 — 심사 기간 KASI 장애를 로그·응답(source)으로 드러낸다
    console.warn('[saju] KASI 호출 실패 → 자체계산 폴백:', e instanceof Error ? e.message : e);
    return finalize(local.profile, opts.hour, 'local');
  }
}
