create table if not exists site_stats (
  id smallint primary key check (id = 1),
  total_visitors bigint not null default 0
);

insert into site_stats (id, total_visitors)
values (1, 0)
on conflict (id) do nothing;
