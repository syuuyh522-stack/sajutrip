// 외부 API 헬스체크 — 서버 전용(§6.1). 실시간 호출(no-store)로 각 API 연결·응답 확인.
// 공모전: 주기적 호출 기록(§1) — /api/cron/ping이 이걸 호출해 로그를 남긴다.

export interface ApiCheck {
  name: string;
  ok: boolean;
  status: number;
  latencyMs: number;
  note?: string;
}

async function once(url: string, validate: (body: string) => boolean): Promise<{ ok: boolean; status: number; note?: string }> {
  const res = await fetch(url, { cache: 'no-store' });
  const body = await res.text();
  const ok = res.ok && validate(body);
  return { ok, status: res.status, note: ok ? undefined : body.slice(0, 140) };
}

// KTO 게이트웨이가 간헐적으로 단발 500을 반환함(직접 재현·재시도 시 정상) — 1회 재시도로 플래핑 흡수.
// 재시도 역시 실시간 호출이라 공모전 실시간 요건과 무관.
async function timed(name: string, url: string, validate: (body: string) => boolean): Promise<ApiCheck> {
  const start = Date.now();
  try {
    let r = await once(url, validate);
    if (!r.ok) {
      await new Promise((res) => setTimeout(res, 400));
      r = await once(url, validate);
    }
    return { name, ok: r.ok, status: r.status, latencyMs: Date.now() - start, note: r.note };
  } catch (e) {
    return { name, ok: false, status: 0, latencyMs: Date.now() - start, note: String(e).slice(0, 140) };
  }
}

function url(base: string, path: string, params: Record<string, string>): string {
  return `${base}/${path}?${new URLSearchParams(params).toString()}`;
}

const TOUR_COMMON = { MobileOS: 'ETC', MobileApp: 'sajutrip', _type: 'json', numOfRows: '1', pageNo: '1' };

/** 앱이 실제로 쓰는 외부 API를 모두 핑 */
export async function checkApis(): Promise<ApiCheck[]> {
  const kasiKey = process.env.KASI_SERVICE_KEY ?? '';
  const kasiLrsr = process.env.KASI_LRSR_BASE ?? 'https://apis.data.go.kr/B090041/openapi/service/LrsrCldInfoService';
  const kasiSpcde = process.env.KASI_SPCDE_BASE ?? 'https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService';
  const tourKey = process.env.TOURAPI_SERVICE_KEY ?? '';
  const wellness = process.env.TOURAPI_WELLNESS_BASE ?? 'https://apis.data.go.kr/B551011/WellnessTursmService';
  const kor = process.env.TOURAPI_KOR_BASE ?? 'https://apis.data.go.kr/B551011/KorService2';
  const eng = process.env.TOURAPI_ENG_BASE ?? 'https://apis.data.go.kr/B551011/EngService2';
  const durunubi = process.env.TOURAPI_DURUNUBI_BASE ?? 'https://apis.data.go.kr/B551011/Durunubi';

  const tourOk = (b: string) => b.includes('"resultCode":"0000"');

  return Promise.all([
    timed('KASI 음양력정보 (연·일주)', url(kasiLrsr, 'getLunCalInfo', { ServiceKey: kasiKey, solYear: '1996', solMonth: '07', solDay: '22', _type: 'xml' }), (b) => b.includes('<lunIljin>')),
    timed('KASI 24절기 (월주 검증)', url(kasiSpcde, 'get24DivisionsInfo', { ServiceKey: kasiKey, solYear: '2024', solMonth: '07', _type: 'xml' }), (b) => b.includes('<resultCode>00')),
    timed('TourAPI 웰니스 (국문)', url(wellness, 'areaBasedList', { serviceKey: tourKey, ...TOUR_COMMON, langDivCd: 'K' }), tourOk),
    timed('TourAPI 웰니스 (영문)', url(wellness, 'areaBasedList', { serviceKey: tourKey, ...TOUR_COMMON, langDivCd: 'ENG' }), tourOk),
    timed('TourAPI 국문 관광정보', url(kor, 'searchKeyword2', { serviceKey: tourKey, ...TOUR_COMMON, keyword: '온천' }), tourOk),
    timed('TourAPI 영문 관광정보', url(eng, 'searchKeyword2', { serviceKey: tourKey, ...TOUR_COMMON, keyword: 'temple' }), tourOk),
    timed('TourAPI 두루누비 (걷기)', url(durunubi, 'courseList', { serviceKey: tourKey, ...TOUR_COMMON }), tourOk),
  ]);
}
