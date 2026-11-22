create table public.whatsapp_config (
  id integer primary key check (id = 1),
  account_sid text not null,
  auth_token text not null,
  sender text not null,
  connected boolean not null default false
);

alter table public.whatsapp_config enable row level security;
revoke all on public.whatsapp_config from public, anon, authenticated;
grant select, insert, update, delete on public.whatsapp_config to service_role;
