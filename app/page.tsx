'use client';

// F-1 홈/랜딩 — 언어 선택 + 성별·생년월일 입력. (PRD F-1, CLAUDE.md §7)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { Aurora } from '../components/Aurora';
import { track } from '../lib/analytics/track';

type Gender = 'female' | 'male';

export default function LandingPage() {
  const { t } = useI18n();
  const { setBirth } = useProfile();
  const router = useRouter();
  const [gender, setGender] = useState<Gender>('female');
  const [year, setYear] = useState('1996');
  const [month, setMonth] = useState('07');
  const [day, setDay] = useState('22');

  useEffect(() => { track('landing_view'); }, []);

  const submit = () => {
    setBirth({ gender, year, month, day }); // 프로필 저장(하단 네비·마이 등에서 사용)
    track('saju_submit', { gender });
    const params = new URLSearchParams({ gender, year, month, day });
    router.push(`/result?${params.toString()}`);
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <LanguageSwitch />
      </header>

      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--color-water)', margin: '18px 0 0' }}>
        {t.landing.eyebrow}
      </p>
      {/* Display serif — 히어로 헤드라인 (§2) */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-sm)', lineHeight: 'var(--text-display-sm-lh)', fontWeight: 600, letterSpacing: '-0.3px', margin: '10px 0 8px', textWrap: 'balance' }}>
        {t.landing.title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>{t.landing.subtitle}</p>

      <div className="glass" style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <label style={label}>{t.landing.gender}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['female', 'male'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)} aria-pressed={gender === g} style={seg(gender === g)}>
                {g === 'female' ? t.landing.female : t.landing.male}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={label}>{t.landing.dob}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" aria-label={t.landing.year} style={dobInput} />
            <input value={month} onChange={(e) => setMonth(e.target.value)} inputMode="numeric" aria-label={t.landing.month} style={dobInput} />
            <input value={day} onChange={(e) => setDay(e.target.value)} inputMode="numeric" aria-label={t.landing.day} style={dobInput} />
          </div>
        </div>
      </div>

      <button type="button" onClick={submit} style={{ ...cta, marginTop: 28 }}>{t.landing.cta} →</button>
      <p style={{ fontSize: 13, color: 'var(--muted-2)', marginTop: 10, textAlign: 'center' }}>{t.landing.note}</p>
    </main>
  );
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 13, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--color-text-muted)', marginBottom: 8,
};
// 세그먼트 활성 = water(§1 링크/액티브), 탭타깃 44px+(§8)
const seg = (active: boolean): React.CSSProperties => ({
  flex: 1, minHeight: 44, padding: '12px 13px', borderRadius: 'var(--radius-input)', cursor: 'pointer', fontSize: 14,
  border: `1.5px solid ${active ? 'var(--color-water)' : 'rgba(185,180,199,.4)'}`,
  background: active ? 'rgba(74,85,120,.08)' : 'var(--color-surface)',
  color: active ? 'var(--color-water)' : 'var(--color-text)',
  fontWeight: active ? 600 : 400,
  transition: 'all var(--motion-fast)',
});
// 생년월일 = mono(§2 숫자)
const dobInput: React.CSSProperties = {
  width: '100%', minHeight: 44, padding: 13, borderRadius: 'var(--radius-input)', border: '1px solid rgba(185,180,199,.4)',
  fontFamily: 'var(--font-mono)', fontSize: 16, textAlign: 'center', color: 'var(--color-text)', background: 'var(--color-surface)',
};
// primary CTA = 火 단색 pill (§1: 앱 전체 유일한 primary 색)
const cta: React.CSSProperties = {
  width: '100%', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: 0, cursor: 'pointer',
  fontSize: 16, fontWeight: 600, color: '#fff', background: 'var(--color-fire-strong)', boxShadow: 'var(--shadow-fab)',
  transition: 'transform var(--motion-press)',
};
