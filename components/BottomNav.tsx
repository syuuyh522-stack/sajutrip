'use client';

// 하단 고정 네비 (PRD IA): 사주 · 내 일정 · 검색 · 마이. birth는 프로필 스토어에서.
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';

type NavId = 'saju' | 'plan' | 'search' | 'my';
const ITEMS: { id: NavId; path: string; icon: string }[] = [
  { id: 'saju', path: '/result', icon: '卦' },
  { id: 'plan', path: '/plan', icon: '程' },
  { id: 'search', path: '/search', icon: '⌕' },
  { id: 'my', path: '/my', icon: '我' },
];
const ACTIVE_BY_PATH: Record<string, NavId> = {
  '/result': 'saju', '/explore': 'saju', '/plan': 'plan', '/search': 'search', '/my': 'my',
};

export function BottomNav() {
  const { t } = useI18n();
  const { birth } = useProfile();
  const pathname = usePathname();
  const active = ACTIVE_BY_PATH[pathname];
  const query = birth ? { gender: birth.gender, year: birth.year, month: birth.month, day: birth.day } : {};

  return (
    <nav style={navStyle} aria-label="Main">
      {ITEMS.map((it) => {
        const on = active === it.id;
        return (
          <Link key={it.id} href={{ pathname: it.path, query }} style={{ textDecoration: 'none', flex: 1 }}>
            <span style={{ ...itemStyle, color: on ? 'var(--accent)' : 'var(--muted-2)' }}>
              <span style={{ fontFamily: 'var(--serif, serif)', fontSize: 17, lineHeight: 1 }}>{it.icon}</span>
              {t.nav[it.id]}
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
  borderTop: '1px solid var(--line)', background: 'rgba(255,255,255,.92)', backdropFilter: 'blur(8px)',
  paddingBottom: 'env(safe-area-inset-bottom)',
};
const itemStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
  padding: '9px 4px 11px', fontSize: 10.5, fontWeight: 500,
};
