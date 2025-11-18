// permissions.ts
export const PERMS = {
  DASHBOARD_VIEW:      "dashboard_view",

  STUDENTS_LIST:       "students_list",
  STUDENTS_APPROVE:    "students_approve",

  COMPANY_LIST:        "company_list",
  COMPANY_ADD:         "company_add",
  COMPANY_DELETE:      "company_delete",
  COMPANY_EDIT:        "company_edit",

  JOB_LIST:            "job_list",
  JOB_ADD:             "job_add",
  JOB_DELETE:          "job_delete",
  JOB_EDIT:            "job_edit",

  NOTICE_LIST:         "notice_list",
  NOTICE_ADD:          "notice_add",
  NOTICE_DELETE:       "notice_delete",

  TPO_LIST:            "tpo_list",
  TPO_ADD:             "tpo_add",
  TPO_DELETE:          "tpo_delete",
} as const;


export const ROLES = {
    TPO_ADMIN : 
        "tpo_admin"
    ,
    MANAGEMENT_ADMIN : 
        "management_admin"
    
}

export type Roles = typeof ROLES[keyof typeof ROLES]
export type Permission = typeof PERMS[keyof typeof PERMS];
