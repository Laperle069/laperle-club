-- Automatic wallet updates. Delivery switches are intentionally unchanged.
set local search_path=public,extensions,pg_temp;
create sequence if not exists wallet_update_seq;
alter table wallet_pass add column if not exists update_tag bigint not null default nextval('wallet_update_seq');
create or replace function _wallet_update_lock() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin perform pg_advisory_xact_lock(186731,9401); return null; end $$;
create trigger wallet_update_lock before insert or update or delete on wallet_pass for each statement execute function _wallet_update_lock();
create or replace function _wallet_update_tag() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if new.stand_version is distinct from old.stand_version then
  new.update_tag:=nextval('wallet_update_seq'); new.aktualisiert_am:=clock_timestamp();
 end if;
 return new;
end $$;
create trigger wallet_update_tag before update on wallet_pass for each row execute function _wallet_update_tag();
create table wallet_apple_registration (
 device_id text not null check(length(device_id) between 1 and 256),
 pass_id uuid not null references wallet_pass(id) on delete cascade,
 push_token text not null check(length(push_token) between 1 and 256),
 registered_at timestamptz not null default now(),
 primary key(device_id,pass_id)
);
create index on wallet_apple_registration(pass_id);
alter table wallet_apple_registration enable row level security;
revoke all on wallet_apple_registration from public,anon,authenticated;
grant all on wallet_apple_registration to service_role;

