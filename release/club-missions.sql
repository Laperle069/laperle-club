-- Club goals. Tested on TEST project only; production rollout remains a separate release.
-- Legacy Club authentication uses opaque customer/session tokens, not auth.users JWTs.
-- All definer code lives outside exposed schemas and validates those existing tokens.
create schema if not exists club_private;
revoke all on schema club_private from public;
grant usage on schema club_private to anon, authenticated;
create table if not exists club_private.mission_vorlage (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisation(id),
 titel text not null check(length(titel) between 3 and 100),
 kategorie text not null check(kategorie in ('laser','laser_intim','gesicht')),
 anzahl integer not null check(anzahl between 2 and 20),
 gueltigkeit_tage integer not null default 90 check(gueltigkeit_tage between 1 and 730),
 praemie_id uuid not null references public.praemie(id), aktiv boolean not null default false,
 unique(id,organisation_id)
);
create table if not exists club_private.mission (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references public.organisation(id),
 kundin_id uuid not null references public.kundin(id) on delete cascade,
 vorlage_id uuid not null references club_private.mission_vorlage(id),
 titel text not null, kategorie text not null, anzahl integer not null,
 praemie_id uuid not null references public.praemie(id), belohnung text not null, gueltigkeit_tage integer not null,
 gestartet_am timestamptz not null default clock_timestamp(), aktiv boolean not null default true,
 fortschritt integer not null default 0, abgeschlossen_am timestamptz, einloesung_id uuid references public.einloesung(id),
 unique(kundin_id,vorlage_id)
);
create unique index if not exists mission_eine_aktive on club_private.mission(kundin_id) where aktiv and abgeschlossen_am is null;
create index if not exists mission_kundin on club_private.mission(kundin_id);
alter table club_private.mission enable row level security;
alter table club_private.mission_vorlage enable row level security;
revoke all on club_private.mission,club_private.mission_vorlage from public,anon,authenticated;

create or replace function club_private.refresh_mission(p_kundin uuid) returns void
language plpgsql security definer set search_path='' as $$
declare m club_private.mission; p public.praemie; n integer; reward_status text; reward_id uuid;
begin
 for m in select * from club_private.mission where kundin_id=p_kundin and (aktiv or einloesung_id is not null) order by id for update loop
  select count(distinct (b.zeitpunkt at time zone 'Europe/Berlin')::date) into n
  from public.punktebewegung b where b.kundin_id=m.kundin_id and b.organisation_id=m.organisation_id
   and b.anlass='behandlung' and b.kategorie=m.kategorie and b.zeitpunkt>=m.gestartet_am and b.betrag>0
   and b.betrag+coalesce((select sum(c.betrag) from public.punktebewegung c where c.korrigiert_id=b.id and c.kundin_id=b.kundin_id and c.anlass='korrektur'),0)>0;
  update club_private.mission set fortschritt=least(n,m.anzahl) where id=m.id;
  if m.einloesung_id is not null then select status into reward_status from public.einloesung where id=m.einloesung_id; else reward_status:=null; end if;
  if n>=m.anzahl and m.aktiv then
   if m.einloesung_id is null then
    select * into p from public.praemie where id=m.praemie_id and organisation_id=m.organisation_id;
    if p.id is null then raise exception 'Zielprämie nicht gefunden'; end if;
    insert into public.einloesung(organisation_id,kundin_id,quelle,praemie_id,bezeichnung,art,nennwert,gueltig_bis,begruendung)
    values(m.organisation_id,m.kundin_id,'aktion',p.id,m.belohnung,p.art,coalesce(p.wert::text,m.belohnung),clock_timestamp()+pg_catalog.make_interval(days=>m.gueltigkeit_tage),'Zielprämie: '||m.titel) returning id into reward_id;
    update club_private.mission set einloesung_id=reward_id,abgeschlossen_am=clock_timestamp() where id=m.id;
   elsif reward_status='storniert' then
    update public.einloesung set status='angefordert' where id=m.einloesung_id;
    update club_private.mission set abgeschlossen_am=clock_timestamp() where id=m.id;
   end if;
  elsif n<m.anzahl and reward_status='angefordert' then
   update public.einloesung set status='storniert' where id=m.einloesung_id;
   -- Re-open only if no different mission became active in the meantime.
   update club_private.mission set abgeschlossen_am=null,aktiv=not exists(select 1 from club_private.mission x where x.kundin_id=m.kundin_id and x.id<>m.id and x.aktiv and x.abgeschlossen_am is null) where id=m.id;
  end if;
 end loop;
