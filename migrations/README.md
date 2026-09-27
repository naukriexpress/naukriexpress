# Scholarship and apprenticeship update

1. In Supabase **SQL Editor**, run `20260927_scholarships.sql` once before deploying this code. The migration adds the `scholarship` enum value and optional `extended_last_date` column without changing existing jobs.
2. Deploy the code after the SQL query succeeds. In the admin panel, select **Scholarship** or **Apprenticeship** under **Job Type** when creating or editing entries.
3. For an extended deadline, retain the original **Last Date to Apply** and enter the revised date in **Extended Last Date**. The revised date controls expiry and closing-soon filters.
4. Edit any existing scholarships that were saved as jobs (for example HDFC Parivartan) and change their type to **Scholarship**. No vacancy count is required for scholarships; enter the description in **Description & Eligibility Details**.
5. Check `/scholarships` and `/apprenticeships`, then open a detail page from each list. Admin login and contact form are unaffected.
