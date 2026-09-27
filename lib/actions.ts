"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, verifyCredentials } from "./auth";
import { 
  createJob, 
  deleteJob, 
  getJobById, 
  updateJob,
  createAdmitCard, 
  updateAdmitCard, 
  deleteAdmitCard,
  createTicker, 
  updateTicker, 
  deleteTicker 
} from "./db";
import type {
  Category,
  Gender,
  JobPosting,
  JobStatus,
  JobType,
  Qualification,
  VacancyRow,
} from "./types";
import { isValidYouTubeUrl } from "./youtube";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin/dashboard");

  const ok = await verifyCredentials(username, password);
  if (!ok) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(next)}`);
  }
  await createSession(username);
  redirect(next.startsWith("/admin") ? next : "/admin/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/admin/login");
}

function parseCheckboxList<T extends string>(formData: FormData, name: string): T[] {
  return formData.getAll(name).map((v) => String(v)) as T[];
}

function parseVacancyRows(formData: FormData): VacancyRow[] {
  const posts = formData.getAll("vacancy_post").map(String);
  const cats = formData.getAll("vacancy_category").map(String);
  const counts = formData.getAll("vacancy_count").map(String);
  const rows: VacancyRow[] = [];
  for (let i = 0; i < posts.length; i++) {
    if (!posts[i]?.trim()) continue;
    rows.push({
      post: posts[i],
      category: cats[i] || "",
      count: Number(counts[i]) || 0,
    });
  }
  return rows;
}

function buildJobFromForm(formData: FormData) {
  const lastDate = String(formData.get("lastDate") || "");
  const extendedLastDate = String(formData.get("extendedLastDate") || "");
  if (extendedLastDate && extendedLastDate <= lastDate) {
    throw new Error("Extended last date must be after the original last date.");
  }
  const genders = parseCheckboxList<Gender>(formData, "gender");
  const categories = parseCheckboxList<Category>(formData, "category");
  const qualifications = parseCheckboxList<Qualification>(formData, "qualification");
  const vacancyBreakdown = parseVacancyRows(formData);
  const totalVacancies =
    Number(formData.get("totalVacancies")) ||
    vacancyBreakdown.reduce((s, r) => s + r.count, 0);

  const publishMode = String(formData.get("publishMode") || "publish");
  let status: JobStatus = "published";
  if (publishMode === "draft") status = "draft";
  else if (publishMode === "schedule") status = "scheduled";

  const job: Omit<JobPosting, "id" | "slug" | "createdAt" | "updatedAt" | "views"> = {
    title: String(formData.get("title") || ""),
    organization: String(formData.get("organization") || ""),
    department: String(formData.get("department") || ""),
    advertisementNumber: String(formData.get("advertisementNumber") || ""),
    logoUrl: String(formData.get("logoUrl") || ""),
    totalVacancies,
    vacancyBreakdown,
    location: {
      state: String(formData.get("state") || "Maharashtra"),
      district: String(formData.get("district") || "") || undefined,
      allIndia: formData.get("allIndia") === "on",
    },
    eligibility: {
      genders: genders.length ? genders : ["male", "female"],
      categories,
      qualifications,
      minAge: formData.get("minAge") ? Number(formData.get("minAge")) : undefined,
      maxAge: formData.get("maxAge") ? Number(formData.get("maxAge")) : undefined,
      ageRelaxation: String(formData.get("ageRelaxation") || "") || undefined,
    },
    jobType: (String(formData.get("jobType") || "government") as JobType),
    salary: String(formData.get("salary") || "") || undefined,
    applicationFee: String(formData.get("applicationFee") || "") || undefined,
    dates: {
      startDate: String(formData.get("startDate") || "") || undefined,
      lastDate: lastDate || new Date().toISOString().slice(0, 10),
      extendedLastDate: extendedLastDate || undefined,
      examDate: String(formData.get("examDate") || "") || undefined,
    },
    links: {
      applyOnline: String(formData.get("applyOnline") || "") || undefined,
      officialNotification: String(formData.get("officialNotification") || "") || undefined,
      officialWebsite: String(formData.get("officialWebsite") || "") || undefined,
    },
    content: {
      eligibility: String(formData.get("content_eligibility") || "") || undefined,
      vacancyDetails: String(formData.get("content_vacancyDetails") || "") || undefined,
      selectionProcess: String(formData.get("content_selectionProcess") || "") || undefined,
      howToApply: String(formData.get("content_howToApply") || "") || undefined,
      importantInstructions: String(formData.get("content_importantInstructions") || "") || undefined,
    },
    seo: {
      title: String(formData.get("seoTitle") || "") || undefined,
      metaDescription: String(formData.get("seoDescription") || "") || undefined,
    },
    // Optional per-job YouTube link. The form's `pattern` attribute already
    // blocks invalid values in the browser; this server-side check is a
    // second line of defense (e.g. JS-disabled clients or direct API calls)
    // so an unrecognised link can never silently reach the database and
    // break the "Watch Video" button on the public site.
    youtubeUrl: (() => {
      const raw = String(formData.get("youtubeUrl") || "").trim();
      return raw && isValidYouTubeUrl(raw) ? raw : undefined;
    })(),
    featured: formData.get("featured") === "on",
    status,
    publishAt:
      publishMode === "schedule" && formData.get("publishAt")
        ? new Date(String(formData.get("publishAt"))).toISOString()
        : undefined,
  };

  return job;
}

export async function createJobAction(formData: FormData) {
  const job = buildJobFromForm(formData);
  const created = await createJob(job);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/scholarships");
  revalidatePath("/apprenticeships");
  revalidatePath("/");
  redirect(`/admin/jobs?created=${created.slug}`);
}

export async function updateJobAction(id: string, formData: FormData) {
  const job = buildJobFromForm(formData);
  await updateJob(id, job);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/scholarships");
  revalidatePath("/apprenticeships");
  revalidatePath("/");
  redirect(`/admin/jobs?updated=${id}`);
}

export async function deleteJobAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) await deleteJob(id);
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  revalidatePath("/scholarships");
  revalidatePath("/apprenticeships");
  revalidatePath("/");
}

export async function toggleFeaturedAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const job = await getJobById(id);
  if (job) await updateJob(id, { featured: !job.featured });
  revalidatePath("/admin/jobs");
  revalidatePath("/");
}

export async function toggleExpiredAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const job = await getJobById(id);
  if (job) {
    await updateJob(id, {
      status: job.status === "expired" ? "published" : "expired",
    });
  }
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
}

// --- Admit Card Actions ---
export async function createAdmitCardAction(formData: FormData) {
  const input = {
    title: String(formData.get("title") || ""),
    organization: String(formData.get("organization") || ""),
    admitCardDate: String(formData.get("admitCardDate") || "") || undefined,
    examDate: String(formData.get("examDate") || "") || undefined,
    downloadUrl: String(formData.get("downloadUrl") || "") || undefined,
    status: String(formData.get("status") || "published"),
  };
  await createAdmitCard(input);
  revalidatePath("/admin/admit-cards");
  revalidatePath("/admit-card");
  revalidatePath("/");
  redirect("/admin/admit-cards?created=1");
}

export async function updateAdmitCardAction(id: string, formData: FormData) {
  const input = {
    title: String(formData.get("title") || ""),
    organization: String(formData.get("organization") || ""),
    admitCardDate: String(formData.get("admitCardDate") || "") || undefined,
    examDate: String(formData.get("examDate") || "") || undefined,
    downloadUrl: String(formData.get("downloadUrl") || "") || undefined,
    status: String(formData.get("status") || "published"),
  };
  await updateAdmitCard(id, input);
  revalidatePath("/admin/admit-cards");
  revalidatePath("/admit-card");
  revalidatePath("/");
  redirect("/admin/admit-cards?updated=1");
}

export async function deleteAdmitCardAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) await deleteAdmitCard(id);
  revalidatePath("/admin/admit-cards");
  revalidatePath("/admit-card");
  revalidatePath("/");
}

// --- Ticker Actions ---
export async function createTickerAction(formData: FormData) {
  const input = {
    text: String(formData.get("text") || ""),
    link: String(formData.get("link") || "") || undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };
  await createTicker(input);
  revalidatePath("/admin/tickers");
  revalidatePath("/");
  redirect("/admin/tickers?created=1");
}

export async function updateTickerAction(id: string, formData: FormData) {
  const input = {
    text: String(formData.get("text") || ""),
    link: String(formData.get("link") || "") || undefined,
    active: formData.get("active") === "on" || formData.get("active") === "true",
    sortOrder: Number(formData.get("sortOrder")) || 0,
  };
  await updateTicker(id, input);
  revalidatePath("/admin/tickers");
  revalidatePath("/");
  redirect("/admin/tickers?updated=1");
}

export async function deleteTickerAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (id) await deleteTicker(id);
  revalidatePath("/admin/tickers");
  revalidatePath("/");
}