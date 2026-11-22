alter table public.categories enable row level security;
alter table public.tutorials enable row level security;
alter table public.page_views enable row level security;

create policy "Visitor category visibility limit" on public.categories
  as restrictive for select to anon, authenticated
  using (active is true and visibility_status is distinct from false);
create policy "Visitor tutorial visibility limit" on public.tutorials
  as restrictive for select to anon, authenticated using (visible is true);
create policy "Visitor category reads" on public.categories
  for select to anon, authenticated using (true);
create policy "Visitor tutorial reads" on public.tutorials
  for select to anon, authenticated using (true);

revoke insert, update, delete, truncate on public.categories, public.tutorials
  from public, anon, authenticated;
revoke all on public.page_views from public, anon, authenticated;
grant select, insert on public.page_views to service_role;
