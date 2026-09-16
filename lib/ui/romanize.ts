// 한글 → 로마자(국어의 로마자 표기법, Revised Romanization) 변환.
// 두루누비·연관관광지 등 영문 표기가 없는 한국어 전용 데이터의 en 로케일 병기용.
// 음운 동화(연음·비음화 등)는 미적용 — 고유명사 표기 목적의 음절 단위 근사(POC 수준).

const CHO = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h'];
const JUNG = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i'];
// 종성은 대표음 기준 (ㄱ·ㄲ·ㄳ→k, ㅂ·ㅄ→p, ㅅ·ㅆ·ㅈ…→t 등)
const JONG = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k', 'm', 'l', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't', 't', 'ng', 't', 't', 'k', 't', 'p', 't'];

const HANGUL_RE = /[가-힣]/;

export function hasHangul(s: string): boolean {
  return HANGUL_RE.test(s);
}

/** 음절 단위 RR 변환. 한글 외 문자는 그대로 통과, 단어 첫 글자는 대문자화. */
export function romanizeKorean(s: string): string {
  let out = '';
  for (const ch of s) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const idx = code - 0xac00;
      const cho = Math.floor(idx / 588);
      const jung = Math.floor((idx % 588) / 28);
      const jong = idx % 28;
      out += CHO[cho] + JUNG[jung] + JONG[jong];
    } else {
      out += ch;
    }
  }
  // ㄹ 연쇄(종성 l + 초성 r)는 표준 표기상 ll (둘레→dulle)
  out = out.replace(/lr/g, 'll');
  // 공백 단위 토큰의 첫 알파벳 대문자화 (고유명사 표기)
  return out.replace(/(^|\s)([a-z])/g, (_, sp: string, c: string) => sp + c.toUpperCase());
}

// ── 장소 유형어 사전 ──────────────────────────────────────────────────────
// 이름 전체를 음차하면 유형까지 소리로 변해 뜻이 사라진다
// ("강변스파랜드" → "Gangbyeonseuparaendeu"). 외래어는 특히 심하다(랜드→Raendeu).
// 고유명 부분만 로마자로 두고 유형어는 번역한다.
// 정식 번역기가 아니라 휴리스틱이다 — 관광 데이터에 실제로 반복되는 어휘만 담는다.

/** 설립 주체 접두 — 영어에서는 유형어 바로 앞에 온다(Sinbulsan Falls *National* Recreation Forest) */
const PREFIX_TERMS: ReadonlyArray<readonly [string, string]> = [
  ['국립', 'National'], ['도립', 'Provincial'], ['시립', 'Municipal'], ['군립', 'County'],
];

/** 끝에 붙는 유형어. 긴 것부터 매칭한다(자연휴양림 → 휴양림 순서가 중요) */
const SUFFIX_TERMS: ReadonlyArray<readonly [string, string]> = [
  ['자연휴양림', 'Recreation Forest'], ['치유의숲', 'Healing Forest'], ['휴양림', 'Recreation Forest'],
  ['자연공원', 'Natural Park'], ['생태공원', 'Ecological Park'], ['수목원', 'Arboretum'],
  ['둘레길', 'Trail'], ['숲길', 'Forest Trail'], ['산책로', 'Walking Path'],
  ['해수욕장', 'Beach'], ['해변', 'Beach'], ['폭포', 'Falls'], ['계곡', 'Valley'],
  ['약수터', 'Mineral Spring'], ['온천', 'Hot Springs'], ['스파', 'Spa'],
  ['사우나', 'Sauna'], ['찜질방', 'Jjimjilbang'], ['한증막', 'Hanjeungmak'], ['족욕', 'Foot Bath'],
  ['테마파크', 'Theme Park'], ['유원지', 'Amusement Park'], ['전망대', 'Observatory'],
  ['박물관', 'Museum'], ['미술관', 'Art Museum'], ['체험관', 'Experience Center'],
  ['수련원', 'Training Center'], ['연수원', 'Training Center'], ['캠핑장', 'Campground'],
  ['저수지', 'Reservoir'], ['호수', 'Lake'], ['습지', 'Wetland'], ['갯벌', 'Mudflat'],
  ['염전', 'Salt Farm'], ['동굴', 'Cave'], ['목장', 'Ranch'], ['농장', 'Farm'], ['농원', 'Farm'],
  ['국가정원', 'National Garden'], ['정원', 'Garden'], ['마을', 'Village'], ['공원', 'Park'],
  ['리조트', 'Resort'], ['테마랜드', 'Theme Land'], ['랜드', 'Land'], ['센터', 'Center'],
];

/** 유형어를 최대 3겹까지 벗긴다(신불산+폭포+자연휴양림) */
const MAX_SUFFIX_DEPTH = 3;
/** 유형어 사이 구분기호 — 벗긴 뒤 남으면 다음 유형어 매칭을 막는다('가곡유황온천&' + 스파) */
const TRAILING_SEP = /[\s&·,·\-–—/(]+$/;

/**
 * 한국어 장소명 → 영어 표기.
 * 유형어는 번역하고 남은 고유명만 로마자로 적는다.
 *   국립 신불산폭포자연휴양림 → Sinbulsan Falls National Recreation Forest
 *   강변스파랜드             → Gangbyeon Spa Land
 * 유형어를 못 찾으면 기존대로 전체 로마자.
 */
export function translatePlaceName(name: string): string {
  let rest = name.trim();

  let prefix = '';
  for (const [ko, en] of PREFIX_TERMS) {
    if (rest.startsWith(ko)) { prefix = en; rest = rest.slice(ko.length).replace(/^[\s·\-]+/, '').trim(); break; }
  }

  const terms: string[] = [];
  for (let i = 0; i < MAX_SUFFIX_DEPTH; i++) {
    const hit = SUFFIX_TERMS.find(([ko]) => rest.length > ko.length && rest.endsWith(ko));
    if (!hit) break;
    terms.unshift(hit[1]);
    rest = rest.slice(0, -hit[0].length).replace(TRAILING_SEP, '').trim();
  }
  // 유형어만으로 이뤄진 이름(예: '온천')은 고유명이 없어 번역할 게 없다 → 원래 규칙대로
  if (terms.length === 0 && !prefix) return romanizeKorean(name);

  const stem = rest ? romanizeKorean(rest) : '';
  // 접두(국립 등)는 마지막 유형어 바로 앞 — 영어 어순
  const last = terms.pop();
  return [stem, ...terms, prefix, last].filter(Boolean).join(' ');
}

/**
 * en 로케일 표기 결정:
 * - 한글이 없거나, 이미 라틴 문자가 섞인 병기형("APAP Artwork Tour (APAP 작품투어)")은 그대로.
 * - 순한글 고유명은 유형어를 번역한 영문 표기를 主표기로, 원 한글을 병기(secondary)로.
 */
export function displayName(name: string, locale: string): { primary: string; hangul?: string } {
  if (locale === 'en' && hasHangul(name) && !/[A-Za-z]/.test(name)) {
    return { primary: translatePlaceName(name), hangul: name };
  }
  return { primary: name };
}