end $$;
revoke all on function club_private.refresh_mission(uuid) from public,anon,authenticated;
create or replace function club_private.booking_changed() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 if new.anlass in ('behandlung','korrektur') then perform club_private.refresh_mission(new.kundin_id); end if;return new;
end $$;
revoke all on function club_private.booking_changed() from public,anon,authenticated;
drop trigger if exists lp_mission_booking on public.punktebewegung;
create trigger lp_mission_booking after insert on public.punktebewegung for each row execute function club_private.booking_changed();

create or replace function club_private.missionen(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare k public.kundin; m club_private.mission; result jsonb;
begin
 k:=public._kundin_per_token(p_token);
 select * into m from club_private.mission where kundin_id=k.id and aktiv order by (abgeschlossen_am is null) desc, gestartet_am desc limit 1;
 return jsonb_build_object('aus',not public._an('ziel'),'vorlagen',(select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'titel',v.titel,'anzahl',v.anzahl,'kategorie',v.kategorie,'belohnung',p.bezeichnung) order by v.titel),'[]'::jsonb) from club_private.mission_vorlage v join public.praemie p on p.id=v.praemie_id and p.organisation_id=v.organisation_id where v.organisation_id=k.organisation_id and v.aktiv and p.aktiv),
 'erledigt',(select coalesce(jsonb_agg(vorlage_id),'[]'::jsonb) from club_private.mission where kundin_id=k.id and abgeschlossen_am is not null),
 'mission',case when m.id is null then null else jsonb_build_object('id',m.id,'titel',m.titel,'anzahl',m.anzahl,'fortschritt',m.fortschritt,'belohnung',m.belohnung,'abgeschlossen',m.abgeschlossen_am is not null) end);
end $$;
create or replace function club_private.start_mission(p_token text,p_vorlage_id uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare k public.kundin; v club_private.mission_vorlage; p public.praemie; m club_private.mission;
begin
 k:=public._kundin_per_token(p_token);perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(k.id::text));perform 1 from public.kundin where id=k.id for update;
 if not public._an('ziel') then raise exception 'Behandlungsziele sind derzeit nicht aktiv.'; end if;
 select * into v from club_private.mission_vorlage where id=p_vorlage_id and organisation_id=k.organisation_id and aktiv;
 if v.id is null then raise exception 'Dieses Ziel ist nicht verfügbar.'; end if;
 select * into p from public.praemie where id=v.praemie_id and organisation_id=k.organisation_id and aktiv;
 if p.id is null then raise exception 'Die Abschlussprämie ist nicht verfügbar.'; end if;
 select * into m from club_private.mission where kundin_id=k.id and vorlage_id=v.id;
 if m.abgeschlossen_am is not null then raise exception 'Die Prämie für dieses Ziel wurde bereits freigeschaltet.'; end if;
 if exists(select 1 from club_private.mission where kundin_id=k.id and aktiv and abgeschlossen_am is null and vorlage_id<>v.id) then raise exception 'Bitte beende zuerst dein laufendes Ziel.'; end if;
 if m.id is null then
 insert into club_private.mission(organisation_id,kundin_id,vorlage_id,titel,kategorie,anzahl,praemie_id,belohnung,gueltigkeit_tage) values(k.organisation_id,k.id,v.id,v.titel,v.kategorie,v.anzahl,p.id,p.bezeichnung,v.gueltigkeit_tage);
 else
 update club_private.mission set aktiv=true,gestartet_am=case when not aktiv then clock_timestamp() else gestartet_am end,fortschritt=case when not aktiv then 0 else fortschritt end where id=m.id;
 end if;
 return club_private.missionen(p_token);
end $$;
create or replace function club_private.stop_mission(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare k public.kundin;
begin k:=public._kundin_per_token(p_token);perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(k.id::text));perform 1 from public.kundin where id=k.id for update;
 update club_private.mission set aktiv=false where kundin_id=k.id and aktiv and abgeschlossen_am is null;
 return club_private.missionen(p_token);end $$;
