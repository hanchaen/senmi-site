# SENMI 상품 인터랙션 구현 프롬프트

다음 요구사항을 `hanchaen/senmi-site`의 기존 디자인과 개인정보 원칙을 유지하며 구현한다.

## 범위

1. 상품 옵션
   - 애플 리셋 패치 1개: 28,000원, `item_variant=1_pack`
   - 애플 리셋 패치 2개: 44,800원, `item_variant=2_pack`
   - 2개 구성은 정상가 56,000원 대비 20% 할인으로 표시한다.
   - 상품명은 `Apple Reset Patch (60매)`로 표시한다.
   - 옵션 선택 전에는 Add To Cart를 실행하지 않고 안내 문구를 표시한다.
   - 옵션 선택 시 상단 가격과 TOTAL을 갱신하고 GA4 `select_item` 이벤트를 준비한다.
   - 수량 `− / +` 컨트롤을 제공하고 TOTAL을 `옵션 가격 × 수량`으로 계산한다.
   - 검은색 CTA 문구는 `구매하기`로 표시하고 장바구니로 이동한다.
2. 장바구니
   - Add To Cart 시 선택 옵션을 `sessionStorage`에 저장하고 `cart.html`로 이동한다.
   - 같은 옵션을 다시 담으면 수량을 증가시킨다.
   - 장바구니에서 구성, 단가, 수량, 합계를 보여준다.
   - 수량 증감, 삭제, 쇼핑 계속하기, 소식 신청 기능을 제공한다.
   - `add_to_cart`, `view_cart`, `remove_from_cart`, `cart_quantity_update` 이벤트를 준비한다.
   - 주문서, 배송 정보, 결제, `purchase`는 구현하지 않는다.
3. FAQ
   - 질문을 버튼으로 만들고 클릭 시 답변을 펼치거나 접는다.
   - `aria-expanded`, `aria-controls`를 적용한다.
   - `faq_open`, `faq_close` 이벤트를 준비한다.
4. 후기
   - 기존 후기 카드 전체를 키보드로도 접근 가능한 버튼으로 만든다.
   - 클릭 시 이미지와 후기 문구가 표시되는 모달을 연다.
   - 이전/다음, 닫기, 배경 클릭, Escape를 지원한다.
   - `select_content`, `review_navigate`, `review_modal_close` 이벤트를 준비한다.
5. 분석 및 개인정보
   - GA4 Measurement ID는 하드코딩하지 않는다.
   - `window.senmiTrack` 공통 함수를 사용하고, `gtag`이 연결된 경우에만 전송한다.
   - 이름, 이메일 및 사용자 입력값은 분석 이벤트에 포함하지 않는다.
6. 검증
   - 모바일과 데스크톱에서 레이아웃이 깨지지 않아야 한다.
   - 옵션 미선택, 빈 장바구니, 수량 변경, 삭제, FAQ 토글, 후기 모달을 검증한다.

