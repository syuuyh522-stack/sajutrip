// 시주(時柱) 산출 — 오자시두법(五子時遁法). 시간을 아는 경우에만 8글자 산출에 참여.
// 시지: 2시간 단위(23~01=子, 01~03=丑 …). 분 단위 경계·야자시/조자시 논쟁은 POC에서 단순화(시각만 사용, 일주 이월 없음).
import type { Pillar, HeavenlyStem } from '../../types/saju';
import { HEAVENLY_STEMS, EARTHLY_BRANCHES } from '../../types/saju';

/** 시각(0~23) → 시주. 시간 천간은 일간에서 유도: 甲·己일 → 甲子시 시작 (일간idx mod 5 * 2) */
export function hourPillar(dayStem: HeavenlyStem, hour: number): Pillar {
  const branchIdx = Math.floor(((hour + 1) % 24) / 2); // 23시~00시대 = 子(0)
  const dayIdx = HEAVENLY_STEMS.indexOf(dayStem);
  const stemIdx = ((dayIdx % 5) * 2 + branchIdx) % 10;
  return { stem: HEAVENLY_STEMS[stemIdx], branch: EARTHLY_BRANCHES[branchIdx] };
}
