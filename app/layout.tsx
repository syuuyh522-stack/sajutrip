import type { Metadata, Viewport } from 'next';
import { LanguageProvider } from '../i18n/LanguageProvider';
import { ItineraryProvider } from '../i18n/ItineraryProvider';
import { ProfileProvider } from '../i18n/ProfileProvider';
import { DEFAULT_LOCALE } from '../i18n/dictionaries';
// 폰트 셀프호스팅(§2.1) — CDN 미사용, 번들 서빙. Pretendard=dynamic subset(KR 분할 로딩).
import 'pretendard/dist/web/static/pretendard-dynamic-subset.css';
import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'SajuTrip',
  description: 'Travel Korea by the elements you are missing.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  // 초기 lang은 기본 로케일. 클라이언트에서 로케일 변경 시 LanguageProvider가 갱신.
  // modal = @modal 병렬 슬롯 — PDP 인터셉트 라우트가 매칭되면 children(배경 페이지) 위에 바텀시트로 덮인다(PO 피드백 #6).
  return (
    <html lang={DEFAULT_LOCALE}>
      <body>
        <LanguageProvider>
          <ProfileProvider>
            <ItineraryProvider>
              {children}
              {modal}
            </ItineraryProvider>
          </ProfileProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
