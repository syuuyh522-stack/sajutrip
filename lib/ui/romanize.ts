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

/**
 * en 로케일 표기 결정:
 * - 한글이 없거나, 이미 라틴 문자가 섞인 병기형("APAP Artwork Tour (APAP 작품투어)")은 그대로.
 * - 순한글 고유명만 로마자를 主표기로, 원 한글을 병기(secondary)로 돌려준다.
 */
export function displayName(name: string, locale: string): { primary: string; hangul?: string } {
  if (locale === 'en' && hasHangul(name) && !/[A-Za-z]/.test(name)) {
    return { primary: romanizeKorean(name), hangul: name };
  }
  return { primary: name };
}
