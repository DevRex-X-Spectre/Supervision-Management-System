export const INSTITUTION = {
  name: "Nigerian Army University Biu",
  shortName: "NAUB",
  systemName: "NAUB Prism",
  tagline: "Interactive Research Supervision System",
  fullTitle: "NAUB Prism | Research Supervision",
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 border-amber-200",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  REJECTED: "bg-red-100 text-red-900 border-red-200",
  NEEDS_REVISION: "bg-orange-100 text-orange-900 border-orange-200",
};

export const MILESTONE_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-sky-100 text-sky-900 border-sky-200",
  SUBMITTED: "bg-violet-100 text-violet-900 border-violet-200",
  APPROVED: "bg-emerald-100 text-emerald-900 border-emerald-200",
  OVERDUE: "bg-red-100 text-red-900 border-red-200",
};
