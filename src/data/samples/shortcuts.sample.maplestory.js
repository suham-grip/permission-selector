// 샘플(가짜) 데이터 — 옛날 온라인 게임 GM/운영 도구 가정. 실제 회사 데이터는 gitignore 처리되는
// shortcuts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const SHORTCUTS = {
  "m_char_status": [
    { "label": "조회", "menus": [], "perms": ["p_char_stat_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_char_stat_view", "p_char_stat_reset"],
      "cascades": ["m_char_ability:전체"],
      "desc": "능력치+어빌리티 전체 권한을 한 번에 선택"
    }
  ],
  "m_char_ability": [
    { "label": "조회", "menus": [], "perms": ["p_char_ability_view"] },
    { "label": "전체", "menus": [], "perms": ["p_char_ability_view", "p_char_ability_edit"] }
  ],
  "m_item_enchant": [
    { "label": "조회", "menus": [], "perms": ["p_item_enchant_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_item_enchant_view", "p_item_enchant_edit", "p_item_enchant_reroll"],
      "desc": "강화 확률 조정, 잠재능력 리롤까지 포함하는 결재 필요 권한"
    }
  ],
  "m_cash_grant": [
    { "label": "조회", "menus": [], "perms": ["p_cash_grant_view"] },
    { "label": "처리", "menus": [], "perms": ["p_cash_grant_view", "p_cash_grant_process"] }
  ],
  "m_server_status": [
    { "label": "조회", "menus": [], "perms": ["p_server_status_view"] }
  ],
  "m_mod_sanction": [
    { "label": "조회", "menus": [], "perms": ["p_mod_sanction_view"] },
    {
      "label": "정지 처리",
      "menus": [],
      "perms": ["p_mod_sanction_view", "p_mod_sanction_ban"],
      "desc": "정지 해제 권한은 별도 신청 필요"
    }
  ],
  "m_admin_role_list": [
    { "label": "조회", "menus": [], "perms": ["p_admin_role_view"] },
    { "label": "수정", "menus": [], "perms": ["p_admin_role_view", "p_admin_role_edit"] }
  ],
  "m_event_field": [
    { "label": "조회", "menus": [], "perms": ["p_event_field_view"] },
    { "label": "운영", "menus": [], "perms": ["p_event_field_view", "p_event_field_edit"] }
  ],
  "m_map_info": [
    { "label": "조회", "menus": [], "perms": ["p_map_info_view"] }
  ],
  "m_job_balance": [
    { "label": "조회", "menus": [], "perms": ["p_job_balance_view"] },
    { "label": "전체", "menus": [], "perms": ["p_job_balance_view", "p_job_balance_edit"] }
  ],
  "m_job_hyper": [
    { "label": "조회", "menus": [], "perms": ["p_job_hyper_view"] }
  ]
}
