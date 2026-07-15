// 샘플(가짜) 데이터 — 평범한 일반 회사(인사/재무/영업/IT/총무) 가정. 실제 회사 데이터는
// gitignore 처리되는 helpTexts.js에 별도로 존재하며, 없을 때만 이 파일이 부트스트랩으로 복사되어 쓰인다.
export const HELP_TEXTS = {
  "permissions": {
    "p_payroll_process": "급여 지급 처리는 재무팀 [[결재라인]] 승인이 필요합니다",
    "p_payroll_detail_view": "급여 상세 내역에는 [[4대보험]], [[원천징수]] 등 개인 급여 정보가 포함되어 결재가 필요합니다",
    "p_appointment_edit": "인사 발령 등록/수정은 인사팀장 결재가 필요합니다",
    "p_expense_approve": "지출 품의 승인은 [[전결규정]]에 따른 결재라인을 거쳐야 합니다",
    "p_contract_approve": "계약서 승인은 법무팀 검토 후 결재라인을 거쳐야 합니다",
    "p_admin_account_edit": "관리자 계정 수정은 [[권한 그룹]] 변경을 포함해 IT팀 결재가 필요합니다",
    "p_access_log_view": "접속 로그에는 개인정보가 포함되어 있어 결재가 필요합니다",
    "p_legal_review_approve": "계약서 검토 완료 승인은 법무팀 결재가 필요합니다"
  },
  "permissionNames": {},
  "menuOverrides": {
    "m_hr_payroll_pay": {
      "p_payroll_process": "이 메뉴에서는 당월 급여 지급 배치를 실행합니다"
    }
  },
  "menuTitles": {},
  "menuDescriptions": {
    "m_hr_payroll_pay": "직원별 급여 지급 내역을 확인하고 당월 지급을 처리하는 페이지",
    "m_hr_payroll_detail": "[[4대보험]], [[원천징수]] 등 개인별 급여 상세 내역을 조회하는 페이지",
    "m_hr_appointment": "부서 이동, 승진 등 인사 발령 내역을 등록하고 관리하는 페이지",
    "m_recruit_applicant": "채용 지원자 목록을 확인하고 [[블라인드 채용]] 기준에 따라 평가하는 페이지",
    "m_finance_budget": "부서별/프로젝트별 예산을 편성하고 집행 현황을 관리하는 페이지",
    "m_finance_expense": "지출 [[품의서]]를 작성하고 [[전결규정]]에 따른 결재라인 승인을 처리하는 페이지",
    "m_sales_opportunity": "영업 기회의 진행 단계와 예상 계약 [[리드타임]]을 관리하는 페이지",
    "m_sales_contract": "고객사와의 계약서를 등록하고 결재라인 승인을 진행하는 페이지",
    "m_it_account_log": "관리자 계정의 접속 이력을 조회하는 페이지",
    "m_it_asset": "사내 [[ERP]] 라이선스를 포함한 IT 장비/자산 현황을 관리하는 페이지",
    "m_legal_review": "부서에서 요청한 계약서 검토 건을 접수하고 처리하는 페이지"
  }
}
