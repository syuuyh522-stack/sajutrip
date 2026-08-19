// Airtable 필드/테이블 매핑 상수 (§6.2 — 원본 필드명을 코드에 흩뿌리지 않는다).
// 컬럼명은 TourAPI 웰니스관광정보 원본 필드를 따른다. 실제 베이스와 다르면 여기만 수정.

/** 테이블명 (env로 override 가능) */
export const AIRTABLE_TABLE_PLACES = process.env.AIRTABLE_TABLE_PLACES ?? 'places';
export const AIRTABLE_TABLE_KSTARS = process.env.AIRTABLE_TABLE_KSTARS ?? 'kstars';

/** places 테이블 컬럼명 매핑 (우리 키 → Airtable 컬럼) */
export const PLACE_FIELDS = {
  contentId: 'contentId',
  name: 'title',
  address: 'baseAddr',
  regionCode: 'lDongRegnCd',
  signguCode: 'lDongSignguCd',
  category: 'wellnessThemaCd',
  image: 'firstimage',
  mapX: 'mapX',
  mapY: 'mapY',
  tel: 'tel',
  // 오행 매핑 필드 — 값은 우리 Element 유니온 문자열('wood'|'fire'|'earth'|'metal'|'water')로 저장
  attributeElement: 'attribute_element',
  actionElement: 'action_element',
  primaryElement: 'primary_element',
} as const;
