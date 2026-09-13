// 계측 이벤트 정의 (CLAUDE.md §8.4). 퍼널·전환을 익명 세션 기준으로 추적.
// POC: 서버 콘솔 로그(sendBeacon → /api/track). Phase 2에서 GA4 등으로 교체.

/** 퍼널·NorthStar 이벤트명 */
export type EventName =
  | 'landing_view' //        랜딩 진입
  | 'saju_submit' //         성별·생년월일 입력 완료
  | 'result_view' //         사주 결과 조회
  | 'explore_view' //        추천 탐색 진입
  | 'pdp_view' //            장소 상세 조회
  | 'plan_add' //            일정 담기
  | 'plan_complete' //       일정 완성(공유로 이동) — 지방 포함이면 NorthStar
  | 'share_action' //        공유/저장
  | 'checkin' //             여행 중 체크인
  | 'nav_tab_click' //       GNB 탭 클릭 (tab·stage) — 바텀 네비 유지/축소 판단 근거
  | 'video_click'; //        여행자 영상(유튜브) 외부 클릭

export interface TrackEvent {
  name: EventName;
  /** 익명 세션 id (비로그인 퍼널 추적, §8.4) */
  sid: string;
  ts: number;
  props?: Record<string, string | number | boolean | null>;
}

/** NorthStar: 지방 포함 완성 일정 (§8.1). plan_complete + regionalIncluded=true */
export function isNorthStar(e: TrackEvent): boolean {
  return e.name === 'plan_complete' && e.props?.regionalIncluded === true;
}
