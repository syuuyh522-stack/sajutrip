// KASI 음양력정보(LrsrCldInfoService) 클라이언트 — 서버 사이드 전용 (§6.1).
// 세차(연주)·일진(일주)·월건 조회. 실시간 호출(공모전 요건), 캐시 no-store.
import type { Pillar } from '../../types/saju';
import { parseGanji } from './parse';

export interface KasiLunInfo {
  /** 세차 = 연간지 (음력설 기준 — 사주 연주는 입춘 기준 별도 산출 권장) */
  secha: Pillar;
  /** 일진 = 일주 */
  iljin: Pillar;
  /** 월건 (음력 기준 — 사주 월주는 절기 기준 별도 산출) */
  wolgeon: Pillar;
  lunar: { year: number; month: number; day: number; leap: boolean };
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`));
  return m ? m[1] : '';
}

/** 양력 y-m-d의 음양력정보 조회. 실패 시 throw. */
export async function fetchLunInfo(year: number, month: number, day: number): Promise<KasiLunInfo> {
  const base = process.env.KASI_LRSR_BASE;
  const key = process.env.KASI_SERVICE_KEY;
  if (!base || !key) throw new Error('KASI env 미설정 (KASI_LRSR_BASE / KASI_SERVICE_KEY)');

  const qs = new URLSearchParams({
    ServiceKey: key, // URLSearchParams가 1회 인코딩 → data.go.kr 요구와 일치(Decoding 키 저장 전제)
    solYear: String(year),
    solMonth: String(month).padStart(2, '0'),
    solDay: String(day).padStart(2, '0'),
  });

  const res = await fetch(`${base}/getLunCalInfo?${qs.toString()}`, { cache: 'no-store' });
  const xml = await res.text();
  if (!xml.includes('<lunIljin>')) {
    throw new Error(`KASI 응답 오류: ${tag(xml, 'errMsg') || tag(xml, 'resultMsg') || 'unknown'}`);
  }

  return {
    secha: parseGanji(tag(xml, 'lunSecha')),
    iljin: parseGanji(tag(xml, 'lunIljin')),
    wolgeon: parseGanji(tag(xml, 'lunWolgeon')),
    lunar: {
      year: Number(tag(xml, 'lunYear')),
      month: Number(tag(xml, 'lunMonth')),
      day: Number(tag(xml, 'lunDay')),
      leap: tag(xml, 'lunLeapmonth') !== '평',
    },
  };
}
