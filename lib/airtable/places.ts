// 장소 조회 — Airtable에서 오행 매칭 후보를 가져와 Place로 정제 (§5.4).
import type { Element } from '../../types/saju';
import type { Place } from '../../types/place';
import { AIRTABLE_TABLE_PLACES, PLACE_FIELDS } from '../../config/airtable';
import { airtableSelect, type AirtableRecord } from './client';

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}
function num(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
function el(v: unknown): Element | undefined {
  return v === 'wood' || v === 'fire' || v === 'earth' || v === 'water' || v === 'metal' ? v : undefined;
}

function toPlace(rec: AirtableRecord): Place {
  const f = rec.fields;
  const F = PLACE_FIELDS;
  return {
    contentId: String(f[F.contentId] ?? rec.id),
    name: str(f[F.name]) ?? '',
    region: str(f[F.address]) ?? '',
    regionCode: str(f[F.regionCode]),
    signguCode: str(f[F.signguCode]),
    category: str(f[F.category]),
    image: str(f[F.image]),
    mapX: num(f[F.mapX]),
    mapY: num(f[F.mapY]),
    tel: str(f[F.tel]),
    attributeElement: el(f[F.attributeElement]),
    actionElement: el(f[F.actionElement]),
    primaryElement: el(f[F.primaryElement]),
  };
}

/**
 * 타깃 오행(결핍·과잉)에 매칭되는 장소.
 * primary_element 우선, attribute/action 레이어도 후보 포함 (§5.4).
 */
export async function fetchPlacesByElement(element: Element, max = 50): Promise<Place[]> {
  const F = PLACE_FIELDS;
  const filterByFormula = `OR({${F.primaryElement}}='${element}',{${F.attributeElement}}='${element}',{${F.actionElement}}='${element}')`;
  const records = await airtableSelect(AIRTABLE_TABLE_PLACES, {
    filterByFormula,
    pageSize: String(Math.min(max, 100)),
    maxRecords: String(max),
  });
  return records.map(toPlace);
}

export async function fetchPlaceById(contentId: string): Promise<Place | null> {
  const records = await airtableSelect(AIRTABLE_TABLE_PLACES, {
    filterByFormula: `{${PLACE_FIELDS.contentId}}='${contentId}'`,
    maxRecords: '1',
  });
  return records[0] ? toPlace(records[0]) : null;
}