-- Thin invoker endpoints; private functions carry token authorization, every time.
create or replace function public.kunde_missionen(p_token text) returns jsonb language sql security invoker set search_path='' as $$select club_private.missionen(p_token)$$;
create or replace function public.mission_starten(p_token text,p_vorlage_id uuid) returns jsonb language sql security invoker set search_path='' as $$select club_private.start_mission(p_token,p_vorlage_id)$$;
create or replace function public.mission_beenden(p_token text) returns jsonb language sql security invoker set search_path='' as $$select club_private.stop_mission(p_token)$$;
revoke all on function club_private.missionen(text),club_private.start_mission(text,uuid),club_private.stop_mission(text),public.kunde_missionen(text),public.mission_starten(text,uuid),public.mission_beenden(text) from public;
grant execute on function club_private.missionen(text),club_private.start_mission(text,uuid),club_private.stop_mission(text),public.kunde_missionen(text),public.mission_starten(text,uuid),public.mission_beenden(text) to anon,authenticated;

insert into public.rollenmatrix(funktion,rollen) values('admin_missionen',array['zentrale']),('admin_mission_speichern',array['zentrale']) on conflict(funktion) do nothing;
create or replace function club_private.admin_missionen(p_token text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.terminal_sitzung;
begin s:=public._admin(p_token,'admin_missionen');return jsonb_build_object('vorlagen',(select coalesce(jsonb_agg(to_jsonb(v) order by v.titel),'[]'::jsonb) from club_private.mission_vorlage v where v.organisation_id=s.organisation_id),'praemien',(select coalesce(jsonb_agg(jsonb_build_object('id',id,'bezeichnung',bezeichnung) order by punkte),'[]'::jsonb) from public.praemie where organisation_id=s.organisation_id and aktiv));end $$;
create or replace function club_private.save_mission(p_token text,p_id uuid,p_titel text,p_kategorie text,p_anzahl integer,p_praemie_id uuid,p_aktiv boolean,p_gueltigkeit_tage integer default 90) returns jsonb
language plpgsql security definer set search_path='' as $$
declare s public.terminal_sitzung; v club_private.mission_vorlage;
begin s:=public._admin(p_token,'admin_mission_speichern');
 if not exists(select 1 from public.praemie where id=p_praemie_id and organisation_id=s.organisation_id and aktiv) then raise exception 'Prämie ist nicht verfügbar.';end if;
 if p_id is null then insert into club_private.mission_vorlage(organisation_id,titel,kategorie,anzahl,praemie_id,aktiv,gueltigkeit_tage) values(s.organisation_id,trim(p_titel),p_kategorie,p_anzahl,p_praemie_id,p_aktiv,p_gueltigkeit_tage) returning * into v;
 else update club_private.mission_vorlage set titel=trim(p_titel),kategorie=p_kategorie,anzahl=p_anzahl,praemie_id=p_praemie_id,aktiv=p_aktiv,gueltigkeit_tage=p_gueltigkeit_tage where id=p_id and organisation_id=s.organisation_id returning * into v;if v.id is null then raise exception 'Ziel nicht gefunden.';end if;end if;
 return to_jsonb(v);end $$;
create or replace function public.admin_missionen(p_token text) returns jsonb language sql security invoker set search_path='' as $$select club_private.admin_missionen(p_token)$$;
create or replace function public.admin_mission_speichern(p_token text,p_id uuid,p_titel text,p_kategorie text,p_anzahl integer,p_praemie_id uuid,p_aktiv boolean,p_gueltigkeit_tage integer default 90) returns jsonb language sql security invoker set search_path='' as $$select club_private.save_mission(p_token,p_id,p_titel,p_kategorie,p_anzahl,p_praemie_id,p_aktiv,p_gueltigkeit_tage)$$;
revoke all on function club_private.admin_missionen(text),club_private.save_mission(text,uuid,text,text,integer,uuid,boolean,integer),public.admin_missionen(text),public.admin_mission_speichern(text,uuid,text,text,integer,uuid,boolean,integer) from public;
grant execute on function club_private.admin_missionen(text),club_private.save_mission(text,uuid,text,text,integer,uuid,boolean,integer),public.admin_missionen(text),public.admin_mission_speichern(text,uuid,text,text,integer,uuid,boolean,integer) to anon,authenticated;
