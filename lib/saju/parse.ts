// KASI 간지 문자열 파서. 예: "경신(庚申)" → { stem:'庚', branch:'申' }
import type { HeavenlyStem, EarthlyBranch, Pillar } from '../../types/saju';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../../types/saju';

export function parseGanji(text: string): Pillar {
  const m = text.match(/[一-鿿]{2}/); // 괄호 안 한자 2글자
  if (!m) throw new Error(`간지 파싱 실패: "${text}"`);
  const stem = m[0][0] as HeavenlyStem;
  const branch = m[0][1] as EarthlyBranch;
  if (!HEAVENLY_STEMS.includes(stem) || !EARTHLY_BRANCHES.includes(branch)) {
    throw new Error(`알 수 없는 간지: "${m[0]}"`);
  }
  return { stem, branch };
}
