# SENMI GA4 이벤트 설계

실제 판매와 결제가 없는 교육용 사이트이므로 `purchase`와 `begin_checkout`은 전송하지 않는다. 최종 성과는 소식 신청 완료이며, GA4 관리 화면에서는 `generate_lead`만 우선 주요 이벤트로 지정한다.

## 공통 상품 정보

| 파라미터 | 값 |
|---|---|
| `item_id` | `apple_reset_patch` |
| `item_name` | `Apple Reset Patch` |
| `item_brand` | `senmi` |
| `item_category` | `cheek_patch` |
| `currency` | `KRW` |

이름과 이메일 값은 GA4, GTM, Meta Pixel을 포함한 어떤 분석 도구에도 전달하지 않는다.

## 이벤트 표

| 화면/영역 | 사용자 행동 | 이벤트 | 핵심 파라미터 |
|---|---|---|---|
| 상품 | 상품 상세 노출 | `view_item` | `currency`, `value`, `items` |
| 헤더/푸터 | 내비게이션 또는 CTA 클릭 | `select_content` | `content_type`, `content_id`, `placement` |
| 상품 갤러리 | 이미지 1~6 선택 | `select_content` | `content_type: product_image`, `content_id`, `content_position` |
| 상품 | 수량 변경 | `product_quantity_update` | `item_id`, `previous_quantity`, `new_quantity`, `update_method` |
| 상품 | 장바구니 클릭 | `add_to_cart` | `currency`, `value`, `button_type`, `items` |
| 상품 | 구매하기 클릭 | `buy_now_click` | `placement`, `currency`, `value`, `items` |
| 상품 | 구매하기로 장바구니 추가 | `add_to_cart` | `button_type: buy_now`, `currency`, `value`, `items` |
| 후기 | 후기 카드 선택 | `select_content` | `content_type: review`, `content_id`, `content_position` |
| 후기 | 이전/다음 후기 | `review_navigate` | `from_review_id`, `to_review_id`, `direction` |
| 후기 | 모달 닫기 | `review_modal_close` | `content_id`, `close_method` |
| FAQ | 질문 열기/닫기 | `faq_open` / `faq_close` | `faq_id`, `faq_position` |
| 소식 신청 | 최초 입력 | `lead_form_start` | `form_id`, `form_name` |
| 소식 신청 | 제출 시도 | `lead_form_submit_attempt` | `form_id`, `validation_status`, `missing_field_count` |
| 개인정보 | 안내 열기/닫기/확인 | `privacy_notice_open` / `privacy_notice_close` / `privacy_notice_accept` | `modal_mode`, `trigger_location`, `close_method` |
| 개인정보 | 동의 변경 | `privacy_consent_update` | `modal_mode`, `consent_state` |
| 소식 신청 | 정상 완료 | `generate_lead` | `lead_source`, `form_id`, `form_name`, 상품 문맥 |
| 장바구니 | 장바구니 조회 | `view_cart` | `currency`, `value`, `items` |
| 장바구니 | 수량 변경 | `cart_quantity_update` | `item_id`, `previous_quantity`, `new_quantity`, `update_method` |
| 장바구니 | 상품 삭제 | `remove_from_cart` | `currency`, `value`, `items` |
| 장바구니 | 구매 관심 모달 열기 | `purchase_intent` | `item_id`, `quantity`, `currency`, `value`, `placement` |
| 장바구니 | 구매 관심 폼 완료 | `generate_lead` | `lead_source: cart_purchase_interest`, `form_id`, `value`, `quantity` |
| 플로팅 버튼 | 맨 위로 이동 | `select_content` | `content_id: back_to_top`, `placement: floating` |
| 완료 화면 | 처음 화면으로 | `select_content` | `content_id: result_back_home`, `placement: result_page` |

## 주요 이벤트 후보

| 우선순위 | 이벤트 | 운영 권장안 |
|---|---|---|
| 1 | `generate_lead` | 주요 이벤트로 지정. 두 신청 폼의 실제 완료만 발생시킨다. |
| 2 | `add_to_cart` | 구매 의도 보조 지표. 초기에는 일반 이벤트로 유지한다. |
| 3 | `buy_now_click` | CTA 성과 진단용 일반 이벤트로 유지한다. |

`lead_form_submit_attempt`, `purchase_intent`, 완료 페이지 조회는 최종 완료가 아니거나 직접 접근 가능성이 있으므로 주요 이벤트로 지정하지 않는다.

## 검증

URL에 `?ga_debug=1`을 붙이면 이벤트에 `debug_mode: true`가 추가된다. 배포 후 GA4 DebugView에서 이벤트 이름과 파라미터를 확인하고, 이름·이메일이 전송되지 않는지 네트워크 요청도 함께 점검한다.
