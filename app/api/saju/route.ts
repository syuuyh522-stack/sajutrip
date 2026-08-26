// F-2 사주 산출 BFF. 외부 API(KASI)·계산은 서버 사이드에서만 (§6.1).
// 실시간 산출이므로 캐시 없음 (§6.5).
import { NextResponse } from 'next/server';
import { computeSaju } from '../../../lib/saju';
import { findSoulmate, findTwin } from '../../../lib/saju/kstar';
import { attachImages } from '../../../lib/saju/kstar-image';
import { KSTARS } from '../../../config/kstars';

export const dynamic = 'force-dynamic';

const WIKI_BY_NAME = new Map(KSTARS.filter((s) => s.wiki).map((s) => [s.name, s.wiki as string]));


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get('year'));
  const month = Number(searchParams.get('month'));
  const day = Number(searchParams.get('day'));
  const gender = searchParams.get('gender'); // female | male (전통 계산 입력)
  // 태어난 시각(0~23, 선택) — 있으면 시주 포함 8글자, 없으면 date-based 6글자 (§7.2)
  const hourRaw = searchParams.get('hour');
  const hour = hourRaw === null || hourRaw === '' ? undefined : Number(hourRaw);
  if (hour !== undefined && (!Number.isInteger(hour) || hour < 0 || hour > 23)) {
    return NextResponse.json({ error: 'invalid_hour' }, { status: 400 });
  }

  if (!isValidDate(year, month, day)) {
    return NextResponse.json({ error: 'invalid_date' }, { status: 400 });
  }

  try {
    const result = await computeSaju(year, month, day, { hour });
    const top = [findSoulmate(result, KSTARS), findTwin(result, KSTARS)].filter((m) => m !== null);
    const withImg = await attachImages(top, WIKI_BY_NAME);
    const kstar = {
      soulmate: withImg[0] ?? null, // 궁합 랭킹 1위 (더보기의 1위와 동일)
      twin: withImg[1] ?? null, // 같은 기운 랭킹 1위
    };
    // 클라이언트로는 정제된 결과만 전달 (원본 키/내부 필드 노출 금지, §6.1)
    return NextResponse.json({ gender, birth: { year, month, day, hour: hour ?? null }, ...result, kstar });
  } catch {
    return NextResponse.json({ error: 'compute_failed' }, { status: 502 });
  }
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
