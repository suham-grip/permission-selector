// 샘플(가짜) 데이터 — 원피스풍 해적단 행정 시스템 가정. 실제 회사 데이터는 gitignore 처리되는
// shortcuts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const SHORTCUTS = {
  "m_crew_roster": [
    { "label": "조회", "menus": [], "perms": ["p_crew_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_crew_view", "p_crew_edit", "p_crew_haki_grade_edit"],
      "cascades": ["m_crew_haki:전체"],
      "desc": "선원 명부 전체 권한과 패기 수련 기록 전체 권한을 한 번에 선택"
    }
  ],
  "m_crew_haki": [
    { "label": "조회", "menus": [], "perms": ["p_haki_view"] },
    { "label": "전체", "menus": [], "perms": ["p_haki_view", "p_haki_edit"] }
  ],
  "m_bounty_board": [
    { "label": "조회", "menus": [], "perms": ["p_bounty_view"] },
    { "label": "전체", "menus": [], "perms": ["p_bounty_view", "p_bounty_edit"] }
  ],
  "m_route_logpose": [
    { "label": "조회", "menus": [], "perms": ["p_logpose_view"] }
  ],
  "m_route_deadend": [
    { "label": "조회", "menus": [], "perms": ["p_deadend_view"] }
  ],
  "m_treasury_vault": [
    { "label": "조회", "menus": [], "perms": ["p_vault_view"] }
  ],
  "m_treasury_ledger": [
    { "label": "조회", "menus": [], "perms": ["p_ledger_view"] },
    { "label": "수정", "menus": [], "perms": ["p_ledger_view", "p_ledger_edit"] }
  ],
  "m_ship_hull": [
    { "label": "조회", "menus": [], "perms": ["p_hull_view"] }
  ]
}
