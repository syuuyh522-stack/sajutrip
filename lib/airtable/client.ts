// Airtable REST 클라이언트 — 서버 사이드 전용 (§6.1).
// fetch 기반이라 Next 데이터 캐시(revalidate)와 통합 용이(§6.5). 배치성 데이터는 긴 revalidate,
// 심사 실시간 모드(REALTIME_API_MODE=true)면 캐시 우회.

const AIRTABLE_API = 'https://api.airtable.com/v0';

export interface AirtableRecord<T = Record<string, unknown>> {
  id: string;
  fields: T;
}

interface SelectResponse<T> {
  records: AirtableRecord<T>[];
  offset?: string;
}

/** 배치성 데이터 기본 revalidate (초). 심사 실시간 모드면 무시하고 no-store. */
const BATCH_REVALIDATE = 60 * 60 * 12; // 12h

export async function airtableSelect<T = Record<string, unknown>>(
  table: string,
  params: Record<string, string> = {},
): Promise<AirtableRecord<T>[]> {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) throw new Error('Airtable env 미설정 (AIRTABLE_TOKEN / AIRTABLE_BASE_ID)');

  const realtime = process.env.REALTIME_API_MODE === 'true';
  const records: AirtableRecord<T>[] = [];
  let offset: string | undefined;

  do {
    const qs = new URLSearchParams({ ...params, ...(offset ? { offset } : {}) });
    const res = await fetch(`${AIRTABLE_API}/${baseId}/${encodeURIComponent(table)}?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
      ...(realtime ? { cache: 'no-store' } : { next: { revalidate: BATCH_REVALIDATE } }),
    });
    if (!res.ok) throw new Error(`Airtable ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as SelectResponse<T>;
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}
