// 샘플(가짜) 데이터 — 평범한 일반 회사(인사/재무/영업/IT/총무) 가정. 실제 회사 데이터는
// gitignore 처리되는 shortcuts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const SHORTCUTS = {
  "m_hr_profile": [
    { "label": "조회", "menus": [], "perms": ["p_hr_profile_view"] }
  ],
  "m_hr_payroll_pay": [
    { "label": "조회", "menus": [], "perms": ["p_payroll_view"] },
    { "label": "처리", "menus": [], "perms": ["p_payroll_view", "p_payroll_process"] }
  ],
  "m_hr_appointment": [
    { "label": "조회", "menus": [], "perms": ["p_appointment_view"] },
    {
      "label": "전체",
      "menus": [],
      "perms": ["p_appointment_view", "p_appointment_edit"],
      "cascades": ["m_hr_profile:조회"],
      "desc": "인사 발령 전체 권한 + 인사 정보 조회 권한을 함께 선택"
    }
  ],
  "m_finance_expense": [
    { "label": "조회", "menus": [], "perms": ["p_expense_view"] },
    { "label": "신청", "menus": [], "perms": ["p_expense_view", "p_expense_request"] }
  ],
  "m_sales_contract": [
    { "label": "조회", "menus": [], "perms": ["p_contract_view"] },
    {
      "label": "승인",
      "menus": [],
      "perms": ["p_contract_view", "p_contract_approve"],
      "desc": "결재라인 승인 권한까지 포함"
    }
  ],
  "m_it_account_admin": [
    { "label": "조회", "menus": [], "perms": ["p_admin_account_view"] },
    { "label": "전체", "menus": [], "perms": ["p_admin_account_view", "p_admin_account_edit"] }
  ],
  "m_it_account_log": [
    {
      "label": "확인",
      "menus": [],
      "perms": [],
      "desc": "메뉴 접근 권한만 부여, 로그 조회는 별도 신청 필요"
    }
  ],
  "m_legal_review": [
    { "label": "조회", "menus": [], "perms": ["p_legal_review_view"] },
    { "label": "요청", "menus": [], "perms": ["p_legal_review_view", "p_legal_review_request"] }
  ]
}
