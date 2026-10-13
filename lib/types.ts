
export type Gender = "male" | "female";

export type Category = "open" | "obc" | "sc" | "st" | "ews";

export type Qualification =
  | "10th"
  | "12th"
  | "iti"
  | "diploma"
  | "graduate"
  | "post_graduate"
  | "engineering"
  | "law"
  | "medical"
  | "any_graduate";

export type JobType =
  | "government"
  | "private"
  | "contract"
  | "apprenticeship"
  | "internship"
  | "scholarship";

export type JobStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "expired";

export interface VacancyRow {
  post: string;
  category: string;
  count: number;
}

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  organization: string;
  department: string;
  advertisementNumber: string;
  logoUrl?: string;

  totalVacancies: number;
  vacancyBreakdown: VacancyRow[];

  location: {
    state: string;
    district?: string;
    allIndia: boolean;
  };

  eligibility: {
    genders: Gender[];
    categories: Category[];
    qualifications: Qualification[];
    minAge?: number;
    maxAge?: number;
    ageRelaxation?: string;
  };

  jobType: JobType;

  salary?: string;
  applicationFee?: string;

  dates: {
    startDate?: string;
    lastDate: string;
    examDate?: string;

    // Extended Last Date
    isDateExtended?: boolean;
    extendedLastDate?: string;
  };

  links: {
    applyOnline?: string;
    officialNotification?: string;
    officialWebsite?: string;
  };

  content: {
    eligibility?: string;
    vacancyDetails?: string;
    selectionProcess?: string;
    howToApply?: string;
    importantInstructions?: string;
  };

  seo: {
    title?: string;
    metaDescription?: string;
  };

  featured: boolean;
  status: JobStatus;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface JobFilters {
  q?: string;
  gender?: "all" | "male" | "female" | "both";
  categories?: Category[];
  qualifications?: Qualification[];
  jobType?: JobType[];
  state?: string;
  district?: string;
  minAge?: number;
  maxAge?: number;
  lastDate?: "today" | "week" | "month" | "upcoming";
  featuredOnly?: boolean;
  status?: JobStatus | "all";
  sort?: "latest" | "closing_soon" | "most_viewed";
  page?: number;
  pageSize?: number;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  open: "Open / General",
  obc: "OBC",
  sc: "SC",
  st: "ST",
  ews: "EWS",
};

export const QUALIFICATION_LABELS: Record<
  Qualification,
  string
> = {
  "10th": "10th Pass",
  "12th": "12th Pass",
  iti: "ITI",
  diploma: "Diploma",
  graduate: "Graduate",
  post_graduate: "Post Graduate",
  engineering: "Engineering",
  law: "Law",
  medical: "Medical",
  any_graduate: "Any Graduate",
};

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  government: "Government Job",
  private: "Private Job",
  contract: "Contract Job",
  apprenticeship: "Apprenticeship",
  internship: "Internship",
  scholarship: "Scholarship",
};