-- Service-only RPC: checks each pass token itself, never accepts a customer ID.
create or replace function wallet_apple_service(p_action text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare pass_record wallet_pass; customer_record kundin; d jsonb; existed boolean; result jsonb; ids uuid[]; r record;
begin
 if p_action='list' then
  if p_data->>'pass_type'<>'pass.de.laperlebeauty.club' then return null; end if;
  select jsonb_build_object('serialNumbers',jsonb_agg(w.serien_nummer),'lastUpdated',max(w.update_tag)::text) into result
  from wallet_apple_registration a join wallet_pass w on w.id=a.pass_id join kundin k on k.id=w.kundin_id
  where a.device_id=p_data->>'device_id' and w.plattform='apple' and w.zurueckgezogen_am is null and k.status='aktiv'
    and (p_data->>'since' is null or w.update_tag>(p_data->>'since')::bigint);
  if result->'serialNumbers'='null'::jsonb then return null; end if;
  return result;
 elsif p_action='claim' then
  if _e('apple_wallet_aktiv') is distinct from 'true' or not _an('wallet') then return '[]'::jsonb; end if;
  perform pg_advisory_xact_lock(186731,9401);
  with candidates as (
   select w.id from wallet_pass w join kundin k on k.id=w.kundin_id
   where w.plattform='apple' and w.zurueckgezogen_am is null and k.status='aktiv'
    and exists(select 1 from wallet_apple_registration a where a.pass_id=w.id)
    and w.stand_version>w.quittiert_version
    and coalesce(w.naechster_versuch,'-infinity')<=now() and coalesce(w.gesperrt_bis,'-infinity')<now()
   order by w.aktualisiert_am limit 10 for update of w skip locked
  ), claimed as (
   update wallet_pass w set lease_id=gen_random_uuid(),gesperrt_bis=now()+interval '3 minutes'
   from candidates c where w.id=c.id returning w.*
  ) select coalesce(jsonb_agg(jsonb_build_object('object_id',c.serien_nummer,'version',c.stand_version,
    'lease_id',c.lease_id,'lease_bis',c.gesperrt_bis,'pass_type','pass.de.laperlebeauty.club',
    'devices',(select jsonb_agg(jsonb_build_object('device_id',a.device_id,'push_token',a.push_token)) from wallet_apple_registration a where a.pass_id=c.id))),'[]'::jsonb)
   into result from claimed c;
  return result;
 elsif p_action='invalid_device' then
  -- Guard against a token being refreshed while an old APNs request was in flight.
  delete from wallet_apple_registration where device_id=p_data->>'device_id' and push_token=p_data->>'push_token';
  return jsonb_build_object('ok',true);
 end if;
 if p_data->>'pass_type'<>'pass.de.laperlebeauty.club' then return null; end if;
 select * into pass_record from wallet_pass where plattform='apple' and serien_nummer=p_data->>'serial'
  and auth_token=p_data->>'token' and zurueckgezogen_am is null;
 if pass_record.id is null then return null; end if;
 select * into customer_record from kundin where id=pass_record.kundin_id and status='aktiv';
 if customer_record.id is null then return null; end if;
 if p_action='register' then
  perform pg_advisory_xact_lock(186731,9401);
  select exists(select 1 from wallet_apple_registration where device_id=p_data->>'device_id' and pass_id=pass_record.id) into existed;
  update wallet_apple_registration set push_token=p_data->>'push_token' where device_id=p_data->>'device_id';
  insert into wallet_apple_registration(device_id,pass_id,push_token) values(p_data->>'device_id',pass_record.id,p_data->>'push_token')
   on conflict(device_id,pass_id) do update set push_token=excluded.push_token;
  -- Registration can follow a booking that happened after download. Force a fresh push.
  update wallet_pass set zuletzt_abgerufen=now(),stand_version=stand_version+1,aktualisierung_noetig=true where id=pass_record.id;
  return jsonb_build_object('created',not existed);
 elsif p_action='unregister' then
  delete from wallet_apple_registration where device_id=p_data->>'device_id' and pass_id=pass_record.id;
  return jsonb_build_object('ok',true);
 elsif p_action='pass' then
  return jsonb_build_object('aktiv',true,'object_id',pass_record.serien_nummer,'auth_token',pass_record.auth_token,
   'pass_type','pass.de.laperlebeauty.club','team_id','FPDU6B86GK','updated_at',pass_record.aktualisiert_am,
   'vorname',customer_record.vorname,'nachname',customer_record.nachname,'kundennummer',customer_record.kundennummer,
   'stand',coalesce((select stand from punktekonto where kundin_id=customer_record.id),0),
   'rang',case when _an('level') then _level_stand(customer_record.id)->>'name' else null end,
   'naechste',coalesce((select (p.punkte-coalesce(pk.stand,0))||' bis '||p.bezeichnung from praemie p
    left join punktekonto pk on pk.kundin_id=customer_record.id where p.organisation_id=customer_record.organisation_id and p.aktiv and p.punkte>coalesce(pk.stand,0)
    order by p.punkte limit 1),'alle erreicht'),
   'club_url',_e('club_basis_url')||'?t='||customer_record.zugangstoken);
 end if;
 raise exception 'Unknown wallet action';
end $$;
revoke all on function wallet_apple_service(text,jsonb) from public,anon,authenticated;
grant execute on function wallet_apple_service(text,jsonb) to service_role;

-- Existing personal-link authentication and activation gates stay intact.
do $$ declare def text; begin
 select pg_get_functiondef('wallet_apple_kartendaten(text)'::regprocedure) into def;
 def:=replace(def,'''object_id'',    wp.serien_nummer,','''object_id'',    wp.serien_nummer, ''auth_token'', wp.auth_token,');
 execute def;
end $$;

-- Name/token changes must also update both wallets.
create or replace function _wallet_customer_changed() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update wallet_pass set stand_version=stand_version+1,aktualisierung_noetig=true
 where kundin_id=new.id and zurueckgezogen_am is null;
 return new;
end $$;
create trigger wallet_customer_changed after update of vorname,nachname,zugangstoken on kundin
 for each row when (old.vorname is distinct from new.vorname or old.nachname is distinct from new.nachname or old.zugangstoken is distinct from new.zugangstoken)
 execute function _wallet_customer_changed();
revoke all on function _wallet_update_lock(),_wallet_update_tag(),_wallet_customer_changed() from public,anon,authenticated;
notify pgrst,'reload schema';

-- Vault keeps the scheduler credential out of cron text and the repository.
create or replace function wallet_worker_authorized(p_secret text) returns boolean
language plpgsql security definer set search_path=public,extensions,pg_temp as $$
begin
 return length(coalesce(p_secret,''))>=32 and exists(select 1 from vault.decrypted_secrets
  where name='laperle_wallet_worker' and decrypted_secret=p_secret);
end $$;
revoke all on function wallet_worker_authorized(text) from public,anon,authenticated;
grant execute on function wallet_worker_authorized(text) to service_role;

create or replace function job_wallet_sync() returns void language plpgsql security definer
set search_path=public,extensions,pg_temp as $$
declare secret text; base text; platform text;
begin
 if not _an('wallet') then return; end if;
 base:=_e('wallet_edge_basis_url');
 if base is null or base !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1$' then return; end if;
 select decrypted_secret into secret from vault.decrypted_secrets where name='laperle_wallet_worker';
 if secret is null then return; end if;
 foreach platform in array array['google','apple'] loop
  if (platform='google' and _e('wallet_aktiv')='true') or (platform='apple' and _e('apple_wallet_aktiv')='true') then
   perform net.http_post(url:=base||case when platform='google' then '/wallet/sync' else '/wallet-apple/sync' end,
     headers:=jsonb_build_object('Content-Type','application/json','x-sync-geheimnis',secret),body:='{}'::jsonb,timeout_milliseconds:=120000);
  end if;
 end loop;
end $$;
revoke all on function job_wallet_sync() from public,anon,authenticated;
grant execute on function job_wallet_sync() to service_role;
-- Deployment environments with Vault + Cron can activate this safely: disabled wallets remain disabled.
do $$ begin
 if exists(select 1 from pg_namespace where nspname='vault') then
  if not exists(select 1 from vault.secrets where name='laperle_wallet_worker') then
   perform vault.create_secret(encode(gen_random_bytes(32),'hex'),'laperle_wallet_worker','Wallet scheduler credential');
  end if;
 end if;
 if exists(select 1 from pg_namespace where nspname='cron') then
  perform cron.schedule('laperle_wallet_sync','* * * * *','select public.job_wallet_sync();');
 end if;
end $$;
-- Google polling also respects the existing delivery switches.
do $$ declare def text; begin
 select pg_get_functiondef('wallet_offene_karten(integer)'::regprocedure) into def;
 def:=regexp_replace(def,'begin',E'begin\n if _e(''wallet_aktiv'') is distinct from ''true'' or not _an(''wallet'') then return ''[]''::jsonb; end if;');
 execute def;
end $$;
