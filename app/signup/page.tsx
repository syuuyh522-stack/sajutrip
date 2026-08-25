'use client';

// 회원가입 (P1) — 성별·생년월일 pre-fill + 약관(AI 생성). POC는 localStorage(인증은 Phase 2). (PRD 회원가입)
import { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useI18n } from '../../i18n/LanguageProvider';
import { useProfile } from '../../i18n/ProfileProvider';
import { Aurora } from '../../components/Aurora';

function SignupInner() {
  const { t } = useI18n();
  const { birth, signUp } = useProfile();
  const router = useRouter();
  const params = useSearchParams();
  const [nickname, setNickname] = useState('');

  const b = birth ?? {
    gender: params.get('gender') ?? '', year: params.get('year') ?? '', month: params.get('month') ?? '', day: params.get('day') ?? '',
  };
  const query = useMemo(() => ({ gender: b.gender, year: b.year, month: b.month, day: b.day }), [b.gender, b.year, b.month, b.day]);

  const create = () => {
    signUp(nickname.trim());
    router.push(`/my?${new URLSearchParams(query).toString()}`);
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Link href={{ pathname: '/my', query }} style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>← {t.signup.back}</Link>
      </header>

      <h1 style={{ fontSize: 24, fontWeight: 600, margin: '0 0 8px' }}>{t.signup.title}</h1>
      <p style={{ color: 'var(--muted)', margin: '0 0 24px', lineHeight: 1.6 }}>{t.signup.subtitle}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <Field label="Gender / Birth · pre-filled">
          <div style={{ display: 'flex', gap: 8 }}>
            <ReadonlyBox v={b.gender || '—'} />
            <ReadonlyBox v={b.year ? `${b.year}.${b.month}.${b.day}` : '—'} flex={2} />
          </div>
        </Field>
        <Field label={t.signup.nickname}>
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t.signup.nicknameHint}
            style={{ width: '100%', padding: 13, borderRadius: 12, border: '1px solid var(--line)', fontSize: 14, color: 'var(--ink)', outline: 'none' }} />
        </Field>
      </div>

      <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 13, color: 'var(--muted)', marginTop: 18, lineHeight: 1.5 }}>
        <input type="checkbox" defaultChecked style={{ marginTop: 2 }} />
        <span>
          {t.signup.agree}{' '}
          <Link href="/privacy" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{t.signup.privacy}</Link>
          {' · '}
          <Link href="/terms" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{t.signup.terms}</Link>
          {' '}({t.signup.aiGen})
        </span>
      </label>

      <button type="button" onClick={create} style={{ width: '100%', minHeight: 48, marginTop: 24, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: 0, cursor: 'pointer', fontSize: 16, fontWeight: 600, color: '#fff', background: 'var(--color-text)', boxShadow: 'var(--shadow-fab)' }}>
        {t.signup.create}
      </button>
      <Link href={{ pathname: '/my', query }} style={{ display: 'block', textAlign: 'center', marginTop: 10, fontSize: 14, color: 'var(--muted)', textDecoration: 'none' }}>{t.signup.later}</Link>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 13, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}
function ReadonlyBox({ v, flex = 1 }: { v: string; flex?: number }) {
  return <div style={{ flex, padding: 13, borderRadius: 12, border: '1px solid var(--line)', background: '#F8FAFC', fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--muted)', textAlign: 'center' }}>{v}</div>;
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
