// 샘플(가짜) 데이터 — 게이밍 장비 회사 가정. 실제 회사 데이터는 gitignore 처리되는
// helpTexts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const HELP_TEXTS = {
  "permissions": {
    "p_mouse_switch_approve": "마우스 [[스위치]] 사양 변경은 QA팀 승인이 필요합니다",
    "p_shipping_addr_edit": "배송지 수정은 개인정보 처리 방침에 따라 결재가 필요합니다",
    "p_webcam_focus_calibrate": "웹캠 [[오토포커스]] 보정값 변경은 QA팀 승인이 필요합니다",
    "p_admin_log_view": "접속 로그에는 개인정보가 포함되어 있어 결재가 필요합니다",
    "p_return_refund": "환불 처리는 회계팀 결재를 거쳐야 최종 승인됩니다"
  },
  "permissionNames": {},
  "menuOverrides": {
    "m_mouse_firmware": {
      "p_mouse_fw_download": "이 메뉴에서는 최신 마우스 펌웨어 바이너리를 다운로드합니다"
    }
  },
  "menuTitles": {},
  "menuDescriptions": {
    "m_mouse_spec": "마우스의 [[스위치]], 센서, [[그립 형태]], 색상 등 제품 스펙을 관리하는 페이지",
    "m_mouse_packaging": "마우스 제품 박스, 완충재 등 패키징 사양을 관리하는 페이지",
    "m_kb_spec": "키보드의 [[스위치]], 배열, 키캡 코팅/형태, [[래피드 트리거]], [[핫스왑]] 여부 등 제품 스펙을 관리하는 페이지",
    "m_kb_keycap": "키보드 키캡 세트의 코팅, 형태(프로파일), 색상 구성을 관리하는 페이지",
    "m_headset_spec": "헤드셋의 드라이버, 마이크, 무선 방식 등 제품 스펙을 관리하는 페이지",
    "m_webcam_spec": "웹캠의 [[화각]], [[오토포커스]], [[프레임레이트]] 등 촬영 스펙을 관리하는 페이지",
    "m_chair_spec": "게이밍 체어의 [[리클라이닝]] 각도, [[요추 지지대]] 등 구조 스펙을 관리하는 페이지",
    "m_cs_rma": "제품 불량·파손에 대한 [[RMA]] 접수 내역을 확인하고 처리하는 페이지",
    "m_cs_notice": "쇼핑몰 상단에 노출되는 긴급 공지를 관리하는 페이지",
    "m_admin_role_matrix": "관리자 그룹별 [[권한 매트릭스]]를 확인·수정하는 페이지",
    "m_admin_log": "관리자 계정의 접속 이력을 조회하는 페이지",
    "m_order_return": "고객 반품 요청을 접수하고 환불을 처리하는 페이지",
    "m_marketing_event": "신제품 출시 이벤트를 등록하고 관리하는 페이지",
    "m_marketing_promotion": "할인 프로모션을 등록하고 관리하는 페이지",
    "m_finance_settlement": "판매처별 정산 내역을 확인하고 처리하는 페이지",
    "m_finance_invoice": "거래처에 발행할 세금계산서를 관리하는 페이지"
  }
}
