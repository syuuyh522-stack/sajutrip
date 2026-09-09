// 시도 코드(lDongRegnCd) → 지역명(로케일별). 영문 주소는 번지가 앞이라 주소 파싱 대신 코드로 표기.
export const REGION_BY_CODE: Record<string, { ko: string; en: string }> = {
  '11': { ko: '서울', en: 'Seoul' },
  '26': { ko: '부산', en: 'Busan' },
  '27': { ko: '대구', en: 'Daegu' },
  '28': { ko: '인천', en: 'Incheon' },
  '29': { ko: '광주', en: 'Gwangju' },
  '30': { ko: '대전', en: 'Daejeon' },
  '31': { ko: '울산', en: 'Ulsan' },
  '36': { ko: '세종', en: 'Sejong' },
  '41': { ko: '경기', en: 'Gyeonggi' },
  '43': { ko: '충북', en: 'Chungbuk' },
  '44': { ko: '충남', en: 'Chungnam' },
  '46': { ko: '전남', en: 'Jeonnam' },
  '47': { ko: '경북', en: 'Gyeongbuk' },
  '48': { ko: '경남', en: 'Gyeongnam' },
  '50': { ko: '제주', en: 'Jeju' },
  '51': { ko: '강원', en: 'Gangwon' },
  '52': { ko: '전북', en: 'Jeonbuk' },
};

// TourAPI 자체 areaCode (KorService2/EngService2) → 지역명. lDongRegnCd와 다른 체계.
export const AREA_BY_CODE: Record<string, { ko: string; en: string }> = {
  '1': { ko: '서울', en: 'Seoul' },
  '2': { ko: '인천', en: 'Incheon' },
  '3': { ko: '대전', en: 'Daejeon' },
  '4': { ko: '대구', en: 'Daegu' },
  '5': { ko: '광주', en: 'Gwangju' },
  '6': { ko: '부산', en: 'Busan' },
  '7': { ko: '울산', en: 'Ulsan' },
  '8': { ko: '세종', en: 'Sejong' },
  '31': { ko: '경기', en: 'Gyeonggi' },
  '32': { ko: '강원', en: 'Gangwon' },
  '33': { ko: '충북', en: 'Chungbuk' },
  '34': { ko: '충남', en: 'Chungnam' },
  '35': { ko: '경북', en: 'Gyeongbuk' },
  '36': { ko: '경남', en: 'Gyeongnam' },
  '37': { ko: '전북', en: 'Jeonbuk' },
  '38': { ko: '전남', en: 'Jeonnam' },
  '39': { ko: '제주', en: 'Jeju' },
};

/**
 * TourAPI areaCode(KorService2/EngService2) → 법정동 시도코드(lDongRegnCd).
 * 데이터랩 방문자수(metcoRegnVisitrDDList)가 법정동 코드를 쓰므로, 일반관광 보강 장소도
 * 이 다리를 거쳐야 혼잡도와 조인된다. (lib/tour-api/congestion.ts)
 */
export const AREA_TO_REGION_CODE: Record<string, string> = {
  '1': '11', // 서울
  '2': '28', // 인천
  '3': '30', // 대전
  '4': '27', // 대구
  '5': '29', // 광주
  '6': '26', // 부산
  '7': '31', // 울산
  '8': '36', // 세종
  '31': '41', // 경기
  '32': '51', // 강원
  '33': '43', // 충북
  '34': '44', // 충남
  '35': '47', // 경북
  '36': '48', // 경남
  '37': '52', // 전북
  '38': '46', // 전남
  '39': '50', // 제주
};
