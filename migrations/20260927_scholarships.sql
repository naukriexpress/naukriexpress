-- Run once in the Supabase SQL Editor before using the new admin fields.
alter type job_type_t add value if not exists 'scholarship';
alter table jobs add column if not exists extended_last_date date;

-- After this query succeeds, classify existing scholarship entries in Admin > Jobs.
