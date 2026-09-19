-- Privacy hardening. Reviewed independently of backup-derived installers.
create schema if not exists club_private;
revoke all on schema club_private from public, anon, authenticated;
create table if not exists club_private.rechtsfassung (
 version text primary key, inhalt_sha256 text not null, url text not null,
 dokumentiert_am timestamptz not null default now()
);
alter table club_private.rechtsfassung enable row level security;
insert into club_private.rechtsfassung(version,inhalt_sha256,url) values
 ('2026-09-19.3','8b6c98b642daa076e267fef15a364d4863818e90e606dc62c1f42576a38a9397','https://laperle069.github.io/laperle-club/club/recht-2026-09-19-3.html')
on conflict(version) do nothing;
create table if not exists club_private.rechtsnachweis (
 id uuid primary key default gen_random_uuid(), kundin_id uuid not null references public.kundin(id) on delete cascade,
 version text not null references club_private.rechtsfassung(version), altersfreigabe text not null, angenommen_am timestamptz not null default now(),
 bestaetigt_am timestamptz, quelle text not null default 'selbstregistrierung',
 unique(kundin_id, version)
);
create table if not exists club_private.loeschauftrag (
 kundin_id uuid primary key references public.kundin(id) on delete cascade,
 angefordert_am timestamptz not null default now(), quelle text not null,
 gesperrt_bis timestamptz, sperrgrund text, abgeschlossen_am timestamptz,
 check ((gesperrt_bis is null) = (sperrgrund is null))
);
create table if not exists club_private.aufbewahrung (
 id uuid primary key default gen_random_uuid(), kundin_id uuid not null,
 zweck text not null check(zweck in ('beleg','einwilligung','vertrag')),
 daten jsonb not null, loeschen_ab timestamptz not null,
 gesperrt_bis timestamptz, sperrgrund text,
 check ((gesperrt_bis is null) = (sperrgrund is null))
);
create table if not exists club_private.dienstleister_loeschung (
 id uuid primary key default gen_random_uuid(), anbieter text not null,
 kennung text not null, erstellt_am timestamptz not null default now(),
 erledigt_am timestamptz, nachweis text,
 unique(anbieter,kennung)
);
alter table club_private.rechtsnachweis enable row level security;
alter table club_private.loeschauftrag enable row level security;
alter table club_private.aufbewahrung enable row level security;
alter table club_private.dienstleister_loeschung enable row level security;
revoke all on all tables in schema club_private from public,anon,authenticated;

