// 사주 산출 회귀 테스트 (CLAUDE.md §5.2).
// 기대값은 코드 출력이 아니라 명리 규칙·공개 만세력에서 독립적으로 가져왔다.
// 실행: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { dayPillar, pillarFromSexagenary } from './day-pillar';
import { yearPillar, sajuYearNumber } from './year-pillar';
import { monthPillar, monthStem, monthIndexFromLongitude } from './month-pillar';
import { hourPillar } from './hour-pillar';
import { elementDistribution, deficientElement, excessElement } from './distribution';
import type { HeavenlyStem, SajuProfile } from '../../types/saju';

const ganji = (p: { stem: string; branch: string }) => `${p.stem}${p.branch}`;

describe('일주 — 60갑자 연속 카운트', () => {
  // 기준일 두 개가 서로 독립이며 일치한다:
  // 1996-07-22 庚申(코드 주석의 KASI 실호출 검증값)에서 1258일 뒤가 2000-01-01이고,
  // (56 + 1258) mod 60 = 54 = 戊午 — 공개 만세력의 2000-01-01 일진과 같다.
  test('1996-07-22 → 庚申 (KASI 일진)', () => {
    assert.equal(ganji(dayPillar(1996, 7, 22)), '庚申');
  });

  test('2000-01-01 → 戊午 (만세력)', () => {
    assert.equal(ganji(dayPillar(2000, 1, 1)), '戊午');
  });

  test('하루 지나면 60갑자가 정확히 한 칸 전진', () => {
    const idx = (y: number, m: number, d: number) => {
      const p = dayPillar(y, m, d);
      for (let i = 0; i < 60; i++) if (ganji(pillarFromSexagenary(i)) === ganji(p)) return i;
      throw new Error('60갑자에 없는 간지');
    };
    assert.equal(idx(2000, 1, 2), (idx(2000, 1, 1) + 1) % 60);
    // 월·연 경계에서도 끊기지 않아야 한다
    assert.equal(idx(2000, 3, 1), (idx(2000, 2, 29) + 1) % 60); // 윤일
    assert.equal(idx(2001, 1, 1), (idx(2000, 12, 31) + 1) % 60);
  });

  test('60일 뒤에는 같은 간지로 돌아온다', () => {
    assert.equal(ganji(dayPillar(2000, 3, 1)), ganji(dayPillar(2000, 1, 1 + 60))); // 2000-03-01
  });
});

describe('연주 — 입춘 경계 (설날 아님)', () => {
  test('1996-07-22 → 丙子 (KASI 세차)', () => {
    assert.equal(ganji(yearPillar(1996, 7, 22)), '丙子');
  });

  // 1990년 입춘은 2월 4일. 그 전은 1989년(己巳), 그 후는 1990년(庚午).
  test('입춘 전날은 아직 전년 간지', () => {
    assert.equal(ganji(yearPillar(1990, 2, 3)), '己巳');
  });

  test('입춘 다음날은 새해 간지', () => {
    assert.equal(ganji(yearPillar(1990, 2, 5)), '庚午');
  });

  test('1월생은 언제나 전년 간지', () => {
    assert.equal(ganji(yearPillar(1990, 1, 15)), '己巳');
    assert.equal(sajuYearNumber(1990, 1, 15), 1989);
  });

  test('전환은 2월 초에 딱 한 번만 일어난다', () => {
    const years = Array.from({ length: 10 }, (_, i) => sajuYearNumber(1990, 2, i + 1));
    const flips = years.filter((y, i) => i > 0 && y !== years[i - 1]).length;
    assert.equal(flips, 1, '입춘 경계는 한 번뿐이어야 한다');
    assert.equal(years[0], 1989);
    assert.equal(years[9], 1990);
  });
});

describe('월주 — 월두법(五虎遁)', () => {
  // 甲己年丙作首 · 乙庚年戊爲頭 · 丙辛必尋庚起 · 丁壬壬位順行流 · 戊癸甲寅好追求
  const 五虎遁: Record<string, string> = {
    甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚',
    辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲',
  };

  for (const [yearStem, expected] of Object.entries(五虎遁)) {
    test(`${yearStem}년 → 寅월 천간 ${expected}`, () => {
      assert.equal(monthStem(yearStem as HeavenlyStem, 0), expected);
    });
  }

  test('월지는 입춘 315°에서 寅월로 시작해 30°씩', () => {
    assert.equal(monthIndexFromLongitude(315), 0); // 입춘 → 寅
    assert.equal(monthIndexFromLongitude(345), 1); // 경칩 → 卯
    assert.equal(monthIndexFromLongitude(0), 1); //   춘분은 卯월 안
    assert.equal(monthIndexFromLongitude(120), 5); // 소서 → 未
    assert.equal(monthIndexFromLongitude(285), 11); // 소한 → 丑
  });

  test('1996-07-22(丙년) → 乙未 (황경 ~120° 未월, 丙년 庚寅頭)', () => {
    assert.equal(ganji(monthPillar(1996, 7, 22, '丙')), '乙未');
  });
});

describe('시주 — 오자시두법(五鼠遁)', () => {
  // 甲己還加甲 · 乙庚丙作初 · 丙辛從戊起 · 丁壬庚子居 · 戊癸壬子是眞途
  const 五鼠遁: Record<string, string> = {
    甲: '甲', 己: '甲', 乙: '丙', 庚: '丙', 丙: '戊',
    辛: '戊', 丁: '庚', 壬: '庚', 戊: '壬', 癸: '壬',
  };

  for (const [dayStem, expected] of Object.entries(五鼠遁)) {
    test(`${dayStem}일 자시 → ${expected}子`, () => {
      assert.equal(ganji(hourPillar(dayStem as HeavenlyStem, 0)), `${expected}子`);
    });
  }

  test('23시는 자시 (子가 23~01시를 걸친다)', () => {
    assert.equal(hourPillar('甲', 23).branch, '子');
    assert.equal(hourPillar('甲', 0).branch, '子');
  });

  test('2시간 단위로 지지가 넘어간다', () => {
    assert.equal(hourPillar('甲', 1).branch, '丑'); // 01~03
    assert.equal(hourPillar('甲', 2).branch, '丑');
    assert.equal(hourPillar('甲', 3).branch, '寅'); // 03~05
    assert.equal(hourPillar('甲', 12).branch, '午'); // 11~13
  });
});

describe('오행 분포', () => {
  const profile: SajuProfile = {
    year: { stem: '丙', branch: '子' },
    month: { stem: '乙', branch: '未' },
    day: { stem: '庚', branch: '申' },
  };

  test('시주 없으면 6글자, 있으면 8글자', () => {
    const sum = (d: Record<string, number>) => Object.values(d).reduce((a, b) => a + b, 0);
    assert.equal(sum(elementDistribution(profile)), 6);
    assert.equal(sum(elementDistribution({ ...profile, hour: { stem: '甲', branch: '子' } })), 8);
  });

  test('결핍·과잉은 실제 최소·최대와 일치', () => {
    const dist = elementDistribution(profile);
    const values = Object.values(dist);
    assert.equal(dist[deficientElement(dist)], Math.min(...values));
    assert.equal(dist[excessElement(dist)], Math.max(...values));
  });

  test('동점이면 ELEMENT_PRIORITY(목·화·토·금·수) 순으로 고른다', () => {
    const flat = { wood: 2, fire: 2, earth: 2, water: 2, metal: 2 } as const;
    assert.equal(deficientElement({ ...flat }), 'wood');
    assert.equal(excessElement({ ...flat }), 'wood');
  });
});
