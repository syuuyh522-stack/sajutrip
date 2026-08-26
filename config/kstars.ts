// K-star 실데이터 — 공개된 생년월일(위키피디아 등 공개 프로필 기준)로 자체 엔진이 오행을 산출해 매칭.
// 선정 기준: 외국인 타깃 글로벌 인지도(K팝·스포츠·배우). 표기는 글로벌 활동명(로마자) + 그룹 병기.
// 매칭 프레임은 §5.8 공명 톤 + 'for fun' 라벨 — 인물에 대한 사실 주장이 아닌 놀이 콘텐츠.
// 운영·확장은 Airtable(kstars 테이블) 권장: name, birth, gender, image (CLAUDE.md §6.6).
import type { KStar } from '../lib/saju/kstar';

export const KSTARS: readonly KStar[] = [
  { id: 'rm', name: 'RM (BTS)', birth: { year: 1994, month: 9, day: 12 }, gender: 'male' },
  { id: 'jin', name: 'Jin (BTS)', birth: { year: 1992, month: 12, day: 4 }, gender: 'male' },
  { id: 'suga', name: 'SUGA (BTS)', birth: { year: 1993, month: 3, day: 9 }, gender: 'male' },
  { id: 'jhope', name: 'J-Hope (BTS)', birth: { year: 1994, month: 2, day: 18 }, gender: 'male' },
  { id: 'jimin', name: 'Jimin (BTS)', birth: { year: 1995, month: 10, day: 13 }, gender: 'male' },
  { id: 'v', name: 'V (BTS)', birth: { year: 1995, month: 12, day: 30 }, gender: 'male' },
  { id: 'jungkook', name: 'Jungkook (BTS)', birth: { year: 1997, month: 9, day: 1 }, gender: 'male' },
  { id: 'jisoo', name: 'Jisoo (BLACKPINK)', birth: { year: 1995, month: 1, day: 3 }, gender: 'female' },
  { id: 'jennie', name: 'Jennie (BLACKPINK)', birth: { year: 1996, month: 1, day: 16 }, gender: 'female' },
  { id: 'rose', name: 'Rosé (BLACKPINK)', birth: { year: 1997, month: 2, day: 11 }, gender: 'female' },
  { id: 'lisa', name: 'Lisa (BLACKPINK)', birth: { year: 1997, month: 3, day: 27 }, gender: 'female' },
  { id: 'iu', name: 'IU', birth: { year: 1993, month: 5, day: 16 }, gender: 'female' },
  { id: 'gdragon', name: 'G-Dragon', birth: { year: 1988, month: 8, day: 18 }, gender: 'male' },
  { id: 'son', name: 'Son Heung-min', birth: { year: 1992, month: 7, day: 8 }, gender: 'male' },
  { id: 'yuna', name: 'Yuna Kim', birth: { year: 1990, month: 9, day: 5 }, gender: 'female' },
  { id: 'leejungjae', name: 'Lee Jung-jae', birth: { year: 1972, month: 12, day: 15 }, gender: 'male' },
  { id: 'junjihyun', name: 'Jun Ji-hyun', birth: { year: 1981, month: 10, day: 30 }, gender: 'female' },
  { id: 'karina', name: 'Karina (aespa)', birth: { year: 2000, month: 4, day: 11 }, gender: 'female' },
];
