// 여행 요약 회귀 테스트. 실행: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeTrip, tripDays, isRegional } from './summary';
import type { ItineraryState } from '../../types/itinerary';

const item = (contentId: string, region: string, element: ItineraryState['items'][0]['element']) =>
  ({ contentId, name: contentId, region, element, day: 1 });

describe('tripDays — 시작·종료 포함 일수', () => {
  test('같은 날이면 1일', () => assert.equal(tripDays('2026-09-18', '2026-09-18'), 1));
  test('09-18 ~ 09-21 → 4일', () => assert.equal(tripDays('2026-09-18', '2026-09-21'), 4));
  test('월 경계를 넘어도 맞는다', () => assert.equal(tripDays('2026-08-30', '2026-09-02'), 4));
  test('윤일 포함', () => assert.equal(tripDays('2028-02-28', '2028-03-01'), 3));
  test('날짜 미설정 / 역순 / 깨진 값은 0', () => {
    assert.equal(tripDays('', '2026-09-21'), 0);
    assert.equal(tripDays('2026-09-21', '2026-09-18'), 0);
    assert.equal(tripDays('nope', '2026-09-21'), 0);
  });
});

describe('isRegional — 수도권의 여집합', () => {
  for (const r of ['서울특별시', '경기도', '인천광역시', 'Seoul', 'Gyeonggi', 'Incheon'])
    test(`${r} → 수도권`, () => assert.equal(isRegional(r), false));
  for (const r of ['강원특별자치도', '경상북도', '전남', '제주', 'Gangwon'])
    test(`${r} → 지방`, () => assert.equal(isRegional(r), true));
  test('빈 문자열은 판정 불가 → false (지방으로 세지 않는다)', () => assert.equal(isRegional(''), false));
});

describe('summarizeTrip', () => {
  const state: ItineraryState = {
    start: '2026-09-18', end: '2026-09-21',
    items: [
      item('a', '강원특별자치도', 'wood'),
      item('b', '서울특별시', 'water'),
      item('c', '경상북도', 'wood'),
      item('d', '전라남도', null),
    ],
  };

  test('체크인한 것만 센다', () => {
    const s = summarizeTrip(state, (id) => ['a', 'b'].includes(id));
    assert.equal(s.planned, 4);
    assert.equal(s.visited, 2);
  });

  test('지방은 체크인한 곳 중에서만 — 서울은 빠진다', () => {
    const s = summarizeTrip(state, (id) => ['a', 'b'].includes(id));
    assert.equal(s.regional, 1); // 강원만
  });

  test('채운 기운은 원소별로 누적, 원소 없는 항목은 어디에도 안 들어간다', () => {
    const s = summarizeTrip(state, () => true);
    assert.deepEqual(s.byElement, { wood: 2, fire: 0, earth: 0, water: 1, metal: 0 });
    assert.equal(s.visited, 4); // 원소 없는 d도 방문 수에는 포함
  });

  test('아무것도 체크인 안 하면 전부 0, planned만 남는다', () => {
    const s = summarizeTrip(state, () => false);
    assert.equal(s.visited, 0);
    assert.equal(s.regional, 0);
    assert.deepEqual(s.byElement, { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 });
    assert.equal(s.planned, 4);
  });

  test('빈 일정', () => {
    const s = summarizeTrip({ start: '', end: '', items: [] }, () => true);
    assert.deepEqual(s, { days: 0, planned: 0, visited: 0, regional: 0, byElement: { wood: 0, fire: 0, earth: 0, water: 0, metal: 0 } });
  });
});
