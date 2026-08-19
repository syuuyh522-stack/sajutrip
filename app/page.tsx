'use client';

// F-1 홈/랜딩 — 언어 선택 + 성별·생년월일 입력. (PRD F-1, CLAUDE.md §7)
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';
import { LanguageSwitch } from '../components/LanguageSwitch';

type Gender = 'female' | 'male';

export default function LandingPage() {
  const { t } = useI18n();
  const { setBirth } = useProfile();
  const router = useRouter();
  const [gender, setGender] = useState<Gender>('female');
  const [year, setYear] = useState('1996');
  const [month, setMonth] = useState('07');
  const [day, setDay] = useState('22');

  const submit = () => {
    setBirth({ gender, year, month, day }); // 프로필 저장(하단 네비·마이 등에서 사용)
    const params = new URLSearchParams({ gender, year, month, day });
    router.push(`/result?${params.toString()}`);
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <LanguageSwitch />
      </header>

      <p style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--accent)', margin: '18px 0 0' }}>
        {t.landing.eyebrow}
      </p>
      <h1 style={{ fontSize: 28, lineHeight: 1.18, letterSpacing: '-0.4px', margin: '10px 0 8px', textWrap: 'balance' }}>
        {t.landing.title}
      </h1>
      <p style={{ color: 'var(--muted)', margin: '0 0 28px', lineHeight: 1.6 }}>{t.landing.subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
      <p style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 10, textAlign: 'center' }}>{t.landing.note}</p>
    </main>
  );
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 12, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--muted)', marginBottom: 8,
};
const seg = (active: boolean): React.CSSProperties => ({
  flex: 1, padding: 13, borderRadius: 12, cursor: 'pointer', fontSize: 14,
  border: `1px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
  background: active ? 'var(--accent-soft)' : '#fff',
  color: active ? 'var(--accent)' : 'var(--ink)',
  fontWeight: active ? 600 : 400,
});
const dobInput: React.CSSProperties = {
  width: '100%', padding: 13, borderRadius: 12, border: '1px solid var(--line)',
  fontFamily: 'var(--mono)', fontSize: 15, textAlign: 'center', color: 'var(--ink)',
};
const cta: React.CSSProperties = {
  width: '100%', padding: '15px 18px', borderRadius: 14, border: 0, cursor: 'pointer',
  fontSize: 15, fontWeight: 600, color: '#fff', background: 'var(--accent)',
};
