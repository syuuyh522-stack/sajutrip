'use client';

// 404 — 잘못된 경로/만료 링크 대응 (§9: 에러는 상황+행동, 사과 금지. 텍스트는 i18n §6.3)
import Link from 'next/link';
import { useI18n } from '../i18n/LanguageProvider';
import { Aurora } from '../components/Aurora';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
      <Aurora />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: 2, color: 'var(--color-text-muted)', margin: 0 }}>404</p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-sm)', lineHeight: 'var(--text-display-sm-lh)', fontWeight: 500, margin: '10px 0 8px' }}>
        {t.notFound.title}
      </h1>
      <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0 0 28px' }}>{t.notFound.desc}</p>
      <Link href="/" style={{ display: 'block', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', background: 'var(--color-text)', color: '#fff', fontSize: 16, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--shadow-fab)' }}>
        {t.notFound.home}
      </Link>
    </main>
  );
}
