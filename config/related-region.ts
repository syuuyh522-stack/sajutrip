// 시도명(장소 region) → TarRlteTar 조회용 대표 (areaCd, signguCd).
// 담은 장소의 정확한 시군구 코드 체계(웰니스/국문 상이)를 통일하기 어려워, POC는 시도 대표로 근사.
// 값은 TarRlteTarService1 실호출로 totalCount>0 검증(2026-07 기준). 미검증 시도는 생략(연관표시 스킵).

export interface RelatedArea {
  areaCd: string;
  signguCd: string;
}

export const REGION_TO_RELATED: Record<string, RelatedArea> = {
  // 지방 (지방 분산 미션 대상)
  강원: { areaCd: '51', signguCd: '51150' }, // 강릉
  경남: { areaCd: '48', signguCd: '48250' }, // 통영
  경북: { areaCd: '47', signguCd: '47130' }, // 경주
  충북: { areaCd: '43', signguCd: '43800' }, // 단양
  충남: { areaCd: '44', signguCd: '44200' }, // 아산
  전북: { areaCd: '52', signguCd: '52710' }, // 군산
  전북특별자치도: { areaCd: '52', signguCd: '52710' },
  제주: { areaCd: '50', signguCd: '50110' }, // 제주시
  제주특별자치도: { areaCd: '50', signguCd: '50110' },
  강원특별자치도: { areaCd: '51', signguCd: '51150' },
  경기: { areaCd: '41', signguCd: '41830' }, // 가평
  // 광역시
  부산: { areaCd: '26', signguCd: '26410' }, // 해운대
  대구: { areaCd: '27', signguCd: '27140' }, // 중구
  인천: { areaCd: '28', signguCd: '28710' }, // 강화
  서울: { areaCd: '11', signguCd: '11680' }, // 강남
  // 별칭
  부산광역시: { areaCd: '26', signguCd: '26410' },
  서울특별시: { areaCd: '11', signguCd: '11680' },
};

/** 지역명(부분 일치)으로 대표 조회 지역을 찾는다. 없으면 null → 연관 표시 스킵. */
export function relatedAreaFor(region: string): RelatedArea | null {
  if (!region) return null;
  if (REGION_TO_RELATED[region]) return REGION_TO_RELATED[region];
  for (const key of Object.keys(REGION_TO_RELATED)) {
    if (region.includes(key)) return REGION_TO_RELATED[key];
  }
  return null;
}
