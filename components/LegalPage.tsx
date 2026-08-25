'use client';

// 약관/개인정보처리방침 공용 레이아웃 — 본문은 i18n legal 사전(AI 생성 고지 포함).
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { Aurora } from './Aurora';

export function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const { t } = useI18n();
  const router = useRouter();
  const title = kind === 'privacy' ? t.legal.privacyTitle : t.legal.termsTitle;
  const body = kind === 'privacy' ? t.legal.privacyBody : t.legal.termsBody;

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <header style={{ marginBottom: 20 }}>
        <button type="button" onClick={() => router.back()} style={{ border: 0, background: 'transparent', cursor: 'pointer', fontSize: 14, color: 'var(--color-text-muted)', padding: 0, minHeight: 44 }}>
          ← {t.legal.back}
        </button>
      </header>

      <h1 style={{ fontSize: 'var(--text-title-lg)', lineHeight: 'var(--text-title-lg-lh)', fontWeight: 600, margin: '0 0 6px' }}>{title}</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 18px' }}>{t.legal.updated}</p>

      <div className="glass" style={{ padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 'var(--text-caption)', lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>
          {t.legal.aiNote}
        </p>
      </div>

      <ol style={{ display: 'flex', flexDirection: 'column', gap: 14, margin: 0, paddingLeft: 20 }}>
        {body.map((p, i) => (
          <li key={i} style={{ fontSize: 'var(--text-body-sm)', lineHeight: 'var(--text-body-sm-lh)', color: 'var(--color-text)' }}>{p}</li>
        ))}
      </ol>
    </main>
  );
}
