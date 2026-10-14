-- Upcoming SSC GD Constable 2027 listing for the production PostgreSQL database.
-- Source: SSC tentative calendar (official) schedules the advertisement in September
-- 2026, the application closing month in October 2026, and CBE in Jan-Mar 2027.
-- Exact 2027 dates and vacancy count have not been verified in an official SSC notice
-- as of 14 October 2026. The application code hides internal sentinel dates below.
-- Run once in Supabase SQL Editor. This insert is safe to run more than once.

INSERT INTO jobs (
  slug, title, organization, department, advertisement_number, logo_url,
  total_vacancies, state, district, all_india,
  genders, categories, qualifications, min_age, max_age, age_relaxation,
  job_type, salary, application_fee,
  start_date, last_date, exam_date,
  apply_online_url, official_notification_url, official_website_url,
  content_eligibility, content_vacancy_details, content_selection_process,
  content_how_to_apply, content_important_instructions,
  seo_title, seo_meta_description,
  featured, status, publish_at
)
VALUES (
  'ssc-gd-constable-recruitment-2027',
  'SSC GD Constable Recruitment 2027 – Upcoming',
  'Staff Selection Commission (SSC)',
  'Ministry of Home Affairs / Central Armed Police Forces',
  'Not announced – 2027 notice awaited',
  NULL,
  0,
  'All India',
  NULL,
  TRUE,
  ARRAY['male','female']::gender_t[],
  ARRAY['open','obc','sc','st','ews']::category_t[],
  ARRAY['10th']::qualification_t[],
  18,
  23,
  'Indicative only, based on the SSC GD 2026 notice: OBC 3 years and SC/ST 5 years. The 2027 age cut-off date and all relaxations must be confirmed from the 2027 official notice.',
  'government'::job_type_t,
  'Pay Level 3: ₹21,700–₹69,100 (as stated in SSC GD 2026 notice; confirm for 2027)',
  '2027 application fee not confirmed; check the official SSC notice.',
  NULL,
  DATE '2027-03-31',
  DATE '2027-01-01',
  NULL,
  NULL,
  'https://ssc.gov.in/',
  '<p><strong>Educational qualification (expected):</strong> Class 10 / Matriculation pass from a recognised board, as required in the SSC GD 2026 notice. The 2027 notification must confirm the final eligibility and qualification cut-off date.</p><p><strong>Age limit (indicative only):</strong> The SSC GD 2026 notice used 18–23 years with a specified age-reckoning date. SSC GD 2027 will specify its own date-of-birth range. Do not rely on the previous cycle without checking the 2027 notice.</p><p>Nationality, domicile / PRC and other eligibility conditions must be checked in the official notification.</p>',
  '<p><strong>Official vacancy count: awaited.</strong> As of 14 October 2026, an official SSC GD 2027 vacancy total and force-wise/category-wise vacancy PDF could not be verified on the SSC notice board. Unofficial vacancy estimates are not being presented as confirmed numbers. This section should be updated after SSC publishes the 2027 vacancy notice.</p>',
  '<ol><li>Computer Based Examination (CBE)</li><li>Physical Standard Test (PST) and Physical Efficiency Test (PET)</li><li>Medical Examination</li><li>Document Verification</li></ol><p>This sequence follows the SSC GD 2026 official notice and is indicative until the 2027 notice confirms the final process.</p>',
  '<p><strong>Applications are not being linked here yet:</strong> the official 2027 application link could not be verified. Visit the SSC official website and open its Notice Board. Complete / check One-Time Registration (OTR), then apply only through the official SSC portal after the 2027 notice and application link are available.</p>',
  '[[SSC_GD_NOTICE_PENDING]]<ul><li>SSC official tentative calendar lists the GD 2027 advertisement for September 2026, closing month October 2026, and CBE in January–March 2027. These are calendar windows, not an exact application deadline.</li><li>Exact application dates, total vacancies, official notification PDF and application link are awaiting verification.</li><li>Age, qualification, pay, fee and reservation details above are indicative where noted and must be confirmed against the SSC GD 2027 notification.</li><li>Official updates: https://ssc.gov.in/</li></ul>',
  'SSC GD Constable Recruitment 2027 – Upcoming Vacancy, Eligibility and Dates',
  'SSC GD Constable 2027 upcoming recruitment. Official SSC calendar tentatively lists the exam in January–March 2027. Exact vacancy count, application dates and notification are awaiting official confirmation.',
  FALSE,
  'published'::job_status_t,
  NULL
)
ON CONFLICT (slug) DO NOTHING;
