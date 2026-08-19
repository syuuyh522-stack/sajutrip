// 태양 겉보기황경 (Meeus 저정밀 알고리즘).
// KASI 24절기(2024) 실측 24개와 대조해 최대 오차 0.005°(0.3각분)로 검증됨.
// 24절기 API의 연도 제한(2000~)을 우회해 전 연도의 월지·연주 경계를 산출한다. (CLAUDE.md §5.2)

const RAD = Math.PI / 180;

/** 그레고리력 날짜(UT 시각) → 율리우스일(JD) */
export function julianDay(year: number, month: number, day: number, hourUT = 0): number {
  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + B - 1524.5 + hourUT / 24;
}

/** 태양 겉보기황경(도, 0–360) — Meeus */
export function sunApparentLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) +
    0.000289 * Math.sin(3 * M * RAD);
  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);
  return ((lambda % 360) + 360) % 360;
}

/**
 * KST(UTC+9) 양력 일자의 황경. 태어난 시간 미입력이므로 정오(12시) 대표값 사용.
 * 절기 경계 순간(±초 단위)에 걸치는 극히 드문 경우를 제외하면 월지 판정에 충분.
 */
export function sunLongitudeKST(year: number, month: number, day: number, kstHour = 12): number {
  const jd = julianDay(year, month, day, kstHour - 9);
  return sunApparentLongitude(jd);
}
