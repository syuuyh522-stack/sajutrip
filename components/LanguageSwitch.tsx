'use client';

// 로케일 선택 UI. LOCALES를 순회하므로 언어 추가 시 자동 노출(§6.3).
import { useI18n } from '../i18n/LanguageProvider';
import { LOCALES, LOCALE_LABELS } from '../i18n/dictionaries';

export function LanguageSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <div
      role="group"
      aria-label="Language"
      style={{ display: 'inline-flex', gap: 4, background: '#F1F5F9', padding: 4, borderRadius: 999 }}
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
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: active ? 600 : 500,
              background: active ? '#1E293B' : 'transparent',
              color: active ? '#fff' : '#64748B',
              transition: '.15s',
            }}
          >
            {LOCALE_LABELS[code]}
          </button>
        );
      })}
    </div>
  );
}
