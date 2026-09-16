'use client';

// F-1 홈/랜딩 — 언어 선택 + 성별·생년월일 입력. (PRD F-1, CLAUDE.md §7)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../i18n/LanguageProvider';
import { useProfile } from '../i18n/ProfileProvider';
import { AppHeader } from '../components/AppHeader';
import { Aurora } from '../components/Aurora';
import { track } from '../lib/analytics/track';

type Gender = 'female' | 'male';
const HOURS = Array.from({ length: 24 }, (_, h) => String(h));

export default function LandingPage() {
  const { t } = useI18n();
  const { setBirth } = useProfile();
  const router = useRouter();
  const [gender, setGender] = useState<Gender>('female');
  const [genderInfo, setGenderInfo] = useState(false);
  // 프리필 없음 — 값이 채워져 있으면 유저가 남의 생년월일로 결과를 볼 수 있다
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [dateError, setDateError] = useState(false);
  // 태어난 시간 (선택, §7.2) — timeUnknown이면 date-based 리딩(완전한 모드로 프레이밍)
  const [birthTime, setBirthTime] = useState('');
  const [timeUnknown, setTimeUnknown] = useState(false);
  // 시간 피커는 기본 접힘 — 선택 항목이라 랜딩이 길어지면 CTA가 밀린다
  const [timeOpen, setTimeOpen] = useState(false);

  useEffect(() => { track('landing_view'); }, []);

  // §7.2 검증 — 실존 날짜인지(2/30 등 배제) + 미래 날짜 배제. 수정 즉시 에러 해제.
  const isValidDate = () => {
    const y = Number(year), m = Number(month), d = Number(day);
    if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return false;
    if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return false;
    const dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return false;
    return dt.getTime() <= Date.now();
  };

  const submit = () => {
    if (!isValidDate()) { setDateError(true); return; }
    // 시간: 모름이 아니고 값이 있으면 시(hour)만 사주 산출에 사용 (시지는 2시간 단위) — 분 단위 입력 자체가 없음
    const hour = !timeUnknown && birthTime ? birthTime : '';
    setBirth({ gender, year, month, day, hour }); // 프로필 저장(하단 네비·마이 등에서 사용)
    track('saju_submit', { gender, withTime: hour !== '' });
    const params = new URLSearchParams({ gender, year, month, day, ...(hour ? { hour } : {}) });
    router.push(`/result?${params.toString()}`);
  };

  return (
    <main style={{ maxWidth: 460, margin: '0 auto', padding: '24px 22px 40px', minHeight: '100dvh' }}>
      <Aurora />
      <AppHeader />

      {/* Display serif — 히어로 헤드라인 (§2) */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-display-sm)', lineHeight: 'var(--text-display-sm-lh)', fontWeight: 600, letterSpacing: '-0.3px', margin: '10px 0 8px', textWrap: 'balance' }}>
        {t.landing.title}
      </h1>
      <p style={{ color: 'var(--color-text-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>{t.landing.subtitle}</p>

      <div className="glass" style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          {/* 성별 라벨 + 이분 선택 설명 툴팁 — 서양권 젠더 다양성 배려: 전통 계산 방식일 뿐 정체성 판단이 아님을 명시 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <label style={{ ...label, marginBottom: 0 }}>{t.landing.gender}</label>
            <button
              type="button"
              onClick={() => setGenderInfo((v) => !v)}
              aria-expanded={genderInfo}
              aria-label={t.landing.genderWhy}
              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '10px', margin: '-10px 0', lineHeight: 1, color: 'var(--color-accent)', fontSize: 14 }}
            >
              ⓘ
            </button>
          </div>
          {genderInfo && (
            <div role="note" className="glass" style={{ padding: '12px 14px', marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>{t.landing.genderWhy}</p>
              <p style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: 0 }}>{t.landing.genderNote}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            {(['female', 'male'] as const).map((g) => (
              <button key={g} type="button" onClick={() => setGender(g)} aria-pressed={gender === g} style={seg(gender === g)}>
                {g === 'female' ? t.landing.female : t.landing.male}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-label={t.landing.dob}>
          <label style={label}>{t.landing.dob}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={year} onChange={(e) => { setYear(e.target.value); setDateError(false); }} inputMode="numeric" maxLength={4} placeholder={t.landing.year} aria-label={t.landing.year} style={{ ...dobInput, ...(dateError ? errBorder : {}) }} />
            <input value={month} onChange={(e) => { setMonth(e.target.value); setDateError(false); }} inputMode="numeric" maxLength={2} placeholder={t.landing.month} aria-label={t.landing.month} style={{ ...dobInput, ...(dateError ? errBorder : {}) }} />
            <input value={day} onChange={(e) => { setDay(e.target.value); setDateError(false); }} inputMode="numeric" maxLength={2} placeholder={t.landing.day} aria-label={t.landing.day} style={{ ...dobInput, ...(dateError ? errBorder : {}) }} />
          </div>
          {/* §7.2 인라인 에러 — 필드 직하단 13px, error 토큰(원소색 아님) */}
          {dateError && (
            <p role="alert" style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-error)', margin: '8px 0 0' }}>
              {t.landing.dateError}
            </p>
          )}
          {/* 개인정보 마이크로카피 — 생년월일 필드 직하단 (§7.2 필수) */}
          <p style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: '8px 0 0' }}>
            {t.landing.privacy}
          </p>
        </div>

        {/* 태어난 시간 (선택) — 모름 = 일급 경로, 결과는 date-based로 온전히 렌더 (§7.2) */}
        <div>
          <label style={label}>{t.landing.tob}</label>
          {/* 시간 선택 — 드롭다운 대신 칩 그리드. 드롭다운은 열기 전까지 어떤 값이 있는지
              보이지 않고, 24개를 스크롤로 훑어야 한다. 칩은 한눈에 들어오고 탭 한 번이다.
              분 단위는 사주 산출에 쓰이지 않아 시(hour)만 제공한다(시지는 2시간 단위).
              '모름'을 고르면 아예 감춘다 — 비활성 칩 24개는 시각적 소음이다. */}
          {!timeUnknown && (
            <div style={{ border: '1px solid rgba(185,180,199,.4)', borderRadius: 'var(--radius-input)', background: 'var(--color-surface)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setTimeOpen((o) => !o)}
                aria-expanded={timeOpen}
                style={{
                  width: '100%', minHeight: 48, padding: '12px 14px', border: 0, background: 'transparent', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--color-text)',
                }}
              >
                <IconClock />
                <span style={{ flex: 1, textAlign: 'left', fontFamily: birthTime ? 'var(--font-mono)' : undefined, fontWeight: birthTime ? 600 : 400, color: birthTime ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                  {birthTime ? `${birthTime.padStart(2, '0')}:00` : t.landing.tobPick}
                </span>
                <span aria-hidden="true" style={{ color: 'var(--color-text-muted)', transform: timeOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--motion-fast)', lineHeight: 1 }}>⌄</span>
              </button>
              {timeOpen && (
                <div
                  role="radiogroup"
                  aria-label={t.landing.tob}
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: '4px 14px 14px' }}
                >
                  {HOURS.map((h) => {
                    const on = birthTime === h;
                    return (
                      <button
                        key={h}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => { setBirthTime(on ? '' : h); if (!on) setTimeOpen(false); }}
                        style={{
                          minHeight: 40, borderRadius: 'var(--radius-pill)', cursor: 'pointer',
                          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: on ? 700 : 400,
                          border: on ? 0 : '1px solid rgba(185,180,199,.45)',
                          background: on ? 'var(--color-accent)' : 'var(--color-surface)',
                          color: on ? '#fff' : 'var(--color-text)',
                          transition: 'background var(--motion-fast)',
                        }}
                      >
                        {h.padStart(2, '0')}:00
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* 모름 = 체크박스 (일급 경로, §7.2) — 체크 시 시간 필드 비활성 + date-based 안내 */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, cursor: 'pointer', fontSize: 13, color: timeUnknown ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: timeUnknown ? 600 : 400 }}>
            <input
              type="checkbox"
              checked={timeUnknown}
              onChange={(e) => { setTimeUnknown(e.target.checked); if (e.target.checked) { setBirthTime(''); setTimeOpen(false); } }}
              style={{ width: 18, height: 18, accentColor: 'var(--color-accent)' }}
            />
            {t.landing.unknownTime}
          </label>
          {timeUnknown && (
            <p role="note" style={{ fontSize: 13, lineHeight: 'var(--text-caption-lh)', color: 'var(--color-text-muted)', margin: 0 }}>
              {t.landing.dateBasedNote}
            </p>
          )}
        </div>
      </div>

      {/* PO 피드백 #3: 논의되지 않은 안내 문구 제거 — 프라이버시 카피(§7.2 문서 근거)만 유지 */}
      <button type="button" onClick={submit} style={{ ...cta, marginTop: 28 }}>{t.landing.cta} →</button>
    </main>
  );
}

/** 시계 아이콘 — 라인 아이콘(§6, 한자·이모지 금지) */
function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" style={{ color: 'var(--color-accent)', flex: '0 0 auto' }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 13, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--color-text-muted)', marginBottom: 8,
};
// 세그먼트 활성 = water(§1 링크/액티브), 탭타깃 44px+(§8)
const seg = (active: boolean): React.CSSProperties => ({
  flex: 1, minHeight: 44, padding: '12px 13px', borderRadius: 'var(--radius-input)', cursor: 'pointer', fontSize: 14,
  border: `1.5px solid ${active ? 'var(--color-accent)' : 'rgba(185,180,199,.4)'}`,
  background: active ? 'rgba(108,63,224,.08)' : 'var(--color-surface)',
  color: active ? 'var(--color-accent)' : 'var(--color-text)',
  fontWeight: active ? 600 : 400,
  transition: 'all var(--motion-fast)',
});
// 생년월일 = mono(§2 숫자)
const dobInput: React.CSSProperties = {
  width: '100%', minHeight: 44, padding: 13, borderRadius: 'var(--radius-input)', border: '1px solid rgba(185,180,199,.4)',
  fontFamily: 'var(--font-mono)', fontSize: 16, textAlign: 'center', color: 'var(--color-text)', background: 'var(--color-surface)',
};
const errBorder: React.CSSProperties = { border: '1.5px solid var(--color-error)' };
// primary CTA = 잉크(--color-text) 단색 pill — v2 §1: 원소색과 경쟁하지 않는 유일 primary fill
const cta: React.CSSProperties = {
  width: '100%', minHeight: 48, padding: '15px 18px', borderRadius: 'var(--radius-pill)', border: 0, cursor: 'pointer',
  fontSize: 16, fontWeight: 600, color: '#fff', background: 'var(--color-text)', boxShadow: 'var(--shadow-fab)',
  transition: 'transform var(--motion-press)',
};
