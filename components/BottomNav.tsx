'use client';

// 하단 고정 네비 (PRD IA): 사주 · 내 일정 · 검색 · 마이. 라인 아이콘(§6, 한자 금지).
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';
import { useItinerary } from '../i18n/ItineraryProvider';
import { track } from '../lib/analytics/track';
import { IconSaju, IconRoute, IconUser } from './icons';
import type { ComponentType } from 'react';

// PO 결정: 검색은 독립 탭이 아니라 탐색(explore) 상단 검색바 — GNB 3탭
type NavId = 'saju' | 'plan' | 'my';
const ITEMS: { id: NavId; path: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'saju', path: '/result', Icon: IconSaju },
  { id: 'plan', path: '/plan', Icon: IconRoute },
  { id: 'my', path: '/my', Icon: IconUser },
];
const ACTIVE_BY_PATH: Record<string, NavId> = {
  '/result': 'saju', '/explore': 'saju', '/plan': 'plan', '/my': 'my',
};

export function BottomNav() {
  const { t } = useI18n();
  const { birth } = useProfile();
  const pathname = usePathname();
  const sp = useSearchParams();
  const active = ACTIVE_BY_PATH[pathname];
  // birth query: 현재 URL 우선(딥링크/공유 진입 시 프로필 없어도 유지), 프로필 폴백 (휴리스틱 #2)
  const query: Record<string, string> = {};
  for (const k of ['gender', 'year', 'month', 'day', 'hour'] as const) {
    const v = sp.get(k) ?? (birth ? birth[k] : '');
    if (v) query[k] = v;
  }

  // 사주 산출 전(생년월일 없음)이면 홈 탭 = 랜딩(입력)으로 — 빈 결과 화면에 떨어지지 않게 (Airbnb 로그인 전/후 탭 구분과 동일 원리)
  const hasBirth = Boolean(query.year);

  // 여행 단계 — 탭 사용률을 단계별로 계측 (바텀 네비 유지/축소 판단 근거, §8.4)
  const { state: itin } = useItinerary();
  const now = Date.now();
  const stage =
    itin.items.length === 0 ? 'pre'
    : itin.end && new Date(`${itin.end}T23:59:59`).getTime() < now ? 'post'
    : itin.start && new Date(`${itin.start}T00:00:00`).getTime() <= now ? 'traveling'
    : 'planned';

  return (
    <nav style={navStyle} aria-label="Main">
      {ITEMS.map(({ id, path, Icon }) => {
        const on = active === id;
        const dest = id === 'saju' && !hasBirth ? '/' : path;
        return (
          <Link
            key={id}
            href={{ pathname: dest, query }}
            aria-current={on ? 'page' : undefined}
            onClick={() => track('nav_tab_click', { tab: id, stage, hasBirth })}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <span style={{ ...itemStyle, color: on ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
              <Icon size={22} />
              {t.nav[id]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 460,
  display: 'flex', zIndex: 10,
  borderTop: '1px solid rgba(185,180,199,.35)', background: 'rgba(255,255,255,.9)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  paddingBottom: 'env(safe-area-inset-bottom)',
};
const itemStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
  minHeight: 52, padding: '8px 4px', fontSize: 13, fontWeight: 500, // 44px+ 탭타깃(§8)
};
