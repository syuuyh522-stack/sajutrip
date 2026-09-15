// 인터셉트 라우트 — explore·search·result에서 Link로 /place/[contentId]에 들어올 때만 매칭된다.
// 배경 페이지(이전 라우트)는 그대로 마운트된 채로 남고, 이 모달이 그 위에 바텀시트로 덮인다(PO 피드백 #6).
// 새로고침·직접 진입은 이 슬롯이 매칭되지 않고 app/place/[contentId]/page.tsx(mode="page")가 렌더된다.
import { PlaceDetail } from '../../../../components/PlaceDetail';

export default function PlaceModal() {
  return <PlaceDetail mode="modal" />;
}