CREATE OR REPLACE FUNCTION public.selbst_registrieren(p_vorname text, p_nachname text, p_email text, p_studio_kennung text DEFAULT NULL::text, p_sprache text DEFAULT 'de'::text, p_werberin text DEFAULT NULL::text, p_rechtsversion text DEFAULT NULL::text, p_altersfreigabe text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare o organisation; st studio; k kundin; nr text; w kundin;
        mail text := lower(trim(p_email)); limit_h int; heute int;
begin
  if p_rechtsversion is distinct from '2026-09-19.3' or coalesce(p_altersfreigabe,'') not in ('volljaehrig','vertretung_bestaetigt') then
    raise exception 'Bitte die aktuellen Teilnahmebedingungen und Altersangabe bestätigen.';
  end if;
  if coalesce(trim(p_vorname), '') = '' or coalesce(trim(p_nachname), '') = '' then
    raise exception 'Bitte Vor- und Nachnamen angeben.';
  end if;
  if mail is null or mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Diese E-Mail-Adresse sieht nicht richtig aus.';
  end if;

  select * into st from studio where kennung = coalesce(p_studio_kennung, 'FFM-01') and aktiv;
  if st.id is null then select * into st from studio where aktiv order by kennung limit 1; end if;
  if st.id is null then raise exception 'Kein aktives Studio hinterlegt.'; end if;
  select * into o from organisation where id = st.organisation_id;

  -- Bremse je Studio: zählt alle Versuche der letzten Stunde
  limit_h := coalesce(_e('registrierung_stundenlimit')::int, 30);
  perform pg_advisory_xact_lock(hashtext('registrierung:' || st.id::text));
  if (select count(*) from registrierungsversuch
       where studio_id = st.id and zeitpunkt > now() - interval '1 hour') >= limit_h then
    raise exception 'Gerade melden sich viele an. Bitte versuch es in einer Stunde noch einmal oder frag am Empfang.';
  end if;
  delete from registrierungsversuch where zeitpunkt < now() - interval '2 days';

  select * into k from kundin where organisation_id = o.id and email = mail;
  if k.id is not null then
    insert into registrierungsversuch (studio_id, neu) values (st.id, false);
    -- Zugang erneut zuschicken – höchstens n-mal am Tag, einmal je Stunde
    select count(*) into heute from nachricht
     where kundin_id = k.id and schluessel like 'zugang_%'
       and erstellt_am > date_trunc('day', now() at time zone 'Europe/Berlin') at time zone 'Europe/Berlin';
    if k.status = 'aktiv' and heute < coalesce(_e('zugang_mails_tag')::int, 3) then
      insert into nachricht (organisation_id, kundin_id, kanal, anlass, betreff, text, schluessel)
      values (o.id, k.id, 'email', 'willkommen', 'Dein Zugang zum La Perlé Club',
              k.vorname || ', hier ist der Link zu deinem Punktestand.',
              'zugang_' || to_char(now(),'YYYYMMDDHH24'))
      on conflict (kundin_id, schluessel) do nothing;
    end if;
    -- gleiche Antwort wie bei neuem Konto: nichts über den Bestand verraten
    return jsonb_build_object('status', 'bestaetigen', 'vorname', trim(p_vorname));
  end if;

  loop
    nr := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    exit when not exists (select 1 from kundin where organisation_id = o.id and kundennummer = nr);
  end loop;

  insert into kundin (organisation_id, kundennummer, vorname, nachname, email,
                      sprache, stammstudio_id, registriert_in, zugangstoken)
  values (o.id, nr, trim(p_vorname), trim(p_nachname), mail,
          case when p_sprache in ('de','en','ru') then p_sprache else 'de' end,
          st.id, st.id, encode(gen_random_bytes(16), 'hex'))
  returning * into k;
  insert into registrierungsversuch (studio_id, neu) values (st.id, true);

  if o.willkommensbonus > 0 then
    insert into punktebewegung (organisation_id, kundin_id, studio_id, betrag, anlass, gueltig_bis)
    values (o.id, k.id, st.id, o.willkommensbonus, 'willkommensbonus',
            case when o.verfall_monate is null then null
                 else (current_date + (o.verfall_monate || ' months')::interval)::date end);
  end if;

  if coalesce(trim(p_werberin), '') <> '' then
    select * into w from kundin
     where organisation_id = o.id and status = 'aktiv'
       and (kundennummer = trim(p_werberin) or lower(email) = lower(trim(p_werberin)))
     limit 1;
    if w.id is not null and w.id <> k.id then
      insert into empfehlung (organisation_id, werberin_id, geworbene_id, erfasst_in)
      values (o.id, w.id, k.id, st.id);
    end if;
  end if;

  insert into club_private.rechtsnachweis(kundin_id,version,altersfreigabe) values(k.id,p_rechtsversion,p_altersfreigabe);
  perform _willkommen(k.id);

  -- KEIN Token mehr in der Antwort: Zugang ausschließlich über das Postfach
  return jsonb_build_object('status', 'bestaetigen', 'vorname', k.vorname);
end $function$;

revoke execute on function public.selbst_registrieren(text,text,text,text,text,text) from public,anon,authenticated;
revoke execute on function public.selbst_registrieren(text,text,text,text,text,text,text,text) from public;
grant execute on function public.selbst_registrieren(text,text,text,text,text,text,text,text) to anon,authenticated;

CREATE OR REPLACE FUNCTION public.einwilligung_setzen(p_token text, p_art text, p_an boolean, p_wortlaut text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare k kundin; erwartet text;
begin
  k := _kundin_per_token(p_token);
  if p_art is null or p_art not in ('email_werbung','push','geburtstag') then raise exception 'Unbekannte Einwilligung.'; end if;

  erwartet := case p_art
when 'email_werbung' then 'E-Mail-Angebote – Ich möchte Angebote, Neuigkeiten sowie auf meinen Besuchen und Perlen beruhende Erinnerungen von La Perlé Beauty Boutique per E-Mail erhalten. Freiwillig und jederzeit im Club oder per E-Mail widerrufbar.'
when 'push' then 'Wallet-Angebote – Ich möchte Angebote und auf meinen Besuchen und Perlen beruhende Hinweise von La Perlé Beauty Boutique auf meiner Wallet-Karte erhalten. Freiwillig und jederzeit im Club oder per E-Mail widerrufbar. Punktestandsaktualisierungen funktionieren auch ohne Werbung.'
when 'geburtstag' then 'Geburtstagsaktion – Ich möchte, dass La Perlé Beauty Boutique mein freiwillig angegebenes Geburtsdatum für einen jährlichen Geburtstagsgruß mit Angebot per E-Mail verwendet. Jederzeit im Club oder per E-Mail widerrufbar.'
else null end;
  if p_an is null or (p_an and p_wortlaut is distinct from erwartet) then raise exception 'Bitte die Seite neu laden und den aktuellen Einwilligungstext bestätigen.'; end if;
  perform pg_advisory_xact_lock(hashtext('einwilligung:'||k.id::text||':'||p_art));
  update einwilligung set widerrufen_am = now()
   where kundin_id = k.id and art = p_art and widerrufen_am is null;

  if p_an then
    insert into einwilligung (kundin_id, art, erteilt_ueber, wortlaut)
    values (k.id, p_art, 'kundenbereich:2026-09-19.3', erwartet);
  end if;
  if not p_an and p_art='geburtstag' then update kundin set geburtsdatum=null where id=k.id; end if;
  return jsonb_build_object('art', p_art, 'aktiv', p_an);
end $function$;

update public.einwilligung set widerrufen_am=now() where widerrufen_am is null and erteilt_ueber is distinct from 'kundenbereich:2026-09-19.3';

CREATE OR REPLACE FUNCTION public.advent_oeffnen(p_token text, p_tag integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
SET timezone TO 'Europe/Berlin'
AS $function$
declare k kundin; o organisation; t advent_tuer; b punktebewegung; e einloesung; gueltig timestamptz;
begin
  if not _an('advent') then raise exception 'Der Adventskalender ist derzeit nicht aktiv.'; end if;
  k := _kundin_per_token(p_token);
  select * into o from organisation where id = k.organisation_id;

  select * into t from advent_tuer
   where organisation_id = o.id and jahr = extract(year from current_date) and tag = p_tag;
  if t.id is null then raise exception 'Türchen nicht gefunden.'; end if;

  if extract(month from current_date) <> 12 then
    raise exception 'Der Kalender öffnet im Dezember.'; end if;
  if extract(day from current_date) < p_tag then
    raise exception 'Dieses Türchen ist noch verschlossen.'; end if;
  if extract(day from current_date) > p_tag then
    raise exception 'Dieses Türchen war nur am %. Dezember offen.', p_tag; end if;

  if exists (select 1 from advent_oeffnung where kundin_id = k.id and tuer_id = t.id) then
    raise exception 'Dieses Türchen ist schon geöffnet.'; end if;

  gueltig := ((coalesce(o.advent_gueltig_bis, make_date(extract(year from current_date)::int+1,1,31)) + 1)::timestamp at time zone 'Europe/Berlin') - interval '1 microsecond';

  if t.art = 'extrapunkte' then
    insert into punktebewegung (organisation_id, kundin_id, betrag, anlass, gueltig_bis)
    values (o.id, k.id, t.punkte, 'advent',
            case when o.verfall_monate is null then null
                 else (current_date + (o.verfall_monate || ' months')::interval)::date end)
    returning * into b;
  else
    insert into einloesung (organisation_id, kundin_id, quelle, praemie_id, bezeichnung, art, nennwert, gueltig_bis)
    values (o.id, k.id, 'advent', t.praemie_id, t.bezeichnung, 'gratisleistung', t.bezeichnung, gueltig)
    returning * into e;
  end if;

  insert into advent_oeffnung (kundin_id, tuer_id, punktebewegung_id, einloesung_id)
  values (k.id, t.id, b.id, e.id);

  return jsonb_build_object('tag', p_tag, 'bezeichnung', t.bezeichnung, 'art', t.art,
                            'punkte', t.punkte, 'gueltig_bis', gueltig,
                            'stand', (select stand from punktekonto where kundin_id = k.id));
end $function$;

CREATE OR REPLACE FUNCTION public.job_aufraeumen()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare s int; m int;
begin
  delete from terminal_sitzung where gueltig_bis < now() - interval '2 days';
  get diagnostics s = row_count;

  -- Reconciliation alone handles unresolved provider responses. Never erase request IDs here.
  m := 0;

  delete from job_lauf where gelaufen_am < now() - interval '180 days';
  return jsonb_build_object('sitzungen_geloescht', s, 'mails_zurueckgestellt', m);
end $function$;


create or replace function public.kunde_rechtsnachweis(p_token text, p_version text, p_altersfreigabe text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin;
begin
 k:=_kundin_per_token(p_token);
 if p_version is distinct from '2026-09-19.3' or coalesce(p_altersfreigabe,'') not in ('volljaehrig','vertretung_bestaetigt') then raise exception 'Bitte Bedingungen und Altersangabe bestätigen.'; end if;
 insert into club_private.rechtsnachweis(kundin_id,version,altersfreigabe,bestaetigt_am,quelle)
 values(k.id,p_version,p_altersfreigabe,now(),'kundenbereich')
 on conflict(kundin_id,version) do update set bestaetigt_am=coalesce(club_private.rechtsnachweis.bestaetigt_am,now()), altersfreigabe=excluded.altersfreigabe;
 return jsonb_build_object('ok',true);
end $$;
revoke all on function public.kunde_rechtsnachweis(text,text,text) from public;
grant execute on function public.kunde_rechtsnachweis(text,text,text) to anon,authenticated;
create or replace function public.kunde_datenschutzstatus(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin;
begin
 k:=_kundin_per_token(p_token);
 return jsonb_build_object('version','2026-09-19.3','angenommen',exists(select 1 from club_private.rechtsnachweis where kundin_id=k.id and version='2026-09-19.3' and bestaetigt_am is not null));
end $$;
revoke all on function public.kunde_datenschutzstatus(text) from public;
grant execute on function public.kunde_datenschutzstatus(text) to anon,authenticated;
create or replace function public.kunde_loeschung_anfordern(p_token text, p_bestaetigt boolean)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin;
begin
 if p_bestaetigt is distinct from true then raise exception 'Bitte die Kontoschließung bestätigen.'; end if;
 k:=_kundin_per_token(p_token);
 perform 1 from kundin where id=k.id for update;
 insert into club_private.loeschauftrag(kundin_id,quelle) values(k.id,'kundenwunsch') on conflict(kundin_id) do nothing;
 update einwilligung set widerrufen_am=coalesce(widerrufen_am,now()) where kundin_id=k.id;
 update nachricht set status='storniert',status_seit=now(),fehler='Konto geschlossen' where kundin_id=k.id and status in ('offen','fehler_temporaer','in_arbeit');
 update kundin set status='loeschung_vorgemerkt',bestenliste=false,zugangstoken=encode(gen_random_bytes(32),'hex'),token_erneuert_am=now() where id=k.id;
 return jsonb_build_object('ok',true,'hinweis','Dein Konto ist geschlossen. Erforderliche Nachweise werden getrennt und befristet aufbewahrt.');
end $$;
revoke all on function public.kunde_loeschung_anfordern(text,boolean) from public;
grant execute on function public.kunde_loeschung_anfordern(text,boolean) to anon,authenticated;
