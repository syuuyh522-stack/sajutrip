// F-4 PDP — 직접 진입/새로고침/딥링크 폴백. 내부는 탐색 흐름과 공유하는 <PlaceDetail>(components/).
// explore·search·result에서 Link로 진입할 때는 app/@modal/(.)place/[contentId]가 이 라우트를 가로채
// 배경 페이지를 유지한 채 모달 바텀시트로 띄운다 — 이 파일은 그 인터셉트가 없을 때만 렌더된다.
import { PlaceDetail } from '../../../components/PlaceDetail';

export default function PlacePage() {
  return <PlaceDetail mode="page" />;
}
