// 오로라 배경 — 페이지 뒤 고정 블롭. 각 화면 최상단에 한 번 렌더.
export function Aurora() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <span className="blob b1" />
      <span className="blob b2" />
      <span className="blob b3" />
      <span className="blob b4" />
    </div>
  );
}
