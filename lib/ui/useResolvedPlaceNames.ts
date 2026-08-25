'use client';

// 일정·찜의 장소명 로케일 재조회 — localStorage에는 담는 시점의 로케일 스냅샷이 저장되므로,
// 렌더 시 contentId로 현재 로케일 이름을 다시 찾는다(영문 데이터가 있는 장소는 언어 전환 시 이름이 따라옴).
// 못 찾으면(두루누비 등) 저장된 이름 유지 — 호출부에서 ?? 폴백.
import { useEffect, useState } from 'react';
import type { Locale } from '../../i18n/dictionaries';

export interface ResolvedName { name: string; region: string }

interface ItemRef { contentId: string; element?: string | null }

export function useResolvedPlaceNames(items: ReadonlyArray<ItemRef>, locale: Locale): Record<string, ResolvedName> {
  const [map, setMap] = useState<Record<string, ResolvedName>>({});
  const key = items.map((i) => i.contentId).join(',');

  useEffect(() => {
    if (items.length === 0) { setMap({}); return; }
    let alive = true;
    (async () => {
      const entries: Array<[string, ResolvedName]> = [];
      await Promise.all(items.map(async (it) => {
        try {
          const el = it.element ? `&element=${it.element}` : '';
          const r = await fetch(`/api/places/${it.contentId}?lang=${locale}${el}`);
          if (!r.ok) return;
          const j: { place?: { name?: string; region?: string } } = await r.json();
          if (j.place?.name) entries.push([it.contentId, { name: j.place.name, region: j.place.region ?? '' }]);
        } catch {
          // 실패 시 저장된 스냅샷 이름 유지
        }
      }));
      if (alive) setMap(Object.fromEntries(entries));
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, locale]);

  return map;
}
