'use client';

// 로케일 선택 UI. LOCALES를 순회하므로 언어 추가 시 자동 노출(§6.3).
// 디자인시스템: 토큰 색만 사용, 탭타깃 44px(§8), 활성=water.
import { useI18n } from '../i18n/LanguageProvider';
import { LOCALES, LOCALE_LABELS } from '../i18n/dictionaries';

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      style={{ display: 'inline-flex', gap: 4, background: 'rgba(185,180,199,.18)', padding: 4, borderRadius: 'var(--radius-pill)' }}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            style={{
              border: 0,
              cursor: 'pointer',
              minHeight: 36,
              padding: '8px 16px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              background: active ? 'var(--color-water)' : 'transparent',
              color: active ? '#fff' : 'var(--color-text-muted)',
              transition: 'all var(--motion-fast)',
            }}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
