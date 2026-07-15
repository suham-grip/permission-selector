// 샘플(가짜) 데이터 — 원피스풍 해적단 행정 시스템 가정. 실제 회사 데이터는 gitignore 처리되는
// helpTexts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const HELP_TEXTS = {
  "permissions": {
    "p_crew_haki_grade_edit": "[[패기]] 등급 변경은 선단장 승인이 필요합니다",
    "p_role_matrix_edit": "[[권한 매트릭스]] 수정은 선단장 승인을 거쳐야 합니다",
    "p_bounty_intel_view": "기밀 현상금 정보 열람은 정보국장 승인이 필요합니다",
    "p_vault_withdraw": "[[베리]] 금고 출금은 회계 담당자 승인이 필요합니다",
    "p_climatect_calibrate": "[[클라이마텍트]] 출력 보정은 기관사 승인이 필요합니다",
    "p_agent_view": "첩보원 신상 정보 조회는 정보국장 승인이 필요합니다"
  },
  "permissionNames": {},
  "menuOverrides": {
    "m_route_logpose": {
      "p_logpose_calibrate": "이 메뉴에서 [[로그포스]]를 재설정하면 다음 섬 도착 전까지 되돌릴 수 없습니다"
    }
  },
  "menuTitles": {},
  "menuDescriptions": {
    "m_crew_roster": "선원 명부와 각자의 [[패기]] 각성 여부, 소속 [[해적기]]를 관리하는 페이지",
    "m_crew_haki": "선원들의 [[패기]] 수련 등급(견문색/무장색/패왕색)을 기록하는 페이지",
    "m_crew_role_matrix": "선원 보직별 [[권한 매트릭스]]를 확인·수정하는 페이지",
    "m_bounty_intel": "정보국에서만 열람 가능한 기밀 현상금 정보([[현상금 원장]])를 확인하는 페이지",
    "m_route_logpose": "[[로그포스]]가 가리키는 다음 섬 좌표를 설정하는 페이지",
    "m_route_deadend": "[[데드엔드 항로]]의 위험 구간과 우회로를 관리하는 페이지",
    "m_route_chart": "[[에테르날폰스]] 원본 해도를 열람·수정하는 페이지",
    "m_comm_snail": "선단 간 통신에 사용하는 [[덴덴무시]] 개체를 등록·관리하는 페이지",
    "m_comm_log": "[[덴덴무시]]로 주고받은 통화 기록을 조회하는 페이지",
    "m_treasury_vault": "선단의 공동 자금인 [[베리]]를 보관하는 금고 잔액을 관리하는 페이지",
    "m_treasury_distribution": "임무 완수 후 선원들에게 지급할 분배금([[베리]])을 처리하는 페이지",
    "m_ship_climatect": "[[클라이마텍트]]로 인공 기상을 발생시켜 항해를 돕는 장비를 관리하는 페이지",
    "m_ship_weapon": "선박에 탑재된 [[그랑 캐논]] 등 무장 설정을 관리하는 페이지",
    "m_intel_agent": "각 섬에 파견된 첩보원의 [[정보국 코드명]]과 신상을 관리하는 페이지"
  }
}
