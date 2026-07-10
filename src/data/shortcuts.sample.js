// 샘플(가짜) 데이터 — 게이밍 장비 회사 가정. 실제 회사 데이터는 gitignore 처리되는
// shortcuts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const SHORTCUTS = {
  "m_mouse_spec": [
    { "label": "조회", "menus": [], "perms": ["p_mouse_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_mouse_view", "p_mouse_edit", "p_mouse_switch_approve", "p_mouse_sensor_edit"],
      "cascades": ["m_kb_spec:전체"],
      "desc": "마우스+키보드 스펙 전체 권한을 한 번에 선택"
    }
  ],
  "m_mouse_packaging": [
    { "label": "조회", "menus": [], "perms": ["p_packaging_view"] }
  ],
  "m_kb_spec": [
    { "label": "조회", "menus": [], "perms": ["p_kb_view"] },
    { "label": "전체", "menus": [], "perms": ["p_kb_view", "p_kb_edit", "p_kb_rt_config", "p_kb_hotswap_edit"] }
  ],
  "m_kb_keycap": [
    { "label": "조회", "menus": [], "perms": ["p_keycap_view"] }
  ],
  "m_headset_spec": [
    { "label": "조회", "menus": [], "perms": ["p_headset_view"] }
  ],
  "m_webcam_spec": [
    { "label": "조회", "menus": [], "perms": ["p_webcam_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_webcam_view", "p_webcam_edit", "p_webcam_focus_calibrate"],
      "desc": "오토포커스 보정 승인 권한까지 포함"
    }
  ],
  "m_chair_spec": [
    { "label": "조회", "menus": [], "perms": ["p_chair_view"] }
  ],
  "m_cs_rma": [
    {
      "label": "기본 처리",
      "menus": [],
      "perms": ["p_rma_view", "p_rma_process"],
      "desc": "개인정보 조회 권한 없이 접수/처리만"
    }
  ],
  "m_cs_notice": [
    {
      "label": "확인",
      "menus": [],
      "perms": [],
      "desc": "공지 메뉴만 확인용으로 선택 (상세 권한 없음)"
    }
  ],
  "m_admin_role_list": [
    { "label": "조회", "menus": [], "perms": ["p_role_view"] },
    { "label": "수정", "menus": [], "perms": ["p_role_view", "p_role_edit"] }
  ],
  "m_admin_log": [
    {
      "label": "확인",
      "menus": [],
      "perms": [],
      "desc": "메뉴 접근 권한만 부여, 로그 조회는 별도 신청 필요"
    }
  ],
  "m_order_order": [
    { "label": "조회", "menus": [], "perms": ["p_order_view"] },
    { "label": "처리", "menus": [], "perms": ["p_order_view", "p_order_cancel"] }
  ],
  "m_order_return": [
    { "label": "조회", "menus": [], "perms": ["p_return_view"] },
    { "label": "처리", "menus": [], "perms": ["p_return_view", "p_return_process"] }
  ],
  "m_marketing_event": [
    { "label": "조회", "menus": [], "perms": ["p_event_view"] },
    { "label": "운영", "menus": [], "perms": ["p_event_view", "p_event_edit"] }
  ],
  "m_finance_settlement": [
    { "label": "조회", "menus": [], "perms": ["p_settlement_view"] }
  ]
}
