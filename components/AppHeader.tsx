'use client';

// 앱 셸 헤더 — 주요 화면 상단에 고정 (PO 1-d·2-b·3-2-1).
// PO 지적: "탭별 헤더가 없으니 서비스 같지가 않음. 헤더 대신 Back 경로를 제공하니 더 웹사이트 같음."
// 좌: 로고(항상 같은 자리에서 '지금 이 앱'을 알려주는 유일한 고정 요소)
// 우: 언어 전환(작게 — PO 2-b-2)
// 로고는 링크가 아니다. 누르면 생년월일 입력 화면으로 튀어 오히려 흐름이 끊긴다.
//
// main의 패딩(24px 22px)을 음수 마진으로 상쇄해 바가 화면 폭을 꽉 채우게 한다.
import { LanguageSwitch } from './LanguageSwitch';

export function AppHeader() {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        margin: '-24px -22px 18px',
        padding: '9px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        minHeight: 52,
        background: 'rgba(255,255,255,.82)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(185,180,199,.28)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 19, fontWeight: 600, letterSpacing: '-0.2px' }}>
        SajuTrip
      </span>
      <LanguageSwitch compact />
    </header>
  );
}
