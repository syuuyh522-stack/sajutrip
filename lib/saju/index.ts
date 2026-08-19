// 사주 산출 오케스트레이션 (시주 제외). (CLAUDE.md §5.2)
//
// 소스 전략:
//  - 연주(세차): 입춘 기준 자체 산출 (KASI 세차는 음력설 기준이라 어긋날 수 있음).
//  - 월주: 절기(태양황경) 자체 산출 — KASI 24절기 API 연도 제한(2000~) 우회.
//  - 일주(일진): KASI 실시간 1차(공모전 요건), 실패 시 자체계산 fallback.
import type { SajuProfile, SajuResult } from '../../types/saju';
import { computeSajuLocal } from './local';
import { elementDistribution, deficientElement, excessElement } from './distribution';
import { fetchLunInfo } from './kasi';

export { computeSajuLocal } from './local';

export interface ComputeOptions {
  /** false면 KASI 호출 없이 전부 자체계산 (테스트/오프라인) */
  useKasi?: boolean;
}

export async function computeSaju(
  year: number,
  month: number,
  day: number,
  opts: ComputeOptions = {},
): Promise<SajuResult> {
  const local = computeSajuLocal(year, month, day);
  if (opts.useKasi === false) return local;

  try {
    const kasi = await fetchLunInfo(year, month, day);
    // 일주만 KASI 일진으로 교체 후 분포 재산출 (일주 오행이 바뀔 수 있음)
    const profile: SajuProfile = { ...local.profile, day: kasi.iljin };
    const distribution = elementDistribution(profile);
    return {
      profile,
      distribution,
      deficient: deficientElement(distribution),
      excess: excessElement(distribution),
    };
  } catch {
    return local; // KASI 실패 시 자체계산 fallback
  }
}
