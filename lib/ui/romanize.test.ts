// 장소명 영문 표기 회귀 테스트. 실행: npm test
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { translatePlaceName, displayName, romanizeKorean } from './romanize';

describe('translatePlaceName — 유형어는 번역, 고유명만 로마자', () => {
  const cases: [string, string][] = [
    // PO 제보 케이스
    ['국립 신불산폭포자연휴양림', 'Sinbulsan Falls National Recreation Forest'],
    // 외래어가 음차되던 케이스 — 여기가 가장 심했다(랜드→Raendeu)
    ['강변스파랜드', 'Gangbyeon Spa Land'],
    // 설립 주체 접두 + 유형어
    ['국립김천치유의숲', 'Gimcheon National Healing Forest'],
    // 유형어 한 겹
    ['가곡유황온천', 'Gagokyuhwang Hot Springs'],
    // 유형어 사이에 구분기호가 끼어도 둘 다 잡아야 한다
    ['가곡유황온천&스파', 'Gagokyuhwang Hot Springs Spa'],
    ['태화강국가정원', 'Taehwagang National Garden'],
  ];
  for (const [ko, en] of cases) test(`${ko} → ${en}`, () => assert.equal(translatePlaceName(ko), en));

  test('유형어가 없으면 기존대로 전체 로마자', () => {
    assert.equal(translatePlaceName('불국사'), romanizeKorean('불국사'));
  });

  test('유형어만으로 된 이름은 고유명이 없어 로마자로 둔다', () => {
    // 잘라내면 남는 게 없어 "Hot Springs"만 되고 어느 온천인지 사라진다
    assert.equal(translatePlaceName('온천'), romanizeKorean('온천'));
  });

  test('긴 유형어가 짧은 것보다 먼저 매칭된다 (자연휴양림 vs 휴양림)', () => {
    assert.match(translatePlaceName('앵무산자연휴양림'), /Recreation Forest$/);
    assert.equal(translatePlaceName('앵무산자연휴양림').includes('Natural'), false);
  });
});

describe('displayName — 로케일 분기', () => {
  test('ko는 원문 그대로', () => {
    assert.deepEqual(displayName('강변스파랜드', 'ko'), { primary: '강변스파랜드' });
  });
  test('en은 번역 + 한글 병기', () => {
    assert.deepEqual(displayName('강변스파랜드', 'en'), { primary: 'Gangbyeon Spa Land', hangul: '강변스파랜드' });
  });
  test('이미 라틴 문자가 섞인 병기형은 건드리지 않는다', () => {
    const n = 'APAP Artwork Tour (APAP 작품투어)';
    assert.deepEqual(displayName(n, 'en'), { primary: n });
  });
});
