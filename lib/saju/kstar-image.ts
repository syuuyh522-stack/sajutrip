// K-star 프로필 사진 — 위키피디아(위키미디어 커먼즈, CC 라이선스) 페이지 썸네일.
// 임의 셀럽 사진은 저작권·초상권 리스크 → 자유 라이선스 소스만 사용, 화면에 출처 표기.
// 검색+썸네일 원콜(generator=search + pageimages), 7일 캐시. 실패 시 null(원소색 아바타 폴백).

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

interface WikiPage { thumbnail?: { source?: string } }

/** 위키 API 호출 — 버스트 스로틀 대비 1회 재시도(300ms) */
async function wikiFetch(qs: URLSearchParams): Promise<Record<string, WikiPage> | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 300));
    try {
      const res = await fetch(`${WIKI_API}?${qs.toString()}`, { next: { revalidate: 60 * 60 * 24 * 7 } });
      if (!res.ok) continue;
      const json: unknown = await res.json();
      const pages = (json as { query?: { pages?: Record<string, WikiPage> } })?.query?.pages;
      if (pages) return pages;
    } catch { /* 재시도 */ }
  }
  return null;
}

async function searchImage(query: string): Promise<string | null> {
  const pages = await wikiFetch(new URLSearchParams({
    action: 'query', generator: 'search', gsrsearch: query, gsrlimit: '1',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '160', format: 'json', origin: '*',
  }));
  const first = pages ? Object.values(pages)[0] : undefined;
  return first?.thumbnail?.source ?? null;
}

/** 정확한 문서 제목으로 직조회 (검색 우회) */
async function titleImage(title: string): Promise<string | null> {
  const pages = await wikiFetch(new URLSearchParams({
    action: 'query', titles: title, redirects: '1',
    prop: 'pageimages', piprop: 'thumbnail', pithumbsize: '160', format: 'json', origin: '*',
  }));
  const first = pages ? Object.values(pages)[0] : undefined;
  return first?.thumbnail?.source ?? null;
}

export async function getStarImage(name: string, wiki?: string): Promise<string | null> {
  if (wiki) return titleImage(wiki);
  const direct = await searchImage(name);
  if (direct) return direct;
  // 괄호 표기("Hanni (NewJeans)")가 검색을 방해하는 케이스 — 괄호 제거 후 재시도
  const plain = name.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain !== name) return searchImage(plain);
  return null;
}

/** 매칭 리스트에 사진 부착 (병렬, 실패 무시). wikiByName = 검색 실패 스타의 제목 오버라이드 */
export async function attachImages<T extends { name: string; image?: string }>(
  matches: T[],
  wikiByName?: ReadonlyMap<string, string>,
): Promise<T[]> {
  const imgs = await Promise.all(matches.map((m) => getStarImage(m.name, wikiByName?.get(m.name))));
  return matches.map((m, i) => (imgs[i] ? { ...m, image: imgs[i] as string } : m));
}
