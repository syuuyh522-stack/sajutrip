'use client';

// 하단 고정 네비 (PRD IA): 사주 · 내 일정 · 검색 · 마이. 라인 아이콘(§6, 한자 금지).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';
import { IconSaju, IconRoute, IconSearch, IconUser } from './icons';
import type { ComponentType } from 'react';

type NavId = 'saju' | 'plan' | 'search' | 'my';
const ITEMS: { id: NavId; path: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'saju', path: '/result', Icon: IconSaju },
  { id: 'plan', path: '/plan', Icon: IconRoute },
  { id: 'search', path: '/search', Icon: IconSearch },
  { id: 'my', path: '/my', Icon: IconUser },
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
      {ITEMS.map(({ id, path, Icon }) => {
        const on = active === id;
        return (
          <Link
            key={id}
            href={{ pathname: path, query }}
            aria-current={on ? 'page' : undefined}
            style={{ textDecoration: 'none', flex: 1 }}
          >
            <span style={{ ...itemStyle, color: on ? 'var(--color-water)' : 'var(--color-text-muted)' }}>
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
  minHeight: 52, padding: '8px 4px', fontSize: 11, fontWeight: 500, // 44px+ 탭타깃(§8)
};
