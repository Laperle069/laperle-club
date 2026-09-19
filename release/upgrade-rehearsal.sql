-- Production upgrade rehearsal. ALWAYS rolls back. No publishing or customer mail.
begin;
set local lock_timeout='2s';
set local statement_timeout='25s';
set local search_path=public,extensions,pg_temp;
create temporary table release_customer_identity on commit drop as select id,zugangstoken,email from kundin;

-- SOURCE db/migrations/029_sicherheit.sql
-- =====================================================================
--  La Perlé Treueprogramm – Migration 029
--  Sicherheit und Zuverlässigkeit nach externer Prüfung
--  Einspielen NACH 028.
--
--  Bearbeitet die bestätigten Befunde B2, B3, B4, B5, B6, B8 und die
--  Wallet-Punkte aus B10. Jeder Block nennt seine Befund-ID.
--  Geschäftsregeln bleiben unverändert.
-- =====================================================================

-- ---------------------------------------------------------------------
--  B6 – Sicherer Suchpfad für alle SECURITY-DEFINER-Funktionen
--
--  Ohne festen search_path könnte ein Angreifer mit CREATE-Recht in
--  einem Schema eine gleichnamige Funktion unterschieben. Der Pfad wird
--  auf die tatsächlich genutzten Schemas begrenzt.
-- ---------------------------------------------------------------------

do $sp$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public, pg_temp', f.sig);
  end loop;
end $sp$;

-- ---------------------------------------------------------------------
--  B2 – Anmeldeversuche begrenzen, Sitzungen widerrufbar
-- ---------------------------------------------------------------------

create table if not exists anmeldeversuch (
  id          bigserial primary key,
  studio_kennung text not null,
  zeitpunkt   timestamptz not null default now(),
  erfolg      boolean not null
);
create index if not exists anmeldeversuch_idx on anmeldeversuch (studio_kennung, zeitpunkt desc);
alter table anmeldeversuch enable row level security;

-- Sitzung bekommt einen Widerruf
alter table terminal_sitzung add column if not exists widerrufen_am timestamptz;

-- Wartezeit nach Fehlversuchen: 5 Fehler in 15 Min → 60 s, 10 → 5 Min,
-- Deckel 15 Min. Bezieht sich auf das Studio, aber ein Erfolg setzt
-- zurück – ein Dauer-Aussperren durch Fremde ist so nicht möglich,
-- weil eine korrekte PIN die Sperre jederzeit aufhebt.
create or replace function _anmeldung_gebremst(p_kennung text)
returns interval language plpgsql security definer as $$
declare fehler int; letzter_erfolg timestamptz; letzter_fehler timestamptz;
begin
  select max(zeitpunkt) into letzter_erfolg from anmeldeversuch
   where studio_kennung = p_kennung and erfolg;
  select count(*), max(zeitpunkt) into fehler, letzter_fehler from anmeldeversuch
   where studio_kennung = p_kennung and not erfolg
     and zeitpunkt > now() - interval '15 minutes'
     and zeitpunkt > coalesce(letzter_erfolg, '-infinity'::timestamptz);
  if fehler >= 10 then
    return greatest(interval '0', letzter_fehler + interval '5 minutes' - now());
  elsif fehler >= 5 then
    return greatest(interval '0', letzter_fehler + interval '60 seconds' - now());
  end if;
  return interval '0';
end $$;

-- Gibt Fehler als {fehler: ...} ZURÜCK statt sie zu werfen: Ein RAISE würde
-- die Transaktion samt Eintrag in anmeldeversuch zurückrollen, und das
-- Limit könnte nie greifen. Die Oberflächen prüfen das Feld.
create or replace function terminal_anmelden(p_studio_kennung text, p_pin text)
returns jsonb language plpgsql security definer as $$
declare st studio; m mitarbeiterin; s terminal_sitzung; bremse interval;
begin
  bremse := _anmeldung_gebremst(p_studio_kennung);
  if bremse > interval '0' then
    return jsonb_build_object('fehler',
      'Zu viele Fehlversuche. Bitte in ' || ceil(extract(epoch from bremse))::int
      || ' Sekunden erneut versuchen.', 'wartezeit', ceil(extract(epoch from bremse))::int);
  end if;

  select * into st from studio where kennung = p_studio_kennung and aktiv;
  if st.id is not null then
    select * into m from mitarbeiterin
     where organisation_id = st.organisation_id and aktiv
       and (studio_id is null or studio_id = st.id)
       and pin_hash = crypt(p_pin, pin_hash)
     limit 1;
  end if;

  if m.id is null then
    insert into anmeldeversuch (studio_kennung, erfolg) values (p_studio_kennung, false);
    -- gleiche Meldung für falsche Kennung und falsche PIN: keine Aufzählung möglich
    return jsonb_build_object('fehler', 'Studio-Kennung oder PIN falsch.');
  end if;

  insert into anmeldeversuch (studio_kennung, erfolg) values (p_studio_kennung, true);
  delete from anmeldeversuch where zeitpunkt < now() - interval '1 day';

  insert into terminal_sitzung (organisation_id, studio_id, mitarbeiterin_id, token, gueltig_bis)
  values (st.organisation_id, st.id, m.id,
          encode(gen_random_bytes(24), 'hex'), now() + interval '12 hours')
  returning * into s;
  delete from terminal_sitzung where gueltig_bis < now() - interval '1 day';

  return jsonb_build_object('token', s.token, 'name', m.name, 'rolle', m.rolle,
                            'studio', st.name, 'gueltig_bis', s.gueltig_bis);
end $$;

-- _sitzung prüft jetzt Widerruf UND ob die Person noch aktiv ist
create or replace function _sitzung(p_token text)
returns terminal_sitzung language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin;
begin
  select * into s from terminal_sitzung
   where token = p_token and gueltig_bis > now() and widerrufen_am is null;
  if s.token is null then raise exception 'Sitzung abgelaufen – bitte neu anmelden.'; end if;
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;
  if m.id is null or not m.aktiv then
    update terminal_sitzung set widerrufen_am = now() where token = s.token;
    raise exception 'Dieser Zugang ist nicht mehr aktiv.';
  end if;
  return s;
end $$;

create or replace function terminal_abmelden(p_token text)
returns jsonb language plpgsql security definer as $$
begin
  update terminal_sitzung set widerrufen_am = now()
   where token = p_token and widerrufen_am is null;
  return jsonb_build_object('ok', true);
end $$;

-- Alle Sitzungen einer Person widerrufen (bei Deaktivierung, PIN-Wechsel)
create or replace function admin_sitzungen_widerrufen(p_token text, p_mitarbeiterin_id uuid)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin; n int;
begin
  s := _admin(p_token);
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;
  if m.rolle <> 'zentrale' then raise exception 'Nur die Zentrale.'; end if;
  update terminal_sitzung set widerrufen_am = now()
   where mitarbeiterin_id = p_mitarbeiterin_id and organisation_id = s.organisation_id
     and widerrufen_am is null;
  get diagnostics n = row_count;
  return jsonb_build_object('widerrufen', n);
end $$;

-- ---------------------------------------------------------------------
--  B3 + B4 – Kundensperre und vollständige Zugehörigkeitsprüfung
--
--  Eine Hilfsfunktion, die jede kundenbezogene Schreibfunktion als
--  Erstes aufruft: sperrt die Kundin für die Dauer der Transaktion
--  (Advisory Lock auf ihrer ID) und prüft Organisation und Status.
-- ---------------------------------------------------------------------

create or replace function _kundin_sperren(p_kundin_id uuid, p_org uuid)
returns kundin language plpgsql security definer as $$
declare k kundin;
begin
  if p_kundin_id is null then raise exception 'Keine Kundin angegeben.'; end if;
  perform pg_advisory_xact_lock(hashtext(p_kundin_id::text));
  select * into k from kundin where id = p_kundin_id and organisation_id = p_org;
  if k.id is null then raise exception 'Kundin nicht gefunden.'; end if;
  if k.status <> 'aktiv' then raise exception 'Dieses Konto ist nicht aktiv.'; end if;
  return k;
end $$;

-- Glücksrad: Sperre + Einmaligkeit je Tag auch in der Datenbank
-- zeitpunkt::date ist nicht IMMUTABLE (Zeitzone) – deshalb eine feste Datumsspalte
alter table gluecksrad_dreh add column if not exists tag date;
update gluecksrad_dreh set tag = (zeitpunkt at time zone 'Europe/Berlin')::date where tag is null;
create or replace function _gluecksrad_tag() returns trigger language plpgsql as $$
begin new.tag := (coalesce(new.zeitpunkt, now()) at time zone 'Europe/Berlin')::date; return new; end $$;
drop trigger if exists gluecksrad_tag_setzen on gluecksrad_dreh;
create trigger gluecksrad_tag_setzen before insert on gluecksrad_dreh
  for each row execute function _gluecksrad_tag();
create unique index if not exists gluecksrad_einmal_taeglich on gluecksrad_dreh (kundin_id, tag);

-- Korrektur: Sperre auf die Kundin der Originalbuchung
create or replace function punkte_korrigieren(p_token text, p_bewegung_id uuid,
       p_betrag int, p_begruendung text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin; alt punktebewegung; k kundin; grenze int;
begin
  s := _sitzung(p_token);
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;

  if coalesce(trim(p_begruendung), '') = '' then
    raise exception 'Bitte eine kurze Begründung angeben – sie steht später im Auszug.'; end if;
  if p_betrag is null or p_betrag = 0 then
    raise exception 'Die Korrektur muss größer oder kleiner als null sein.'; end if;

  grenze := coalesce(_e('korrektur_grenze')::int, 500);
  if m.rolle <> 'zentrale' and abs(p_betrag) > grenze then
    raise exception 'Korrekturen über % Punkte macht die Zentrale. Bitte Rücksprache halten.', grenze;
  end if;

  select * into alt from punktebewegung
   where id = p_bewegung_id and organisation_id = s.organisation_id;
  if alt.id is null then raise exception 'Buchung nicht gefunden.'; end if;

  k := _kundin_sperren(alt.kundin_id, s.organisation_id);

  if exists (select 1 from punktebewegung x where x.korrigiert_id = alt.id) then
    raise exception 'Diese Buchung wurde bereits korrigiert.';
  end if;

  insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                              betrag, anlass, korrigiert_id, begruendung, gueltig_bis)
  values (alt.organisation_id, alt.kundin_id, s.studio_id, s.mitarbeiterin_id,
          p_betrag, 'korrektur', alt.id, trim(p_begruendung), alt.gueltig_bis);

  return jsonb_build_object('korrektur', p_betrag, 'von', m.name,
    'stand', (select coalesce(pk.stand,0) from punktekonto pk where pk.kundin_id = k.id));
end $$;

-- Punkteübernahme: Sperre + Einmaligkeit auch in der Datenbank
create unique index if not exists uebernahme_einmal on punktebewegung (kundin_id)
  where anlass = 'import';

-- Gepatchte Fassungen der bestehenden Funktionen (Original + Sperre/Prüfung)

CREATE OR REPLACE FUNCTION public.praemie_ausgeben(p_token text, p_kundin_id uuid, p_einloesung_id uuid, p_praemie_id uuid, p_kassenbeleg text, p_nachlass_brutto numeric, p_ust numeric DEFAULT 19)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare s terminal_sitzung; o organisation; p praemie; e einloesung; b punktebewegung; stand int;
begin
  s := _sitzung(p_token);
  perform _kundin_sperren(p_kundin_id, s.organisation_id);  -- B3/B4
  select * into o from organisation where id = s.organisation_id;
  if coalesce(trim(p_kassenbeleg), '') = '' then raise exception 'Kassenbon-Nummer fehlt.'; end if;

  if p_einloesung_id is not null then
    select * into e from einloesung where id = p_einloesung_id and kundin_id = p_kundin_id
       and organisation_id = s.organisation_id and status = 'angefordert' for update;
    if e.id is null then raise exception 'Keine offene Einlösung gefunden.'; end if;
    if e.gueltig_bis < now() then raise exception 'Diese Einlösung ist verfallen.'; end if;
  else
    select * into p from praemie where id = p_praemie_id and organisation_id = o.id and aktiv;
    if p.id is null then raise exception 'Prämie nicht gefunden.'; end if;
    if exists (select 1 from praemie_studio ps where ps.praemie_id = p.id)
       and not exists (select 1 from praemie_studio ps
                        where ps.praemie_id = p.id and ps.studio_id = s.studio_id) then
      raise exception 'Diese Prämie wird in diesem Studio nicht ausgegeben.'; end if;
    select pk.stand into stand from punktekonto pk where pk.kundin_id = p_kundin_id;
    if stand < p.punkte then raise exception 'Nicht genug Punkte (% von %).', stand, p.punkte; end if;

    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass)
    values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, -p.punkte, 'einloesung') returning * into b;

    insert into einloesung (organisation_id, kundin_id, quelle, praemie_id, bezeichnung, art, nennwert,
                            gueltig_bis, punktebewegung_id)
    values (o.id, p_kundin_id, 'praemie', p.id, p.bezeichnung, p.art,
            case p.art when 'prozent' then p.wert || ' %' when 'betrag' then p.wert || ' €' else p.bezeichnung end,
            now(), b.id) returning * into e;
  end if;

  update einloesung set status = 'ausgegeben', ausgegeben_am = now(), studio_id = s.studio_id,
         mitarbeiterin_id = s.mitarbeiterin_id, kassenbeleg_nr = trim(p_kassenbeleg),
         nachlass_brutto = p_nachlass_brutto, ust_satz = p_ust
   where id = e.id;

  update kundin set letzter_besuch = now() where id = p_kundin_id;
  return jsonb_build_object('einloesung_id', e.id, 'bezeichnung', e.bezeichnung,
                            'stand', (select pk.stand from punktekonto pk where pk.kundin_id = p_kundin_id));
end $function$;

CREATE OR REPLACE FUNCTION public.gluecksrad_drehen(p_token text, p_kundin_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare s terminal_sitzung; o organisation; felder jsonb; f record; zufall numeric; summe numeric := 0;
        gewinn record; b punktebewegung; e einloesung; ausl uuid;
begin
  if not _an('gluecksrad') then raise exception 'Das Glücksrad ist derzeit nicht aktiv.'; end if;
  s := _sitzung(p_token);
  perform _kundin_sperren(p_kundin_id, s.organisation_id);  -- B3/B4
  select * into o from organisation where id = s.organisation_id;

  select id into ausl from punktebewegung where kundin_id = p_kundin_id and betrag > 0
    and anlass in ('behandlung','produkt') and zeitpunkt::date = current_date order by zeitpunkt desc limit 1;
  if ausl is null then raise exception 'Heute wurde noch nichts gebucht – kein Dreh frei.'; end if;
  if exists (select 1 from gluecksrad_dreh where kundin_id = p_kundin_id and zeitpunkt::date = current_date) then
    raise exception 'Heute wurde schon gedreht.'; end if;

  select jsonb_agg(to_jsonb(g)) into felder from gluecksrad_feld g where organisation_id = o.id and aktiv;

  zufall := random() * 100;
  for f in select * from gluecksrad_feld where organisation_id = o.id and aktiv order by sortierung loop
    summe := summe + f.wahrscheinlichkeit;
    if zufall < summe then gewinn := f; exit; end if;
  end loop;
  if gewinn is null then
    select * into gewinn from gluecksrad_feld where organisation_id = o.id and aktiv
     order by sortierung desc limit 1;
  end if;

  if gewinn.art = 'extrapunkte' then
    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass, gueltig_bis)
    values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, gewinn.punkte, 'gluecksrad',
            case when o.verfall_monate is null then null
                 else (current_date + (o.verfall_monate || ' months')::interval)::date end)
    returning * into b;
  elsif gewinn.art = 'praemie' then
    insert into einloesung (organisation_id, kundin_id, quelle, praemie_id, bezeichnung, art, nennwert, gueltig_bis)
    values (o.id, p_kundin_id, 'gluecksrad', gewinn.praemie_id, gewinn.bezeichnung, 'gratisleistung',
            gewinn.bezeichnung, now() + (o.reservierung_tage || ' days')::interval)
    returning * into e;
  end if;

  insert into gluecksrad_dreh (organisation_id, kundin_id, studio_id, ort, ausgeloest_durch, feld_id,
                               konfig_snapshot, punktebewegung_id, einloesung_id)
  values (o.id, p_kundin_id, s.studio_id, 'terminal', ausl, gewinn.id, felder, b.id, e.id);

  return jsonb_build_object('feld_id', gewinn.id, 'bezeichnung', gewinn.bezeichnung, 'art', gewinn.art,
                            'punkte', gewinn.punkte, 'sortierung', gewinn.sortierung,
                            'stand', (select pk.stand from punktekonto pk where pk.kundin_id = p_kundin_id));
end $function$;

CREATE OR REPLACE FUNCTION public.punkte_uebernehmen(p_token text, p_kundin_id uuid, p_punkte integer, p_beleg text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare s terminal_sitzung; o organisation; k kundin; b punktebewegung; vorher int; nachher int;
begin
  s := _sitzung(p_token);
  perform _kundin_sperren(p_kundin_id, s.organisation_id);  -- B3/B4
  select * into o from organisation where id = s.organisation_id;
  if not o.uebernahme_aktiv then
    raise exception 'Die Übernahme alter Punktestände ist abgeschlossen.'; end if;

  select * into k from kundin where id = p_kundin_id and organisation_id = o.id and status = 'aktiv';
  if k.id is null then raise exception 'Kundin nicht gefunden.'; end if;
  if k.uebernommen_am is not null then
    raise exception 'Für diese Kundin wurde bereits am % übernommen.',
      to_char(k.uebernommen_am, 'DD.MM.YYYY'); end if;

  if p_punkte is null or p_punkte <= 0 then
    raise exception 'Bitte einen Punktestand größer als 0 eintragen.'; end if;
  if p_punkte > o.uebernahme_deckel then
    raise exception 'Mehr als % Punkte kann nur die Zentrale übernehmen. Bitte Rücksprache halten.',
      o.uebernahme_deckel; end if;

  vorher := (_level_stand(p_kundin_id)->>'stufe')::int;

  insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                              betrag, anlass, begruendung, gueltig_bis)
  values (o.id, k.id, s.studio_id, s.mitarbeiterin_id, p_punkte, 'import',
          'Übernahme aus ' || o.uebernahme_quelle
          || coalesce(' · Beleg ' || nullif(trim(p_beleg), ''), ''),
          case when o.verfall_monate is null then null
               else (current_date + (o.verfall_monate || ' months')::interval)::date end)
  returning * into b;

  update kundin set uebernommen_am = now() where id = k.id;

  nachher := (_level_stand(p_kundin_id)->>'stufe')::int;

  return jsonb_build_object('punkte', p_punkte,
    'stand', (select pk.stand from punktekonto pk where pk.kundin_id = k.id),
    'level_aufstieg', case when nachher > vorher
                      then _level_stand(p_kundin_id)->>'name' else null end);
end $function$;

CREATE OR REPLACE FUNCTION public.empfehlung_erfassen(p_token text, p_geworbene_id uuid, p_werberin_suche text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare s terminal_sitzung; w kundin; g kundin;
begin
  s := _sitzung(p_token);
  perform _kundin_sperren(p_geworbene_id, s.organisation_id);  -- B3/B4
  select * into g from kundin where id = p_geworbene_id and organisation_id = s.organisation_id;
  if g.id is null then raise exception 'Kundin nicht gefunden.'; end if;

  select * into w from kundin
   where organisation_id = s.organisation_id and status = 'aktiv'
     and (kundennummer = p_werberin_suche or lower(email) = lower(p_werberin_suche)
          or lower(vorname || ' ' || nachname) like lower('%' || p_werberin_suche || '%'))
   order by (kundennummer = p_werberin_suche) desc limit 1;
  if w.id is null then raise exception 'Werberin nicht gefunden.'; end if;
  if w.id = g.id then raise exception 'Kundin kann sich nicht selbst werben.'; end if;

  if exists (select 1 from punktebewegung where kundin_id = g.id
               and anlass in ('behandlung','produkt','gutscheinkauf')) then
    raise exception 'Die Kundin hatte bereits eine Behandlung – Empfehlung nicht mehr erfassbar.';
  end if;

  insert into empfehlung (organisation_id, werberin_id, geworbene_id, erfasst_in)
  values (s.organisation_id, w.id, g.id, s.studio_id);

  return jsonb_build_object('werberin', w.vorname || ' ' || w.nachname, 'kundennummer', w.kundennummer);
exception when unique_violation then
  raise exception 'Für diese Kundin ist bereits eine Empfehlung hinterlegt.';
end $function$;

CREATE OR REPLACE FUNCTION public.kundin_laden(p_token text, p_suche text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare s terminal_sitzung; k kundin; o organisation; stand int; dreh_offen boolean; lvl jsonb;
begin
  s := _sitzung(p_token);
  select * into o from organisation where id = s.organisation_id;

  select * into k from kundin
   where organisation_id = s.organisation_id and status = 'aktiv'
     and (kundennummer = p_suche or lower(email) = lower(p_suche)
          or lower(vorname || ' ' || nachname) like lower('%' || p_suche || '%'))
   order by (kundennummer = p_suche) desc limit 1;
  if k.id is null then return null; end if;

  select pk.stand into stand from punktekonto pk where pk.kundin_id = k.id;
  lvl := _level_stand(k.id);

  select exists (
    select 1 from punktebewegung b where b.kundin_id = k.id and b.betrag > 0
      and b.anlass in ('behandlung','produkt') and b.zeitpunkt::date = current_date
  ) and not exists (
    select 1 from gluecksrad_dreh d where d.kundin_id = k.id and d.zeitpunkt::date = current_date
  ) into dreh_offen;

  return jsonb_build_object(
    'id', k.id, 'kundennummer', k.kundennummer,
    'name', k.vorname || ' ' || k.nachname, 'email', k.email,
    'registriert_am', k.registriert_am, 'letzter_besuch', k.letzter_besuch,
    'stand', stand, 'dreh_offen', dreh_offen, 'level', lvl,
    -- Nur zeigen, wenn die Kundin zugestimmt hat
    'ziel', case when _an('ziel') and k.ziel_sichtbar and k.ziel_erreicht_am is null
                 then k.ziel else null end,
    'ziel_erreicht', case when _an('ziel') and k.ziel_sichtbar and k.ziel_erreicht_am is not null
                          then k.ziel else null end,  -- B5: gleiche Freigabe wie 'ziel'
    'uebernahme_offen', o.uebernahme_aktiv and k.uebernommen_am is null,
    'uebernahme_quelle', o.uebernahme_quelle,
    'uebernommen_am', k.uebernommen_am,
    'offene_einloesungen', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', e.id, 'bezeichnung', e.bezeichnung, 'art', e.art, 'nennwert', e.nennwert,
        'quelle', e.quelle, 'gueltig_bis', e.gueltig_bis)), '[]'::jsonb)
      from einloesung e where e.kundin_id = k.id and e.status = 'angefordert' and e.gueltig_bis > now()),
    'zahlungsarten', (
      select coalesce(jsonb_agg(jsonb_build_object('id', z.id, 'bezeichnung', z.bezeichnung, 'faktor', z.faktor)
        order by z.sortierung), '[]'::jsonb)
      from zahlungsart z where z.organisation_id = s.organisation_id and z.aktiv),
    'praemien', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id, 'bezeichnung', p.bezeichnung, 'punkte', p.punkte, 'art', p.art,
        'wert', p.wert, 'erreichbar', stand >= p.punkte) order by p.sortierung), '[]'::jsonb)
      from praemie p where p.organisation_id = s.organisation_id and p.aktiv
        and (not exists (select 1 from praemie_studio ps where ps.praemie_id = p.id)
             or exists (select 1 from praemie_studio ps where ps.praemie_id = p.id and ps.studio_id = s.studio_id))),
    'verlauf', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'zeitpunkt', b.zeitpunkt, 'betrag', b.betrag, 'anlass', b.anlass, 'umsatz', b.umsatz_euro)
        order by b.zeitpunkt desc), '[]'::jsonb)
      from (select * from punktebewegung where kundin_id = k.id order by zeitpunkt desc limit 8) b)
  );
end $function$;

-- B5 ist in kundin_laden oben enthalten.

-- ---------------------------------------------------------------------
--  B5 (siehe kundin_laden oben) – Privates Ziel bleibt privat, auch nach dem Erreichen
-- ---------------------------------------------------------------------

-- ---------------------------------------------------------------------
--  B8 – Postausgang: atomar beanspruchen, Einwilligung beim Versand,
--       Tagesbudget
-- ---------------------------------------------------------------------

alter table nachricht add column if not exists beansprucht_am timestamptz;
alter table nachricht add column if not exists status text not null default 'offen';

insert into einstellung (schluessel, wert, hinweis) values
  ('mail_tagesbudget', '250',
   'Höchstzahl Mails am Tag über alle Wege – unter dem Anbieterlimit von 300 halten')
on conflict (schluessel) do nothing;

create or replace function job_mail_senden(p_max int default 40)
returns int language plpgsql security definer as $$
declare n record; req bigint; anz int := 0; key text; absender text; name text;
        antwort text; basis text; heute int; budget int; art text;
begin
  if coalesce(_e('mail_aktiv'),'false') <> 'true' then return 0; end if;
  key := _e('mail_api_key');
  if key is null or key = '' then return 0; end if;
  absender := _e('mail_absender'); name := _e('mail_absendername');
  antwort := _e('mail_antwort_an'); basis := _e('club_basis_url');

  budget := coalesce(_e('mail_tagesbudget')::int, 250);
  select count(*) into heute from nachricht
   where kanal = 'email' and gesendet_am::date = current_date;
  if heute >= budget then return 0; end if;

  for n in
    -- atomar beanspruchen: zwei Läufer nehmen nie dieselbe Zeile
    update nachricht na set beansprucht_am = now(), status = 'in_arbeit'
     where na.id in (
       select id from nachricht
        where kanal = 'email' and gesendet_am is null and request_id is null
          and status = 'offen' and versuche < 3 and faellig_am <= now()
        order by erstellt_am
        limit least(p_max, budget - heute)
        for update skip locked)
    returning na.*
  loop
    -- Einwilligung und Status zum Zeitpunkt des Versands prüfen
    art := case when n.anlass = 'geburtstag' then 'geburtstag'
                when n.anlass in ('verfall_warnung','willkommen') then null
                else 'email_werbung' end;
    if not exists (select 1 from kundin k where k.id = n.kundin_id and k.status = 'aktiv')
       or (art is not null and not exists (
             select 1 from einwilligung e where e.kundin_id = n.kundin_id
              and e.art = art and e.widerrufen_am is null)) then
      update nachricht set status = 'storniert', beansprucht_am = null where id = n.id;
      continue;
    end if;

    select net.http_post(
      url := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object('api-key', key, 'Content-Type', 'application/json'),
      body := jsonb_build_object(
        'sender',  jsonb_build_object('email', absender, 'name', name),
        'replyTo', jsonb_build_object('email', antwort),
        'to', jsonb_build_array(jsonb_build_object(
                'email', (select email from kundin where id = n.kundin_id),
                'name', (select vorname || ' ' || nachname from kundin where id = n.kundin_id))),
        'subject', coalesce(n.betreff, 'La Perlé Club'),
        'htmlContent', _mail_html(coalesce(n.betreff,'La Perlé Club'), n.text,
                                  basis || '?t=' || (select zugangstoken from kundin where id = n.kundin_id),
                                  'Zum Clubbereich',
                                  basis || '?t=' || (select zugangstoken from kundin where id = n.kundin_id)
                                        || '#einwilligungen'),
        'textContent', n.text)
    ) into req;

    update nachricht set request_id = req, versuche = versuche + 1, status = 'gesendet_offen'
     where id = n.id;
    anz := anz + 1;
  end loop;

  -- Hängengebliebene freigeben (Beanspruchung älter als 30 Minuten ohne Ergebnis)
  update nachricht set status = 'offen', beansprucht_am = null
   where status = 'in_arbeit' and beansprucht_am < now() - interval '30 minutes';

  return anz;
end $$;


-- ---------------------------------------------------------------------
--  B1 (Datenbankseite) – Eingabelängen und E-Mail-HTML
-- ---------------------------------------------------------------------

-- Längen begrenzen: gilt für jeden Schreibweg, nicht nur für die Oberfläche
alter table kundin drop constraint if exists kundin_laengen;
alter table kundin add constraint kundin_laengen check (
  length(vorname) <= 60 and length(nachname) <= 60 and length(email) <= 254
  and (ziel is null or length(ziel) <= 200)
  and (spitzname is null or length(spitzname) <= 30)) not valid;
alter table feedback drop constraint if exists feedback_laengen;
alter table feedback add constraint feedback_laengen check (
  (was_gut is null or length(was_gut) <= 1000)
  and (was_besser is null or length(was_besser) <= 1000)) not valid;
-- NOT VALID: bestehende Zeilen bleiben unangetastet, neue müssen passen

-- HTML-Escaping für Mails: Namen und Kampagnentexte landen im HTML-Gerüst
create or replace function _html_esc(p text)
returns text language sql immutable as $$
  select replace(replace(replace(replace(replace(coalesce(p,''),
    '&','&amp;'), '<','&lt;'), '>','&gt;'), '"','&quot;'), '''','&#39;')
$$;

create or replace function _mail_html(p_betreff text, p_text text, p_link text,
       p_linktext text, p_abmelden text default null)
returns text language plpgsql stable as $$
declare logo text := coalesce(_e('logo_url'), '');
begin
return
'<!doctype html><html lang="de"><head><meta charset="utf-8">'
||'<meta name="viewport" content="width=device-width,initial-scale=1">'
||'<style>a[x-apple-data-detectors],.fusszeile a{color:#6E5C44!important;'
||'text-decoration:none!important;font-size:inherit!important;font-family:inherit!important}</style>'
||'</head>'
||'<body style="margin:0;padding:0;background:#F6EFE3;">'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6EFE3;padding:32px 16px;">'
||'<tr><td align="center">'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFCF7;border:1px solid rgba(180,145,83,.28);border-radius:24px;overflow:hidden;">'
||'<tr><td style="background:linear-gradient(170deg,#3A2A17,#211709);padding:26px 32px;text-align:center;">'
|| case when logo = ''
   then '<div style="font-family:Georgia,serif;font-size:13px;letter-spacing:.26em;color:#E2CFA6;">LA PERL&Eacute;</div>'
   else '<img src="' || _html_esc(logo) || '" width="118" alt="La Perl&eacute;" '
     || 'style="width:118px;height:auto;display:block;margin:0 auto;border:0" />' end
||'</td></tr>'
||'<tr><td style="padding:34px 32px 8px;">'
||'<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:400;font-size:27px;line-height:1.2;color:#3B2E1E;">'
|| _html_esc(p_betreff) ||'</h1>'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-weight:300;font-size:16px;line-height:1.7;color:#3B2E1E;">'
|| replace(_html_esc(p_text), E'\n', '<br>') ||'</p>'
|| case when p_link is null then '' else
   '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;"><tr><td '
   ||'style="background:#B49153;border-radius:999px;">'
   ||'<a href="'|| _html_esc(p_link) ||'" style="display:inline-block;padding:15px 30px;font-family:Helvetica,Arial,sans-serif;'
   ||'font-size:16px;letter-spacing:.03em;color:#FFFCF7;text-decoration:none;">'
   || _html_esc(coalesce(p_linktext,'Ansehen')) ||' &rarr;</a></td></tr></table>' end
||'</td></tr>'
||'<tr><td class="fusszeile" style="padding:18px 32px 28px;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-weight:300;font-size:13px;line-height:1.6;color:#6E5C44;">'
||'Du bekommst diese Nachricht als Mitglied im La Perl&eacute; Club.'
|| case when p_abmelden is null then ' Deine Einstellungen &auml;nderst du jederzeit in deinem Clubbereich.'
   else ' <a href="' || _html_esc(p_abmelden) || '" style="color:#7C6029;text-decoration:underline">'
     || 'Hier stellst du ein, was du von uns h&ouml;ren m&ouml;chtest</a> – '
     || 'oder schaltest alles ab.' end
||'</p></td></tr>'
||'<tr><td class="fusszeile" style="background:#F6EFE3;padding:18px 32px;text-align:center;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#6E5C44;">'
||'<span style="color:#6E5C44">La Perl&eacute; Beauty Boutique</span><br>'
||'<span style="color:#6E5C44">Bruchfeldstra&szlig;e 33&nbsp;&middot;&nbsp;60528 Frankfurt am Main</span></p>'
||'</td></tr></table></td></tr></table></body></html>';
end $$;

-- ---------------------------------------------------------------------
--  B10 – Wallet: nur die tatsächlich übertragene Version quittieren
-- ---------------------------------------------------------------------

alter table wallet_pass add column if not exists stand_version bigint not null default 0;
alter table wallet_pass add column if not exists quittiert_version bigint not null default 0;

create or replace function wallet_offene_karten(p_grenze int default 50)
returns jsonb language plpgsql security definer as $$
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
    'object_id', w.object_id, 'kundin_id', w.kundin_id,
    'version', w.stand_version,
    'stand', (select coalesce(pk.stand,0) from punktekonto pk where pk.kundin_id = w.kundin_id),
    'rang', coalesce((_level_stand(w.kundin_id))->>'name', 'Bronze'),
    'naechste', coalesce((
      select p.bezeichnung || ' – noch ' || (p.punkte - coalesce(pk.stand,0)) || ' Perlen'
        from praemie p, punktekonto pk
       where pk.kundin_id = w.kundin_id and p.organisation_id = w.organisation_id
         and p.aktiv and p.punkte > coalesce(pk.stand,0)
       order by p.punkte limit 1), 'Alle Prämien erreichbar'))), '[]'::jsonb)
   from (select * from wallet_pass
          where gespeichert and stand_version > quittiert_version
          order by aktualisiert_am limit p_grenze) w);
end $$;

-- quittiert nur die mitgegebene Version: kam derweil eine neue Buchung,
-- bleibt die Karte offen und wird beim nächsten Lauf erneut gesendet
drop function if exists wallet_quittieren(text[]);
create or replace function wallet_quittieren(p_quittungen jsonb)
returns jsonb language plpgsql security definer as $$
declare q jsonb; n int := 0;
begin
  for q in select * from jsonb_array_elements(p_quittungen) loop
    update wallet_pass set quittiert_version = (q->>'version')::bigint
     where object_id = q->>'object_id'
       and (q->>'version')::bigint > quittiert_version;
    if found then n := n + 1; end if;
  end loop;
  return jsonb_build_object('quittiert', n);
end $$;

-- Jede Buchung erhöht die Version der Karte
create or replace function _wallet_markieren()
returns trigger language plpgsql security definer as $$
begin
  update wallet_pass set stand_version = stand_version + 1, aktualisiert_am = now()
   where kundin_id = new.kundin_id;
  return new;
end $$;

drop trigger if exists wallet_nach_buchung on punktebewegung;
create trigger wallet_nach_buchung after insert on punktebewegung
  for each row execute function _wallet_markieren();

-- ---------------------------------------------------------------------
--  B6 – Rechte: Monatsbericht in die Liste, Abmelden dazu
-- ---------------------------------------------------------------------

create or replace function rechte_setzen()
returns jsonb language plpgsql security definer as $$
declare f text; offen int;
begin
  execute 'revoke execute on all functions in schema public from public, anon, authenticated';
  execute 'revoke all on all tables in schema public from anon, authenticated';
  execute 'revoke all on all sequences in schema public from anon, authenticated';
  execute 'alter default privileges in schema public revoke execute on functions from public, anon, authenticated';
  execute 'alter default privileges in schema public revoke all on tables from anon, authenticated';

  execute 'grant execute on all functions in schema public to service_role';
  execute 'grant all on all tables in schema public to service_role';
  execute 'grant all on all sequences in schema public to service_role';
  execute 'alter default privileges in schema public grant execute on functions to service_role';
  execute 'alter default privileges in schema public grant all on tables to service_role';

  foreach f in array array[
    'terminal_anmelden','terminal_abmelden','kundin_laden','kundin_anlegen','punkte_buchen',
    'praemie_ausgeben','gluecksrad_drehen','punkte_korrigieren','buchungen_der_kundin',
    'punkte_uebernehmen','empfehlung_erfassen',
    'selbst_registrieren','kunde_laden','kunde_einwilligungen','kunde_zusatz','kunde_ziel',
    'einwilligung_setzen','geburtsdatum_setzen','advent_oeffnen','feier_quittieren',
    'bestenliste','spitzname_setzen','feedback_abgeben','bewertung_status_setzen',
    'ziel_setzen','ziel_erreicht','wallet_gespeichert','wallet_kartendaten',
    'admin_kennzahlen','admin_praemienauszug','admin_stammdaten','admin_praemie_speichern',
    'admin_advent_speichern','admin_nachrichten','admin_job_starten',
    'admin_mail_einstellungen','admin_mail_speichern','admin_mail_test','admin_mail_jetzt',
    'admin_kunden','admin_kundin','admin_verhalten','admin_zielgruppe','admin_kunden_export',
    'admin_level','admin_level_speichern','admin_level_simulieren','admin_level_uebernehmen',
    'admin_spitznamen','admin_spitzname_loeschen','admin_uebernahme','admin_uebernahme_einstellen',
    'admin_wallet','admin_funktionen','admin_funktion_schalten','admin_feedback',
    'admin_feedback_gelesen','admin_rueckkehr','admin_kampagnen','admin_kampagne_vorschau',
    'admin_kampagne_senden','admin_kampagne_beenden',
    'admin_aktionen','admin_aktion_anlegen','admin_aktion_beenden',
    'admin_bericht','admin_berichte','admin_sitzungen_widerrufen'
  ] loop
    execute coalesce((
      select string_agg(format('grant execute on function %s to anon;', p.oid::regprocedure), ' ')
        from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
       where ns.nspname = 'public' and p.proname = f), '');
  end loop;

  for f in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity loop
    execute format('alter table public.%I enable row level security', f);
  end loop;

  select count(*) into offen from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute');

  return jsonb_build_object(
    'fuer_anon_aufrufbar', offen,
    'fuer_dienst_aufrufbar', (select count(*) from pg_proc p
                               join pg_namespace ns on ns.oid = p.pronamespace
                              where ns.nspname = 'public'
                                and has_function_privilege('service_role', p.oid, 'execute')),
    'lesbare_tabellen', (select count(*) from information_schema.table_privileges
                          where table_schema='public' and grantee='anon' and privilege_type='SELECT'),
    'tabellen_ohne_rls', (select count(*) from pg_class c join pg_namespace n on n.oid=c.relnamespace
                           where n.nspname='public' and c.relkind='r' and not c.relrowsecurity));
end $$;

-- Suchpfad auch für die in dieser Migration neu angelegten Funktionen
do $sp2$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.prosecdef loop
    execute format('alter function %s set search_path = public, pg_temp', f.sig);
  end loop;
end $sp2$;

select rechte_setzen() as ergebnis;
notify pgrst, 'reload schema';


-- SOURCE db/migrations/030_vorgang_registrierung.sql
-- =====================================================================
--  La Perlé Treueprogramm – Migration 030
--  Nachbesserung nach Gegenprüfung (Claude_Nachbesserung.md, 17.09.2026)
--  Einspielen NACH 029. Noch nicht angewandt (Entwurf für die Gegenprüfung).
--
--  Enthält:
--    N01  Suchpfad: Erweiterungsfunktionen (pgcrypto liegt live im Schema
--         "extensions") werden wieder aufgelöst – geprüfter Pfad
--         "public, extensions, pg_temp". anon/authenticated dürfen in
--         keinem der beiden Schemas Objekte anlegen (live-schema-befund.json).
--    N06  Vorgangskennung (Idempotenz) für alle bedingten Schreibpfade des
--         Terminals + gemeinsame Kundensperre auch in punkte_buchen und
--         job_punkte_verfallen; Empfehlung sperrt beide Konten in fester
--         Reihenfolge; Einmaligkeit per Constraint.
--    N08  Registrierung: kein Zugangstoken mehr an den Browser. Der Zugang
--         kommt ausschließlich per E-Mail; Konto gilt als bestätigt, sobald
--         der Link aus der Mail geöffnet wurde. Missbrauchsbremse je Studio
--         und Deckel für „Link erneut senden".
--    N10  (nur Frontend, siehe terminal/index.html)
--  Geschäftsregeln (Punkte, Faktoren, Prämien, Verfall) bleiben unverändert.
-- =====================================================================

-- ---------------------------------------------------------------------
--  N01 – Suchpfad, der die vorhandenen Erweiterungen sieht
-- ---------------------------------------------------------------------
do $sp$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', f.sig);
  end loop;
end $sp$;

-- Prüfung beim Einspielen: crypt und gen_random_bytes müssen im Pfad liegen,
-- sonst bricht die Migration hier ab (statt später bei der PIN-Anmeldung).
do $chk$
begin
  perform crypt('x', gen_salt('bf'));
  perform gen_random_bytes(4);
exception when undefined_function then
  raise exception 'pgcrypto ist weder in public noch in extensions auflösbar – Migration 030 abgebrochen.';
end $chk$;

-- ---------------------------------------------------------------------
--  N06 – Vorgangskennung: ein zufälliger Schlüssel je beabsichtigter
--  Aktion, vom Client VOR dem ersten Versuch erzeugt. Gleicher Schlüssel
--  und gleiche Nutzlast → bestätigtes Ergebnis erneut; gleicher Schlüssel,
--  andere Nutzlast → Konflikt ohne Wirkung. Verschiedene Schlüssel →
--  beide Buchungen wirksam.
-- ---------------------------------------------------------------------
create table if not exists vorgang (
  organisation_id   uuid not null references organisation(id),
  schluessel        text not null,                 -- vom Client, 16–64 Zeichen
  akteur            text not null,                 -- 'm:<mitarbeiterin_id>' / 'k:<kundin_id>'
  aktion            text not null,                 -- Funktionsname
  nutzlast_hash     text not null,                 -- sha256 der kanonischen Argumente
  ergebnis          jsonb not null,
  erstellt_am       timestamptz not null default now(),
  primary key (organisation_id, schluessel)
);
alter table vorgang enable row level security;
create index if not exists vorgang_alter on vorgang (erstellt_am);
comment on table vorgang is
  'Idempotenz: bestätigte Ergebnisse je Vorgangskennung. Aufbewahrung siehe job_vorgaenge_aufraeumen (Standard 30 Tage, Einstellung vorgang_tage).';

insert into einstellung (schluessel, wert, hinweis) values
  ('vorgang_tage', '30', 'Wie lange bestätigte Vorgangskennungen aufbewahrt werden (Tage). Ein Retry nach dieser Frist würde neu buchen.')
on conflict (schluessel) do nothing;

-- Beginn eines Vorgangs: sperrt die Kennung (Transaktion), liefert ein
-- bereits bestätigtes Ergebnis oder NULL. Wirft bei abweichender Nutzlast.
create or replace function _vorgang_start(p_org uuid, p_akteur text, p_schluessel text,
       p_aktion text, p_nutzlast jsonb)
returns jsonb language plpgsql security definer as $$
declare v vorgang; h text;
begin
  if p_schluessel is null then return null; end if;   -- ohne Kennung: alter Vertrag, keine Idempotenz
  if length(p_schluessel) < 16 or length(p_schluessel) > 64 or p_schluessel !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Ungültige Vorgangskennung.';
  end if;
  -- alle Aufrufe mit derselben Kennung laufen nacheinander
  perform pg_advisory_xact_lock(hashtext('vorgang:' || p_org::text || ':' || p_schluessel));
  h := encode(digest(p_aktion || '|' || p_akteur || '|' || p_nutzlast::text, 'sha256'), 'hex');
  select * into v from vorgang where organisation_id = p_org and schluessel = p_schluessel;
  if v.schluessel is null then return null; end if;
  if v.akteur <> p_akteur or v.aktion <> p_aktion or v.nutzlast_hash <> h then
    raise exception 'Diese Vorgangskennung wurde bereits für eine andere Buchung verwendet.';
  end if;
  return v.ergebnis || jsonb_build_object('wiederholt', true);
end $$;

create or replace function _vorgang_ende(p_org uuid, p_akteur text, p_schluessel text,
       p_aktion text, p_nutzlast jsonb, p_ergebnis jsonb)
returns jsonb language plpgsql security definer as $$
begin
  if p_schluessel is not null then
    insert into vorgang (organisation_id, schluessel, akteur, aktion, nutzlast_hash, ergebnis)
    values (p_org, p_schluessel, p_akteur, p_aktion,
            encode(digest(p_aktion || '|' || p_akteur || '|' || p_nutzlast::text, 'sha256'), 'hex'),
            p_ergebnis);
  end if;
  return p_ergebnis;
end $$;

create or replace function job_vorgaenge_aufraeumen()
returns int language plpgsql security definer as $$
declare n int;
begin
  delete from vorgang where erstellt_am < now() - (coalesce(_e('vorgang_tage'), '30') || ' days')::interval;
  get diagnostics n = row_count;
  return n;
end $$;

-- Sperre für zwei Konten in fester Reihenfolge (Empfehlung: Geworbene + Werberin)
create or replace function _kundinnen_sperren(p_a uuid, p_b uuid, p_org uuid)
returns void language plpgsql security definer as $$
begin
  if p_b is null or p_a = p_b then perform _kundin_sperren(p_a, p_org); return; end if;
  if p_a::text < p_b::text then
    perform _kundin_sperren(p_a, p_org); perform pg_advisory_xact_lock(hashtext(p_b::text));
  else
    perform pg_advisory_xact_lock(hashtext(p_b::text)); perform _kundin_sperren(p_a, p_org);
  end if;
end $$;

-- Einmaligkeit zusätzlich per Constraint (N06): eine Korrektur je Originalbuchung
create unique index if not exists korrektur_einmal on punktebewegung (korrigiert_id)
  where korrigiert_id is not null;
-- uebernahme_einmal (029) und empfehlung.unique(geworbene_id) (001) bestehen bereits.

-- ---- punkte_buchen: Sperre + Vorgangskennung ------------------------
drop function if exists punkte_buchen(text, uuid, numeric, text, uuid);
create or replace function punkte_buchen(p_token text, p_kundin_id uuid, p_umsatz numeric,
                                         p_kategorie text default null,
                                         p_zahlungsart_id uuid default null,
                                         p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; f numeric := 1; zf numeric := 1; za zahlungsart;
        lf numeric := 1; vorher int; nachher int;
        pkt int; b punktebewegung; emp empfehlung; eb punktebewegung; emp_pkt int := 0;
        akteur text; last jsonb; alt jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('kundin', p_kundin_id, 'umsatz', p_umsatz,
                             'kategorie', p_kategorie, 'zahlungsart', p_zahlungsart_id);
  alt := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'punkte_buchen', last);
  if alt is not null then return alt; end if;

  select * into o from organisation where id = s.organisation_id;
  if p_umsatz is null or p_umsatz <= 0 then raise exception 'Betrag muss größer als 0 sein.'; end if;

  -- Empfehlung: Werberin mit sperren, in fester Reihenfolge (N06)
  select * into emp from empfehlung
   where geworbene_id = p_kundin_id and eingeloest_am is null and organisation_id = o.id;
  perform _kundinnen_sperren(p_kundin_id, emp.werberin_id, o.id);

  select coalesce(max(faktor), 1) into f from punkteaktion
   where organisation_id = o.id and current_date between gilt_von and gilt_bis
     and (studio_id is null or studio_id = s.studio_id);

  if p_zahlungsart_id is not null then
    select * into za from zahlungsart where id = p_zahlungsart_id and organisation_id = o.id and aktiv;
    if za.id is null then raise exception 'Zahlungsart unbekannt.'; end if;
    zf := za.faktor;
  end if;

  vorher := (_level_stand(p_kundin_id)->>'stufe')::int;
  lf := coalesce((_level_stand(p_kundin_id)->>'faktor')::numeric, 1);

  pkt := floor(p_umsatz / o.euro_je_punkt * f * zf * lf);

  insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass,
                              umsatz_euro, faktor, zahlungsart_id, zahlungsart_faktor, kategorie, gueltig_bis)
  values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, pkt,
          case when p_kategorie = 'produkt' then 'produkt'
               when p_kategorie = 'gutschein' then 'gutscheinkauf' else 'behandlung' end,
          p_umsatz, f, p_zahlungsart_id, zf, p_kategorie,
          case when o.verfall_monate is null then null else (current_date + (o.verfall_monate || ' months')::interval)::date end)
  returning * into b;

  if o.empfehlung_modus = 'spiegel_erste' and pkt > 0 and emp.id is not null then
    -- nach der Sperre erneut prüfen: erste Behandlung und Empfehlung noch offen?
    select * into emp from empfehlung where id = emp.id and eingeloest_am is null for update;
    if emp.id is not null and not exists (
         select 1 from punktebewegung v
          where v.kundin_id = p_kundin_id and v.anlass in ('behandlung','produkt','gutscheinkauf')
            and v.id <> b.id) then
      emp_pkt := case when o.empfehlung_deckel is null then pkt
                      else least(pkt, o.empfehlung_deckel) end;
      insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                                  betrag, anlass, gueltig_bis)
      values (o.id, emp.werberin_id, s.studio_id, s.mitarbeiterin_id, emp_pkt, 'empfehlung',
              case when o.verfall_monate is null then null
                   else (current_date + (o.verfall_monate || ' months')::interval)::date end)
      returning * into eb;
      update empfehlung set eingeloest_am = now(), ausgeloest_durch = b.id, bewegung_werberin = eb.id
       where id = emp.id;
    end if;
  end if;

  update kundin set letzter_besuch = now() where id = p_kundin_id;

  nachher := (_level_stand(p_kundin_id)->>'stufe')::int;

  erg := jsonb_build_object('punkte', pkt, 'faktor', f, 'zahlungsart_faktor', zf,
    'level_faktor', lf, 'bewegung_id', b.id,
    'empfehlung_gutschrift', emp_pkt,
    'level_aufstieg', case when nachher > vorher
                      then _level_stand(p_kundin_id)->>'name' else null end,
    'stand', (select stand from punktekonto where kundin_id = p_kundin_id));
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'punkte_buchen', last, erg);
end $$;

-- ---- praemie_ausgeben: Vorgangskennung, Studiofreigabe auch bei Einlösung
drop function if exists praemie_ausgeben(text, uuid, uuid, uuid, text, numeric, numeric);
create or replace function praemie_ausgeben(p_token text, p_kundin_id uuid, p_einloesung_id uuid,
       p_praemie_id uuid, p_kassenbeleg text, p_nachlass_brutto numeric, p_ust numeric default 19,
       p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; p praemie; e einloesung; b punktebewegung; stand int;
        akteur text; last jsonb; alt jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('kundin', p_kundin_id, 'einloesung', p_einloesung_id,
                             'praemie', p_praemie_id, 'beleg', trim(p_kassenbeleg),
                             'nachlass', p_nachlass_brutto, 'ust', p_ust);
  alt := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'praemie_ausgeben', last);
  if alt is not null then return alt; end if;

  perform _kundin_sperren(p_kundin_id, s.organisation_id);
  select * into o from organisation where id = s.organisation_id;
  if coalesce(trim(p_kassenbeleg), '') = '' then raise exception 'Kassenbon-Nummer fehlt.'; end if;

  if p_einloesung_id is not null then
    select * into e from einloesung where id = p_einloesung_id and kundin_id = p_kundin_id
       and organisation_id = s.organisation_id and status = 'angefordert' for update;
    if e.id is null then raise exception 'Keine offene Einlösung gefunden.'; end if;
    if e.gueltig_bis < now() then raise exception 'Diese Einlösung ist verfallen.'; end if;
    -- Studiofreigabe gilt auch für bestehende Einlösungen einer studiogebundenen Prämie (N07-Teil)
    if e.praemie_id is not null
       and exists (select 1 from praemie_studio ps where ps.praemie_id = e.praemie_id)
       and not exists (select 1 from praemie_studio ps
                        where ps.praemie_id = e.praemie_id and ps.studio_id = s.studio_id) then
      raise exception 'Diese Prämie wird in diesem Studio nicht ausgegeben.'; end if;
  else
    select * into p from praemie where id = p_praemie_id and organisation_id = o.id and aktiv;
    if p.id is null then raise exception 'Prämie nicht gefunden.'; end if;
    if exists (select 1 from praemie_studio ps where ps.praemie_id = p.id)
       and not exists (select 1 from praemie_studio ps
                        where ps.praemie_id = p.id and ps.studio_id = s.studio_id) then
      raise exception 'Diese Prämie wird in diesem Studio nicht ausgegeben.'; end if;
    select pk.stand into stand from punktekonto pk where pk.kundin_id = p_kundin_id;
    if stand < p.punkte then raise exception 'Nicht genug Punkte (% von %).', stand, p.punkte; end if;

    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass)
    values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, -p.punkte, 'einloesung') returning * into b;

    insert into einloesung (organisation_id, kundin_id, quelle, praemie_id, bezeichnung, art, nennwert,
                            gueltig_bis, punktebewegung_id)
    values (o.id, p_kundin_id, 'praemie', p.id, p.bezeichnung, p.art,
            case p.art when 'prozent' then p.wert || ' %' when 'betrag' then p.wert || ' €' else p.bezeichnung end,
            now(), b.id) returning * into e;
  end if;

  update einloesung set status = 'ausgegeben', ausgegeben_am = now(), studio_id = s.studio_id,
         mitarbeiterin_id = s.mitarbeiterin_id, kassenbeleg_nr = trim(p_kassenbeleg),
         nachlass_brutto = p_nachlass_brutto, ust_satz = p_ust
   where id = e.id;

  update kundin set letzter_besuch = now() where id = p_kundin_id;
  erg := jsonb_build_object('einloesung_id', e.id, 'bezeichnung', e.bezeichnung,
                            'stand', (select pk.stand from punktekonto pk where pk.kundin_id = p_kundin_id));
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'praemie_ausgeben', last, erg);
end $$;

-- ---- punkte_korrigieren: Vorgangskennung ----------------------------
drop function if exists punkte_korrigieren(text, uuid, int, text);
create or replace function punkte_korrigieren(p_token text, p_bewegung_id uuid,
       p_betrag int, p_begruendung text, p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin; alt punktebewegung; k kundin; grenze int;
        akteur text; last jsonb; frueher jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('bewegung', p_bewegung_id, 'betrag', p_betrag, 'grund', trim(p_begruendung));
  frueher := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'punkte_korrigieren', last);
  if frueher is not null then return frueher; end if;

  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;

  if coalesce(trim(p_begruendung), '') = '' then
    raise exception 'Bitte eine kurze Begründung angeben – sie steht später im Auszug.'; end if;
  if p_betrag is null or p_betrag = 0 then
    raise exception 'Die Korrektur muss größer oder kleiner als null sein.'; end if;

  grenze := coalesce(_e('korrektur_grenze')::int, 500);
  if m.rolle <> 'zentrale' and abs(p_betrag) > grenze then
    raise exception 'Korrekturen über % Punkte macht die Zentrale. Bitte Rücksprache halten.', grenze;
  end if;

  select * into alt from punktebewegung
   where id = p_bewegung_id and organisation_id = s.organisation_id;
  if alt.id is null then raise exception 'Buchung nicht gefunden.'; end if;

  k := _kundin_sperren(alt.kundin_id, s.organisation_id);

  if exists (select 1 from punktebewegung x where x.korrigiert_id = alt.id) then
    raise exception 'Diese Buchung wurde bereits korrigiert.';
  end if;

  begin
    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                                betrag, anlass, korrigiert_id, begruendung, gueltig_bis)
    values (alt.organisation_id, alt.kundin_id, s.studio_id, s.mitarbeiterin_id,
            p_betrag, 'korrektur', alt.id, trim(p_begruendung), alt.gueltig_bis);
  exception when unique_violation then
    raise exception 'Diese Buchung wurde bereits korrigiert.';
  end;

  erg := jsonb_build_object('korrektur', p_betrag, 'von', m.name,
    'stand', (select coalesce(pk.stand,0) from punktekonto pk where pk.kundin_id = k.id));
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'punkte_korrigieren', last, erg);
end $$;

-- ---- punkte_uebernehmen: Vorgangskennung ----------------------------
drop function if exists punkte_uebernehmen(text, uuid, integer, text);
create or replace function punkte_uebernehmen(p_token text, p_kundin_id uuid, p_punkte integer,
       p_beleg text default null, p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; k kundin; b punktebewegung; vorher int; nachher int;
        akteur text; last jsonb; frueher jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('kundin', p_kundin_id, 'punkte', p_punkte, 'beleg', nullif(trim(p_beleg), ''));
  frueher := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'punkte_uebernehmen', last);
  if frueher is not null then return frueher; end if;

  perform _kundin_sperren(p_kundin_id, s.organisation_id);
  select * into o from organisation where id = s.organisation_id;
  if not o.uebernahme_aktiv then
    raise exception 'Die Übernahme alter Punktestände ist abgeschlossen.'; end if;

  select * into k from kundin where id = p_kundin_id and organisation_id = o.id and status = 'aktiv';
  if k.id is null then raise exception 'Kundin nicht gefunden.'; end if;
  if k.uebernommen_am is not null then
    raise exception 'Für diese Kundin wurde bereits am % übernommen.',
      to_char(k.uebernommen_am, 'DD.MM.YYYY'); end if;

  if p_punkte is null or p_punkte <= 0 then
    raise exception 'Bitte einen Punktestand größer als 0 eintragen.'; end if;
  if p_punkte > o.uebernahme_deckel then
    raise exception 'Mehr als % Punkte kann nur die Zentrale übernehmen. Bitte Rücksprache halten.',
      o.uebernahme_deckel; end if;

  vorher := (_level_stand(p_kundin_id)->>'stufe')::int;

  begin
    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                                betrag, anlass, begruendung, gueltig_bis)
    values (o.id, k.id, s.studio_id, s.mitarbeiterin_id, p_punkte, 'import',
            'Übernahme aus ' || o.uebernahme_quelle
            || coalesce(' · Beleg ' || nullif(trim(p_beleg), ''), ''),
            case when o.verfall_monate is null then null
                 else (current_date + (o.verfall_monate || ' months')::interval)::date end)
    returning * into b;
  exception when unique_violation then
    raise exception 'Für diese Kundin wurde bereits übernommen.';
  end;

  update kundin set uebernommen_am = now() where id = k.id;
  nachher := (_level_stand(p_kundin_id)->>'stufe')::int;

  erg := jsonb_build_object('punkte', p_punkte,
    'stand', (select pk.stand from punktekonto pk where pk.kundin_id = k.id),
    'level_aufstieg', case when nachher > vorher
                      then _level_stand(p_kundin_id)->>'name' else null end);
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'punkte_uebernehmen', last, erg);
end $$;

-- ---- empfehlung_erfassen: beide Konten sperren, Vorgangskennung -------
drop function if exists empfehlung_erfassen(text, uuid, text);
create or replace function empfehlung_erfassen(p_token text, p_geworbene_id uuid, p_werberin_suche text,
       p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; w kundin; g kundin;
        akteur text; last jsonb; frueher jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('geworbene', p_geworbene_id, 'werberin', p_werberin_suche);
  frueher := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'empfehlung_erfassen', last);
  if frueher is not null then return frueher; end if;

  select * into w from kundin
   where organisation_id = s.organisation_id and status = 'aktiv'
     and (kundennummer = p_werberin_suche or lower(email) = lower(p_werberin_suche)
          or lower(vorname || ' ' || nachname) like lower('%' || p_werberin_suche || '%'))
   order by (kundennummer = p_werberin_suche) desc limit 1;
  if w.id is null then raise exception 'Werberin nicht gefunden.'; end if;

  perform _kundinnen_sperren(p_geworbene_id, w.id, s.organisation_id);
  select * into g from kundin where id = p_geworbene_id and organisation_id = s.organisation_id;
  if g.id is null then raise exception 'Kundin nicht gefunden.'; end if;
  if w.id = g.id then raise exception 'Kundin kann sich nicht selbst werben.'; end if;

  if exists (select 1 from punktebewegung where kundin_id = g.id
               and anlass in ('behandlung','produkt','gutscheinkauf')) then
    raise exception 'Die Kundin hatte bereits eine Behandlung – Empfehlung nicht mehr erfassbar.';
  end if;

  begin
    insert into empfehlung (organisation_id, werberin_id, geworbene_id, erfasst_in)
    values (s.organisation_id, w.id, g.id, s.studio_id);
  exception when unique_violation then
    raise exception 'Für diese Kundin ist bereits eine Empfehlung hinterlegt.';
  end;

  erg := jsonb_build_object('werberin', w.vorname || ' ' || w.nachname, 'kundennummer', w.kundennummer);
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'empfehlung_erfassen', last, erg);
end $$;

-- ---- gluecksrad_drehen: Vorgangskennung (Tageseinmaligkeit bleibt Constraint)
drop function if exists gluecksrad_drehen(text, uuid);
create or replace function gluecksrad_drehen(p_token text, p_kundin_id uuid, p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; felder jsonb; f record; zufall numeric; summe numeric := 0;
        gewinn record; b punktebewegung; e einloesung; ausl uuid;
        akteur text; last jsonb; frueher jsonb; erg jsonb;
begin
  if not _an('gluecksrad') then raise exception 'Das Glücksrad ist derzeit nicht aktiv.'; end if;
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('kundin', p_kundin_id);
  frueher := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'gluecksrad_drehen', last);
  if frueher is not null then return frueher; end if;

  perform _kundin_sperren(p_kundin_id, s.organisation_id);
  select * into o from organisation where id = s.organisation_id;

  select id into ausl from punktebewegung where kundin_id = p_kundin_id and betrag > 0
    and anlass in ('behandlung','produkt') and zeitpunkt::date = current_date order by zeitpunkt desc limit 1;
  if ausl is null then raise exception 'Heute wurde noch nichts gebucht – kein Dreh frei.'; end if;
  if exists (select 1 from gluecksrad_dreh where kundin_id = p_kundin_id and zeitpunkt::date = current_date) then
    raise exception 'Heute wurde schon gedreht.'; end if;

  select jsonb_agg(to_jsonb(g)) into felder from gluecksrad_feld g where organisation_id = o.id and aktiv;

  zufall := random() * 100;
  for f in select * from gluecksrad_feld where organisation_id = o.id and aktiv order by sortierung loop
    summe := summe + f.wahrscheinlichkeit;
    if zufall < summe then gewinn := f; exit; end if;
  end loop;
  if gewinn is null then
    select * into gewinn from gluecksrad_feld where organisation_id = o.id and aktiv
     order by sortierung desc limit 1;
  end if;

  if gewinn.art = 'extrapunkte' then
    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass, gueltig_bis)
    values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, gewinn.punkte, 'gluecksrad',
            case when o.verfall_monate is null then null
                 else (current_date + (o.verfall_monate || ' months')::interval)::date end)
    returning * into b;
  elsif gewinn.art = 'praemie' then
    insert into einloesung (organisation_id, kundin_id, quelle, praemie_id, bezeichnung, art, nennwert, gueltig_bis)
    values (o.id, p_kundin_id, 'gluecksrad', gewinn.praemie_id, gewinn.bezeichnung, 'gratisleistung',
            gewinn.bezeichnung, now() + (o.reservierung_tage || ' days')::interval)
    returning * into e;
  end if;

  begin
    insert into gluecksrad_dreh (organisation_id, kundin_id, studio_id, ort, ausgeloest_durch, feld_id,
                                 konfig_snapshot, punktebewegung_id, einloesung_id)
    values (o.id, p_kundin_id, s.studio_id, 'terminal', ausl, gewinn.id, felder, b.id, e.id);
  exception when unique_violation then
    raise exception 'Heute wurde schon gedreht.';
  end;

  erg := jsonb_build_object('feld_id', gewinn.id, 'bezeichnung', gewinn.bezeichnung, 'art', gewinn.art,
                            'punkte', gewinn.punkte, 'sortierung', gewinn.sortierung,
                            'stand', (select pk.stand from punktekonto pk where pk.kundin_id = p_kundin_id));
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'gluecksrad_drehen', last, erg);
end $$;

-- ---- job_punkte_verfallen: dieselbe Kundensperre, Stand nach dem Warten neu lesen
create or replace function job_punkte_verfallen()
returns int language plpgsql security definer as $$
declare o organisation; k record; n int := 0; st int;
begin
  for o in select * from organisation where verfall_monate is not null loop
    for k in
      select ku.id, ku.organisation_id
        from kundin ku join punktekonto pk on pk.kundin_id = ku.id
       where ku.organisation_id = o.id and ku.status = 'aktiv' and pk.stand > 0
         and coalesce(ku.letzter_besuch, ku.registriert_am)
             < now() - (o.verfall_monate || ' months')::interval
    loop
      perform pg_advisory_xact_lock(hashtext(k.id::text));
      -- nach dem Warten: Stand und Stichtag erneut prüfen (eine parallele Buchung kann beides geändert haben)
      select pk.stand into st from punktekonto pk where pk.kundin_id = k.id;
      if coalesce(st, 0) <= 0 then continue; end if;
      if exists (select 1 from kundin ku where ku.id = k.id
                   and coalesce(ku.letzter_besuch, ku.registriert_am)
                       >= now() - (o.verfall_monate || ' months')::interval) then
        continue;
      end if;
      insert into punktebewegung (organisation_id, kundin_id, betrag, anlass, begruendung)
      values (k.organisation_id, k.id, -st, 'verfall',
              'Automatischer Verfall: ' || o.verfall_monate || ' Monate ohne Besuch');
      n := n + 1;
    end loop;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------
--  N08 – Registrierung ohne sofortigen Zugang
-- ---------------------------------------------------------------------
alter table kundin add column if not exists email_bestaetigt_am timestamptz;
comment on column kundin.email_bestaetigt_am is
  'Zeitpunkt, zu dem der per Mail verschickte Zugangslink erstmals geöffnet wurde (oder: am Empfang angelegt). NULL = noch unbestätigt.';

-- Übergangsregel für Bestandskonten (belegt: Besuch/Buchung = im Studio bestätigt;
-- am Empfang angelegt = registriert_in gesetzt und kein Selbstregistrierungs-Weg).
-- Konten ohne jede Buchung und ohne Besuch bleiben unbestätigt und werden beim
-- ersten Öffnen des Maillinks bestätigt. Offene Frage dazu: ENTSCHEIDUNGEN_OFFEN.md
update kundin k set email_bestaetigt_am = coalesce(k.letzter_besuch, k.registriert_am)
 where k.email_bestaetigt_am is null
   and (k.letzter_besuch is not null
        or exists (select 1 from punktebewegung b where b.kundin_id = k.id
                     and b.anlass in ('behandlung','produkt','gutscheinkauf','import','einloesung')));

-- Registrierungsversuche je Studio (Missbrauchsbremse)
create table if not exists registrierungsversuch (
  id bigserial primary key,
  studio_id uuid references studio(id),
  zeitpunkt timestamptz not null default now(),
  neu boolean not null
);
create index if not exists registrierungsversuch_idx on registrierungsversuch (studio_id, zeitpunkt desc);
alter table registrierungsversuch enable row level security;

insert into einstellung (schluessel, wert, hinweis) values
  ('registrierung_stundenlimit', '30', 'Höchstzahl öffentlicher Registrierungsversuche je Studio und Stunde'),
  ('zugang_mails_tag', '3', 'Wie oft am Tag „Link erneut senden" je Konto ausgelöst werden darf')
on conflict (schluessel) do nothing;

-- Der Zugangslink kommt nur noch per Mail. Öffnen des Links = Bestätigung.
create or replace function _kundin_per_token(p_token text)
returns kundin language plpgsql security definer as $$
declare k kundin;
begin
  select * into k from kundin where zugangstoken = p_token and status = 'aktiv';
  if k.id is null then raise exception 'Zugang ungültig. Bitte im Studio einen neuen Link anfordern.'; end if;
  if k.email_bestaetigt_am is null then
    update kundin set email_bestaetigt_am = now() where id = k.id returning * into k;
  end if;
  return k;
end $$;

drop function if exists selbst_registrieren(text, text, text, text, text, text);
create or replace function selbst_registrieren(
       p_vorname text, p_nachname text, p_email text,
       p_studio_kennung text default null, p_sprache text default 'de',
       p_werberin text default null)
returns jsonb language plpgsql security definer as $$
declare o organisation; st studio; k kundin; nr text; w kundin;
        mail text := lower(trim(p_email)); limit_h int; heute int;
begin
  if coalesce(trim(p_vorname), '') = '' or coalesce(trim(p_nachname), '') = '' then
    raise exception 'Bitte Vor- und Nachnamen angeben.';
  end if;
  if mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
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

  perform _willkommen(k.id);

  -- KEIN Token mehr in der Antwort: Zugang ausschließlich über das Postfach
  return jsonb_build_object('status', 'bestaetigen', 'vorname', k.vorname);
end $$;

-- Empfangsweg: die Mitarbeiterin hat die Adresse aufgenommen, das Konto gilt als bestätigt
drop function if exists kundin_anlegen(text, text, text, text, date, text);
create or replace function kundin_anlegen(p_token text, p_vorname text, p_nachname text,
                                          p_email text, p_geburtsdatum date default null,
                                          p_sprache text default 'de')
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; k kundin; nr text;
begin
  s := _sitzung(p_token);
  select * into o from organisation where id = s.organisation_id;
  if coalesce(trim(p_vorname), '') = '' or coalesce(trim(p_nachname), '') = '' then
    raise exception 'Bitte Vor- und Nachnamen angeben.'; end if;
  if lower(trim(p_email)) !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Diese E-Mail-Adresse sieht nicht richtig aus.'; end if;

  loop
    nr := lpad((floor(random() * 900000) + 100000)::int::text, 6, '0');
    exit when not exists (select 1 from kundin where organisation_id = o.id and kundennummer = nr);
  end loop;

  insert into kundin (organisation_id, kundennummer, vorname, nachname, email, geburtsdatum,
                      sprache, stammstudio_id, registriert_in, zugangstoken, email_bestaetigt_am)
  values (o.id, nr, trim(p_vorname), trim(p_nachname), lower(trim(p_email)), p_geburtsdatum,
          case when p_sprache in ('de','en','ru') then p_sprache else 'de' end,
          s.studio_id, s.studio_id, encode(gen_random_bytes(16), 'hex'), now())
  returning * into k;

  if o.willkommensbonus > 0 then
    insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass, gueltig_bis)
    values (o.id, k.id, s.studio_id, s.mitarbeiterin_id, o.willkommensbonus, 'willkommensbonus',
            case when o.verfall_monate is null then null else (current_date + (o.verfall_monate || ' months')::interval)::date end);
  end if;

  perform _willkommen(k.id);

  return kundin_laden(p_token, k.kundennummer);
exception when unique_violation then
  raise exception 'Mit dieser E-Mail-Adresse gibt es bereits ein Konto.';
end $$;


-- ---------------------------------------------------------------------
--  V32 – Mailvorlage in der Midnight-Privé-Palette (Inline-Stile, 600 px,
--  Systemschrift-Fallback, keine Skripte). Escaping und Abmeldemechanik
--  aus 029 bleiben. Hinweis: Mailclients mit erzwungenem Dunkel-/Hellmodus
--  können Farben umrechnen – das ist eine Formatgrenze, keine Abweichung.
-- ---------------------------------------------------------------------
create or replace function _mail_html(p_betreff text, p_text text, p_link text,
       p_linktext text, p_abmelden text default null)
returns text language plpgsql stable as $$
declare logo text := coalesce(_e('logo_url'), '');
begin
return
'<!doctype html><html lang="de"><head><meta charset="utf-8">'
||'<meta name="viewport" content="width=device-width,initial-scale=1">'
||'<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
||'<title>' || _html_esc(p_betreff) || '</title>'
||'<style>body{margin:0;padding:0;background:#21191A}'
||'a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}'
||'@media (max-width:620px){.aussen{padding:16px 8px!important}.innen{padding-left:20px!important;padding-right:20px!important}}</style>'
||'</head>'
||'<body style="margin:0;padding:0;background:#21191A;">'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#21191A;">'
||'<tr><td align="center" class="aussen" style="padding:32px 16px;">'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#302327;border:1px solid #5A4242;border-radius:18px;">'
||'<tr><td style="padding:26px 32px 18px;text-align:center;border-bottom:1px solid #5A4242;">'
|| case when logo = ''
   then '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:14px;letter-spacing:.26em;color:#DFBE95;">LA PERL&Eacute;</div>'
   else '<img src="' || _html_esc(logo) || '" width="118" alt="La Perl&eacute;" '
     || 'style="width:118px;height:auto;display:block;margin:0 auto;border:0" />' end
||'</td></tr>'
||'<tr><td class="innen" style="padding:32px 32px 8px;">'
||'<h1 style="margin:0 0 16px;font-family:Georgia,''Times New Roman'',serif;font-weight:400;font-size:27px;line-height:1.2;color:#F6E9DF;">'
|| _html_esc(p_betreff) ||'</h1>'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7;color:#F6E9DF;">'
|| replace(_html_esc(p_text), E'\n', '<br>') ||'</p>'
|| case when p_link is null then '' else
   '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;"><tr><td '
   ||'style="background:#E0BE98;border-radius:50px;">'
   ||'<a href="'|| _html_esc(p_link) ||'" style="display:inline-block;padding:15px 30px;font-family:Helvetica,Arial,sans-serif;'
   ||'font-size:16px;font-weight:bold;letter-spacing:.01em;color:#2E211B;text-decoration:none;">'
   || _html_esc(coalesce(p_linktext,'Ansehen')) ||' &rarr;</a></td></tr></table>' end
||'</td></tr>'
||'<tr><td class="innen" style="padding:18px 32px 28px;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#C6ABA8;">'
||'Du bekommst diese Nachricht als Mitglied im La Perl&eacute; Club.'
|| case when p_abmelden is null then ' Deine Einstellungen &auml;nderst du jederzeit in deinem Clubbereich.'
   else ' <a href="' || _html_esc(p_abmelden) || '" style="color:#DFBE95;text-decoration:underline">'
     || 'Hier stellst du ein, was du von uns h&ouml;ren m&ouml;chtest</a> &ndash; '
     || 'oder schaltest alles ab.' end
||'</p></td></tr>'
||'<tr><td style="padding:18px 32px;text-align:center;border-top:1px solid #5A4242;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#C6ABA8;">'
||'La Perl&eacute; Beauty Boutique<br>Bruchfeldstra&szlig;e 33&nbsp;&middot;&nbsp;60528 Frankfurt am Main</p>'
||'</td></tr></table></td></tr></table></body></html>';
end $$;

-- ---------------------------------------------------------------------
--  Suchpfad auch für die neuen Funktionen, Rechte neu setzen
-- ---------------------------------------------------------------------
do $sp2$
declare f record;
begin
  for f in select p.oid::regprocedure as sig from pg_proc p
             join pg_namespace n on n.oid = p.pronamespace
            where n.nspname = 'public' and p.prosecdef loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', f.sig);
  end loop;
end $sp2$;

select rechte_setzen() as ergebnis;
notify pgrst, 'reload schema';

-- Aufräumen alter Vorgangskennungen: täglich, wenn pg_cron vorhanden ist
do $plan$
begin
  perform cron.unschedule('laperle_vorgaenge') from cron.job where jobname = 'laperle_vorgaenge';
  perform cron.schedule('laperle_vorgaenge', '30 4 * * *', 'select job_vorgaenge_aufraeumen()');
exception when others then
  raise notice 'pg_cron nicht verfügbar – job_vorgaenge_aufraeumen() bitte anders einplanen (%).', sqlerrm;
end $plan$;


-- SOURCE db/migrations/031_gegenpruefung.sql
-- =====================================================================
--  La Perlé Treueprogramm – Migration 031
--  Nachbesserung nach Astras Gegenprüfung (Astra_Gegenpruefung_Claude_2026-09-17.md)
--  Einspielen NACH 030. Entwurf für die Gegenprüfung – nicht freigegeben.
--
--  Enthält:
--    T05  Selbstprüfung pgcrypto im expliziten Funktions-Suchpfad; keine
--         CREATE-Rechte für anon/authenticated in public/extensions.
--    R01  vorgang_status(p_token, p_vorgang): authentifizierter Statusabgleich.
--    T05  punkte_buchen: Empfehlung nach der Sperre erneut lesen.
--    N09  Anmeldebremse: Versuche serialisiert; festgelegtes Verhalten bei
--         richtiger PIN während einer Sperre; Sitzungswiderruf dauerhaft
--         (Trigger auf mitarbeiterin, kein UPDATE-vor-RAISE).
--    N07  Rollenmatrix in der Datenbank, durchgesetzt in _admin(); exakte
--         Signaturen für anon versioniert (rechte_setzen/rechte_pruefen).
--    N03  Wallet: echtes Schema, ein Trigger, Übernahme offener Karten,
--         Versionsquittung, Fehler-/Wiederholungslogik, Leases, admin_wallet.
--    N04  Mail: Zustandsautomat (offen, in_arbeit, gesendet_offen, gesendet,
--         fehler_temporaer, fehler_endgueltig, storniert, unklar), Prüfung ohne
--         pg_sleep, Retry ohne blinde Doppelzustellung.
--    N05  Mail-Tageskontingent: atomare Reservierung für alle Versandwege.
--    R03  Altlink-Übergang: Betroffene ermitteln und Ersatz vorbereiten –
--         OHNE Rotation, OHNE Versand (Freigabe E1 separat, Schalter).
--  Geschäftsregeln (Punkte, Faktoren, Prämien, Verfall) bleiben unverändert.
-- =====================================================================

-- ---------------------------------------------------------------------
--  T05 – Selbstprüfung im richtigen Kontext
-- ---------------------------------------------------------------------
-- Die Prüfung läuft in einer Funktion mit GENAU dem Suchpfad, den alle
-- SECURITY-DEFINER-Funktionen erhalten – nicht im Pfad des Migrationsaufrufers.
create or replace function _selbstpruefung_pgcrypto()
returns text language plpgsql security definer
set search_path = public, extensions, pg_temp as $$
begin
  perform crypt('x', gen_salt('bf'));
  perform gen_random_bytes(4);
  perform encode(digest('x', 'sha256'), 'hex');
  return 'ok';
exception when undefined_function then
  return sqlerrm;
end $$;
do $chk$
declare r text;
begin
  r := _selbstpruefung_pgcrypto();
  if r <> 'ok' then
    raise exception 'pgcrypto im Funktions-Suchpfad (public, extensions, pg_temp) nicht auflösbar: % – Migration 031 abgebrochen.', r;
  end if;
  -- Kein Objekt-Anlegen für nicht vertrauenswürdige Rollen in den Schemas des Suchpfads
  if has_schema_privilege('anon', 'public', 'CREATE') or has_schema_privilege('authenticated', 'public', 'CREATE')
     or has_schema_privilege('anon', 'extensions', 'CREATE') or has_schema_privilege('authenticated', 'extensions', 'CREATE') then
    raise exception 'anon/authenticated dürfen in public oder extensions Objekte anlegen – erst entziehen (revoke create on schema …), dann 031 einspielen.';
  end if;
end $chk$;
drop function _selbstpruefung_pgcrypto();

-- ---------------------------------------------------------------------
--  R01 – Statusabgleich eines Vorgangs (authentifiziert über die Terminalsitzung)
-- ---------------------------------------------------------------------
-- Antwort: {status:'bestaetigt', aktion, erstellt_am, eigener bool, ergebnis}
--      oder {status:'unbekannt'}. „unbekannt“ heißt: bis jetzt nicht festgeschrieben.
-- Die Funktion nimmt dieselbe Beratungssperre wie _vorgang_start – läuft die
-- Buchung gerade noch, wartet der Abgleich auf ihr Ende, statt zu früh
-- „unbekannt“ zu melden. Ein Retry mit demselben Schlüssel bleibt in jedem Fall
-- idempotent; der Abgleich ersetzt also nicht die Kennung, er informiert.
create or replace function vorgang_status(p_token text, p_vorgang text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; v vorgang;
begin
  s := _sitzung(p_token);
  if p_vorgang is null or length(p_vorgang) < 16 or length(p_vorgang) > 64 or p_vorgang !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'Ungültige Vorgangskennung.';
  end if;
  perform pg_advisory_xact_lock(hashtext('vorgang:' || s.organisation_id::text || ':' || p_vorgang));
  select * into v from vorgang where organisation_id = s.organisation_id and schluessel = p_vorgang;
  if v.schluessel is null then return jsonb_build_object('status', 'unbekannt'); end if;
  return jsonb_build_object('status', 'bestaetigt', 'aktion', v.aktion, 'erstellt_am', v.erstellt_am,
                            'eigener', v.akteur = 'm:' || s.mitarbeiterin_id::text,
                            'ergebnis', v.ergebnis);
end $$;

-- ---------------------------------------------------------------------
--  T05 – punkte_buchen: Empfehlung nach der Sperre erneut lesen
-- ---------------------------------------------------------------------
create or replace function punkte_buchen(p_token text, p_kundin_id uuid, p_umsatz numeric,
                                         p_kategorie text default null,
                                         p_zahlungsart_id uuid default null,
                                         p_vorgang text default null)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; o organisation; f numeric := 1; zf numeric := 1; za zahlungsart;
        lf numeric := 1; vorher int; nachher int;
        pkt int; b punktebewegung; emp empfehlung; eb punktebewegung; emp_pkt int := 0;
        akteur text; last jsonb; alt jsonb; erg jsonb;
begin
  s := _sitzung(p_token);
  akteur := 'm:' || s.mitarbeiterin_id::text;
  last := jsonb_build_object('kundin', p_kundin_id, 'umsatz', p_umsatz,
                             'kategorie', p_kategorie, 'zahlungsart', p_zahlungsart_id);
  alt := _vorgang_start(s.organisation_id, akteur, p_vorgang, 'punkte_buchen', last);
  if alt is not null then return alt; end if;

  select * into o from organisation where id = s.organisation_id;
  if p_umsatz is null or p_umsatz <= 0 then raise exception 'Betrag muss größer als 0 sein.'; end if;

  -- Empfehlung: Werberin mit sperren, in fester Reihenfolge (N06)
  select * into emp from empfehlung
   where geworbene_id = p_kundin_id and eingeloest_am is null and organisation_id = o.id;
  perform _kundinnen_sperren(p_kundin_id, emp.werberin_id, o.id);
  -- T05: NACH der Sperre erneut nach der Kundin suchen – eine zeitgleich erfasste
  -- Empfehlung (empfehlung_erfassen hält beide Sperren und schreibt vor uns fest)
  -- darf der Erstbuchung nicht entgehen. Kam sie erst jetzt hinzu, ist die Werberin
  -- noch nicht gesperrt: Sperre nur versuchen (kein Warten → keine Verklemmung); die
  -- Gutschrift selbst ist ein unbedingter Insert und braucht die Beratungssperre nicht.
  select * into emp from empfehlung
   where geworbene_id = p_kundin_id and eingeloest_am is null and organisation_id = o.id;
  if emp.id is not null and emp.werberin_id <> p_kundin_id then
    perform pg_try_advisory_xact_lock(hashtext(emp.werberin_id::text));
  end if;

  select coalesce(max(faktor), 1) into f from punkteaktion
   where organisation_id = o.id and current_date between gilt_von and gilt_bis
     and (studio_id is null or studio_id = s.studio_id);

  if p_zahlungsart_id is not null then
    select * into za from zahlungsart where id = p_zahlungsart_id and organisation_id = o.id and aktiv;
    if za.id is null then raise exception 'Zahlungsart unbekannt.'; end if;
    zf := za.faktor;
  end if;

  vorher := (_level_stand(p_kundin_id)->>'stufe')::int;
  lf := coalesce((_level_stand(p_kundin_id)->>'faktor')::numeric, 1);

  pkt := floor(p_umsatz / o.euro_je_punkt * f * zf * lf);

  insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id, betrag, anlass,
                              umsatz_euro, faktor, zahlungsart_id, zahlungsart_faktor, kategorie, gueltig_bis)
  values (o.id, p_kundin_id, s.studio_id, s.mitarbeiterin_id, pkt,
          case when p_kategorie = 'produkt' then 'produkt'
               when p_kategorie = 'gutschein' then 'gutscheinkauf' else 'behandlung' end,
          p_umsatz, f, p_zahlungsart_id, zf, p_kategorie,
          case when o.verfall_monate is null then null else (current_date + (o.verfall_monate || ' months')::interval)::date end)
  returning * into b;

  if o.empfehlung_modus = 'spiegel_erste' and pkt > 0 and emp.id is not null then
    -- nach der Sperre erneut prüfen: erste Behandlung und Empfehlung noch offen?
    select * into emp from empfehlung where id = emp.id and eingeloest_am is null for update;
    if emp.id is not null and not exists (
         select 1 from punktebewegung v
          where v.kundin_id = p_kundin_id and v.anlass in ('behandlung','produkt','gutscheinkauf')
            and v.id <> b.id) then
      emp_pkt := case when o.empfehlung_deckel is null then pkt
                      else least(pkt, o.empfehlung_deckel) end;
      insert into punktebewegung (organisation_id, kundin_id, studio_id, mitarbeiterin_id,
                                  betrag, anlass, gueltig_bis)
      values (o.id, emp.werberin_id, s.studio_id, s.mitarbeiterin_id, emp_pkt, 'empfehlung',
              case when o.verfall_monate is null then null
                   else (current_date + (o.verfall_monate || ' months')::interval)::date end)
      returning * into eb;
      update empfehlung set eingeloest_am = now(), ausgeloest_durch = b.id, bewegung_werberin = eb.id
       where id = emp.id;
    end if;
  end if;

  update kundin set letzter_besuch = now() where id = p_kundin_id;

  nachher := (_level_stand(p_kundin_id)->>'stufe')::int;

  erg := jsonb_build_object('punkte', pkt, 'faktor', f, 'zahlungsart_faktor', zf,
    'level_faktor', lf, 'bewegung_id', b.id,
    'empfehlung_gutschrift', emp_pkt,
    'level_aufstieg', case when nachher > vorher
                      then _level_stand(p_kundin_id)->>'name' else null end,
    'stand', (select stand from punktekonto where kundin_id = p_kundin_id));
  return _vorgang_ende(s.organisation_id, akteur, p_vorgang, 'punkte_buchen', last, erg);
end $$;

-- ---------------------------------------------------------------------
--  N09 – Anmeldebremse und Sitzungswiderruf
-- ---------------------------------------------------------------------
-- Festgelegtes Verhalten (siehe DATENVERTRAEGE.md):
--   * Fehlversuche je Studio-Kennung werden unter einer Beratungssperre gezählt
--     und eingetragen – parallele Versuche können das Limit nicht unterlaufen.
--   * 5 Fehlversuche in 15 Min → 60 s Sperre, 10 → 5 Min (Deckel), gemessen ab
--     dem letzten gezählten Fehlversuch.
--   * Während der Sperre wird JEDE Anfrage abgewiesen – auch mit richtiger PIN.
--     Anfragen während der Sperre werden nicht gezählt und verlängern sie nicht.
--     Damit ist die Auswirkung auf berechtigte Nutzung auf höchstens 5 Minuten
--     seit dem letzten Fremdversuch begrenzt; ein dauerhaftes Aussperren durch
--     Dauerfeuer ist möglich, aber nur mit fortlaufend NEUEN Fehlversuchen nach
--     jedem Sperrablauf – das ist im Backend (anmeldeversuch) sichtbar.
--   * Eine richtige PIN hebt die Sperre NICHT vorzeitig auf (das würde Raten in
--     den Sperrpausen belohnen). Der frühere Kommentar war falsch.
create or replace function terminal_anmelden(p_studio_kennung text, p_pin text)
returns jsonb language plpgsql security definer as $$
declare st studio; m mitarbeiterin; s terminal_sitzung; bremse interval; kenn text;
begin
  kenn := upper(coalesce(trim(p_studio_kennung), ''));
  -- alle Versuche derselben Kennung nacheinander (Zählen + Eintragen atomar)
  perform pg_advisory_xact_lock(hashtext('anmeldung:' || kenn));
  bremse := _anmeldung_gebremst(kenn);
  if bremse > interval '0' then
    return jsonb_build_object('fehler',
      'Zu viele Fehlversuche. Bitte in ' || ceil(extract(epoch from bremse))::int
      || ' Sekunden erneut versuchen.', 'wartezeit', ceil(extract(epoch from bremse))::int);
  end if;

  select * into st from studio where kennung = p_studio_kennung and aktiv;
  if st.id is null then select * into st from studio st2 where upper(st2.kennung) = kenn and st2.aktiv; end if;
  if st.id is not null then
    select * into m from mitarbeiterin
     where organisation_id = st.organisation_id and aktiv
       and (studio_id is null or studio_id = st.id)
       and pin_hash = crypt(p_pin, pin_hash)
     limit 1;
  end if;

  if m.id is null then
    insert into anmeldeversuch (studio_kennung, erfolg) values (kenn, false);
    return jsonb_build_object('fehler', 'Studio-Kennung oder PIN falsch.');
  end if;

  insert into anmeldeversuch (studio_kennung, erfolg) values (kenn, true);
  delete from anmeldeversuch where zeitpunkt < now() - interval '1 day';

  insert into terminal_sitzung (organisation_id, studio_id, mitarbeiterin_id, token, gueltig_bis)
  values (st.organisation_id, st.id, m.id,
          encode(gen_random_bytes(24), 'hex'), now() + interval '12 hours')
  returning * into s;
  delete from terminal_sitzung where gueltig_bis < now() - interval '1 day';

  return jsonb_build_object('token', s.token, 'name', m.name, 'rolle', m.rolle,
                            'studio', st.name, 'gueltig_bis', s.gueltig_bis);
end $$;

-- Widerruf dauerhaft: nicht in _sitzung (dort rollt das RAISE das UPDATE zurück),
-- sondern am Deaktivierungs-/PIN-Wechselpfad selbst.
create or replace function _mitarbeiterin_widerruf()
returns trigger language plpgsql security definer as $$
begin
  if (old.aktiv and not new.aktiv) or old.pin_hash is distinct from new.pin_hash
     or old.rolle is distinct from new.rolle or old.studio_id is distinct from new.studio_id then
    update terminal_sitzung set widerrufen_am = now()
     where mitarbeiterin_id = new.id and widerrufen_am is null;
  end if;
  return new;
end $$;
drop trigger if exists mitarbeiterin_widerruf on mitarbeiterin;
create trigger mitarbeiterin_widerruf after update on mitarbeiterin
  for each row execute function _mitarbeiterin_widerruf();
-- Bestand: Sitzungen bereits deaktivierter Personen jetzt widerrufen
update terminal_sitzung s set widerrufen_am = now()
  from mitarbeiterin m where m.id = s.mitarbeiterin_id and not m.aktiv and s.widerrufen_am is null;

create or replace function _sitzung(p_token text)
returns terminal_sitzung language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin;
begin
  select * into s from terminal_sitzung
   where token = p_token and gueltig_bis > now() and widerrufen_am is null;
  if s.token is null then raise exception 'Sitzung abgelaufen – bitte neu anmelden.'; end if;
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;
  if m.id is null or not m.aktiv then
    -- der Widerruf ist bereits per Trigger geschehen; hier nur abweisen
    raise exception 'Dieser Zugang ist nicht mehr aktiv.';
  end if;
  return s;
end $$;

-- ---------------------------------------------------------------------
--  N07 – Rollenmatrix serverseitig
-- ---------------------------------------------------------------------
-- Jede admin_*-Funktion ruft _admin(p_token). _admin ermittelt die aufrufende
-- Funktion aus dem Server-Aufrufkontext (PG_CONTEXT – vom Server erzeugt, nicht
-- vom Client beeinflussbar) und prüft sie gegen diese Tabelle. Funktionen ohne
-- Eintrag sind für alle abgewiesen (fail closed). Die Frontend-Navigation
-- (NUR_ZENTRALE) ist damit nur noch Darstellung.
create table if not exists rollenmatrix (
  funktion  text primary key,
  rollen    text[] not null,          -- erlaubte Rollen
  hinweis   text
);
alter table rollenmatrix enable row level security;
insert into rollenmatrix (funktion, rollen, hinweis) values
  -- Studioleitung UND Zentrale (Bereiche Kundinnen, Rückkehr, Feedback, Umzug, Auszug)
  ('admin_kunden',            '{studioleitung,zentrale}', 'Kundinnen suchen'),
  ('admin_kundin',            '{studioleitung,zentrale}', 'Kundenkarte'),
  ('admin_spitznamen',        '{studioleitung,zentrale}', 'Spitznamen prüfen'),
  ('admin_spitzname_loeschen','{studioleitung,zentrale}', 'Spitzname entfernen'),
  ('admin_praemienauszug',    '{studioleitung,zentrale}', 'Prämienauszug (Bereich Auszug)'),
  ('admin_rueckkehr',         '{studioleitung,zentrale}', 'Rückkehrfenster'),
  ('admin_feedback',          '{studioleitung,zentrale}', 'Feedback lesen'),
  ('admin_feedback_gelesen',  '{studioleitung,zentrale}', 'Feedback abhaken'),
  ('admin_uebernahme',        '{studioleitung,zentrale}', 'Umzug: Stand'),
  ('admin_wallet',            '{studioleitung,zentrale}', 'Wallet-Überblick (nur Zahlen)'),
  ('admin_funktionen',        '{studioleitung,zentrale}', 'Schalter lesen (Anzeige)'),
  -- nur Zentrale
  ('admin_kennzahlen',        '{zentrale}', 'Überblick'),
  ('admin_bericht',           '{zentrale}', 'Monatsbericht'),
  ('admin_berichte',          '{zentrale}', 'Monatsberichte'),
  ('admin_verhalten',         '{zentrale}', 'Kundenverhalten'),
  ('admin_zielgruppe',        '{zentrale}', 'Zielgruppen'),
  ('admin_kunden_export',     '{zentrale}', 'Export aller Kundinnen'),
  ('admin_stammdaten',        '{zentrale}', 'Prämien/Advent lesen'),
  ('admin_praemie_speichern', '{zentrale}', 'Prämien pflegen'),
  ('admin_advent_speichern',  '{zentrale}', 'Adventskalender pflegen'),
  ('admin_level',             '{zentrale}', 'Ränge'),
  ('admin_level_speichern',   '{zentrale}', 'Ränge pflegen'),
  ('admin_level_simulieren',  '{zentrale}', 'Rangsimulation'),
  ('admin_level_uebernehmen', '{zentrale}', 'Rangschwellen übernehmen'),
  ('admin_aktionen',          '{zentrale}', 'Punkteaktionen'),
  ('admin_aktion_anlegen',    '{zentrale}', 'Aktion anlegen'),
  ('admin_aktion_beenden',    '{zentrale}', 'Aktion beenden'),
  ('admin_kampagnen',         '{zentrale}', 'Mitteilungen'),
  ('admin_kampagne_vorschau', '{zentrale}', 'Mitteilung Vorschau'),
  ('admin_kampagne_senden',   '{zentrale}', 'Mitteilung senden'),
  ('admin_kampagne_beenden',  '{zentrale}', 'Mitteilung beenden'),
  ('admin_nachrichten',       '{zentrale}', 'Postausgang'),
  ('admin_job_starten',       '{zentrale}', 'Lauf starten'),
  ('admin_mail_einstellungen','{zentrale}', 'Mail-Einstellungen'),
  ('admin_mail_speichern',    '{zentrale}', 'Mail-Einstellungen speichern'),
  ('admin_mail_test',         '{zentrale}', 'Testmail'),
  ('admin_mail_jetzt',        '{zentrale}', 'Versand anstoßen'),
  ('admin_mail_pruefen',      '{zentrale}', 'Versandstatus prüfen'),
  ('admin_uebernahme_einstellen','{zentrale}', 'Umzug einstellen'),
  ('admin_funktion_schalten', '{zentrale}', 'Schalter setzen'),
  ('admin_sitzungen_widerrufen','{zentrale}', 'Sitzungen widerrufen'),
  ('admin_altlinks',          '{zentrale}', 'R03: betroffene Altzugänge ermitteln')
on conflict (funktion) do update set rollen = excluded.rollen, hinweis = excluded.hinweis;

-- Aufrufende Funktion aus dem Kontext (zweite Zeile: „PL/pgSQL function name(args) line …“)
create or replace function _aufrufer()
returns text language plpgsql as $$
declare ctx text; m text[];
begin
  get diagnostics ctx = pg_context;
  -- erste Zeile: _aufrufer selbst, zweite: _admin, dritte: die eigentliche admin_*-Funktion
  m := regexp_match(ctx, E'\\nPL/pgSQL function [^\\n]*\\nPL/pgSQL function (?:public\\.)?([a-z_0-9]+)\\(');
  return m[1];
end $$;

create or replace function _admin(p_token text)
returns terminal_sitzung language plpgsql security definer as $$
declare s terminal_sitzung; m mitarbeiterin; fn text; erlaubt text[];
begin
  s := _sitzung(p_token);
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;
  if m.rolle = 'personal' then raise exception 'Kein Zugriff auf die Auswertungen.'; end if;
  fn := _aufrufer();
  select rollen into erlaubt from rollenmatrix where funktion = fn;
  if erlaubt is null then
    raise exception 'Für „%“ ist keine Berechtigung hinterlegt.', coalesce(fn, '?');
  end if;
  if not (m.rolle = any(erlaubt)) then
    raise exception 'Nur die Zentrale.' using hint = fn;
  end if;
  return s;
end $$;

-- ---------------------------------------------------------------------
--  N03 – Wallet an das echte Schema binden
-- ---------------------------------------------------------------------
-- Fachbedeutung „gespeichert“: die Kundin hat die Karte tatsächlich in ihre
-- Wallet gelegt (wallet_gespeichert → zuletzt_abgerufen gesetzt). Nur solche
-- Karten existieren bei Google als Objekt und werden synchronisiert.
alter table wallet_pass add column if not exists naechster_versuch timestamptz;
alter table wallet_pass add column if not exists fehler_anzahl int not null default 0;
alter table wallet_pass add column if not exists letzter_fehler text;
alter table wallet_pass add column if not exists gesperrt_bis timestamptz;      -- Lease eines Sync-Laufs
create index if not exists wallet_pass_offen on wallet_pass (aktualisiert_am)
  where stand_version > quittiert_version and zurueckgezogen_am is null;

-- Genau EIN Trigger (013 legte wallet_markieren an, 029 zusätzlich wallet_nach_buchung)
drop trigger if exists wallet_markieren on punktebewegung;
drop trigger if exists wallet_nach_buchung on punktebewegung;
create or replace function _wallet_markieren()
returns trigger language plpgsql security definer as $$
begin
  update wallet_pass set stand_version = stand_version + 1, aktualisiert_am = now(),
                         aktualisierung_noetig = true
   where kundin_id = new.kundin_id and zurueckgezogen_am is null;
  return new;
end $$;
create trigger wallet_nach_buchung after insert on punktebewegung
  for each row execute function _wallet_markieren();

-- Rang-/Prämienkonfiguration ändert die Kartentexte („Rang“, „Bis zur nächsten Prämie“)
create or replace function _wallet_org_markieren()
returns trigger language plpgsql security definer as $$
begin
  update wallet_pass w set stand_version = stand_version + 1, aktualisiert_am = now(), aktualisierung_noetig = true
    from kundin k where k.id = w.kundin_id and k.organisation_id = coalesce(new.organisation_id, old.organisation_id)
     and w.zurueckgezogen_am is null;
  return null;
end $$;
drop trigger if exists wallet_nach_level on level;
create trigger wallet_nach_level after insert or update or delete on level
  for each row execute function _wallet_org_markieren();
drop trigger if exists wallet_nach_praemie on praemie;
create trigger wallet_nach_praemie after insert or update or delete on praemie
  for each row execute function _wallet_org_markieren();

-- Übernahme: bereits offene Karten (altes Flag) in das Versionsmodell
update wallet_pass set stand_version = quittiert_version + 1, aktualisiert_am = now()
 where aktualisierung_noetig and stand_version <= quittiert_version;

create or replace function wallet_offene_karten(p_grenze int default 50)
returns jsonb language plpgsql security definer as $$
declare lease interval := interval '3 minutes'; ids uuid[] := '{}'; r record;
begin
  -- Auswahl + Lease in einem Schritt: zwei parallele Läufe bekommen nie dieselbe Karte
  for r in
    with kandidaten as (
      select w.id from wallet_pass w
        join kundin k on k.id = w.kundin_id
       where w.plattform = 'google' and w.zurueckgezogen_am is null
         and w.zuletzt_abgerufen is not null                     -- „gespeichert“
         and k.status = 'aktiv'
         and w.stand_version > w.quittiert_version
         and coalesce(w.naechster_versuch, '-infinity') <= now()  -- Fehlerpause vorbei
         and coalesce(w.gesperrt_bis, '-infinity') < now()        -- kein anderer Lauf dran
       order by w.naechster_versuch nulls first, w.aktualisiert_am  -- faire Auswahl: nie fehlgeschlagene zuerst
       limit greatest(1, least(p_grenze, 200))
       for update of w skip locked)
    update wallet_pass w set gesperrt_bis = now() + lease
      from kandidaten c where w.id = c.id
    returning w.id
  loop
    ids := ids || r.id;
  end loop;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'object_id',  w.serien_nummer,
      'kundin_id',  w.kundin_id,
      'version',    w.stand_version,
      'kundennummer', k.kundennummer,
      'stand',      coalesce(pk.stand, 0),
      'rang',       coalesce((_level_stand(w.kundin_id))->>'name', 'Bronze'),
      'naechste',   coalesce((
         select p.bezeichnung || ' – noch ' || (p.punkte - coalesce(pk.stand, 0)) || ' Perlen'
           from praemie p
          where p.organisation_id = k.organisation_id and p.aktiv and p.punkte > coalesce(pk.stand, 0)
          order by p.punkte limit 1), 'Alle Prämien erreichbar')) order by w.aktualisiert_am), '[]'::jsonb)
      from wallet_pass w
      join kundin k on k.id = w.kundin_id
      left join punktekonto pk on pk.kundin_id = w.kundin_id
     where w.id = any(coalesce(ids, '{}')));
end $$;

-- Quittung je Karte: {object_id, version, ok:true} oder {object_id, version, status:int, fehler:text}
--  * ok: quittiert die übertragene Version (nur aufwärts); kam derweil eine neue
--    Buchung, bleibt die Karte offen.
--  * Fehler: Wartezeit wächst (1, 2, 4 … Minuten, Deckel 1 Tag); 404 nach 3 Versuchen
--    und 410 sofort → Karte als bei Google nicht vorhanden markiert (zurueckgezogen_am),
--    damit sie die Warteschlange nicht dauerhaft belegt; 429 → alle 60 s Pause.
create or replace function wallet_quittieren(p_quittungen jsonb)
returns jsonb language plpgsql security definer as $$
declare q jsonb; n int := 0; f int := 0; st int; w wallet_pass; pause interval;
begin
  for q in select * from jsonb_array_elements(p_quittungen) loop
    select * into w from wallet_pass where serien_nummer = q->>'object_id';
    if w.id is null then continue; end if;
    if coalesce((q->>'ok')::boolean, false) then
      update wallet_pass set quittiert_version = greatest(quittiert_version, (q->>'version')::bigint),
             gesperrt_bis = null, naechster_versuch = null, fehler_anzahl = 0, letzter_fehler = null,
             aktualisierung_noetig = (stand_version > greatest(quittiert_version, (q->>'version')::bigint))
       where id = w.id;
      n := n + 1;
    else
      st := coalesce((q->>'status')::int, 0);
      pause := least(interval '1 day', (power(2, least(w.fehler_anzahl, 10)) || ' minutes')::interval);
      if st = 429 then pause := interval '60 seconds'; end if;
      update wallet_pass set fehler_anzahl = fehler_anzahl + 1,
             letzter_fehler = left(coalesce(q->>'fehler', 'HTTP ' || st), 300),
             naechster_versuch = now() + pause, gesperrt_bis = null,
             zurueckgezogen_am = case when st = 410 or (st = 404 and fehler_anzahl + 1 >= 3) then now() else zurueckgezogen_am end
       where id = w.id;
      f := f + 1;
    end if;
  end loop;
  return jsonb_build_object('quittiert', n, 'fehler', f);
end $$;

-- Anzeige = Warteschlange: dieselbe Bedingung wie wallet_offene_karten
create or replace function admin_wallet(p_token text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung;
begin
  s := _admin(p_token);
  return jsonb_build_object(
    'aktiv', coalesce(_e('wallet_aktiv'),'false') = 'true',
    'issuer_id', _e('google_issuer_id'),
    'class_id', _e('google_class_id'),
    'karten', (select count(*) from wallet_pass w join kundin k on k.id = w.kundin_id
                where k.organisation_id = s.organisation_id and w.zurueckgezogen_am is null),
    'gespeichert', (select count(*) from wallet_pass w join kundin k on k.id = w.kundin_id
                     where k.organisation_id = s.organisation_id and w.zuletzt_abgerufen is not null and w.zurueckgezogen_am is null),
    'wartend', (select count(*) from wallet_pass w join kundin k on k.id = w.kundin_id
                 where k.organisation_id = s.organisation_id and w.plattform = 'google' and w.zurueckgezogen_am is null
                   and w.zuletzt_abgerufen is not null and k.status = 'aktiv' and w.stand_version > w.quittiert_version),
    'pausiert', (select count(*) from wallet_pass w join kundin k on k.id = w.kundin_id
                  where k.organisation_id = s.organisation_id and w.zurueckgezogen_am is null
                    and w.stand_version > w.quittiert_version and coalesce(w.naechster_versuch, '-infinity') > now()),
    'kundinnen', (select count(*) from kundin
                   where organisation_id = s.organisation_id and status = 'aktiv'));
end $$;

-- ---------------------------------------------------------------------
--  N05 – Mail-Tageskontingent: eine atomare Reservierung für alle Wege
-- ---------------------------------------------------------------------
insert into einstellung (schluessel, wert, hinweis) values
  ('mail_zeitzone', 'Europe/Berlin', 'Geschäftstag für das Mail-Tageskontingent'),
  ('mail_wiederholungen', '3', 'Höchstzahl Zustellversuche je Nachricht bei vorübergehenden Fehlern'),
  ('mail_unklar_nach_minuten', '30', 'Ohne Antwort des Anbieters nach so vielen Minuten gilt die Zustellung als ungeklärt')
on conflict (schluessel) do nothing;

create table if not exists mail_kontingent (
  tag        date primary key,
  reserviert int not null default 0,     -- jeder Versuch (Anbieter zählt Anfragen, nicht Erfolge)
  bestaetigt int not null default 0
);
alter table mail_kontingent enable row level security;

create or replace function _mail_tag() returns date language sql stable as $$
  select (now() at time zone coalesce(_e('mail_zeitzone'), 'Europe/Berlin'))::date $$;

-- Reserviert bis zu p_anzahl Plätze für heute; liefert die tatsächlich gewährte Zahl.
-- Serialisiert über eine Beratungssperre: zwei Läufer sehen nie denselben Rest.
create or replace function _mail_reservieren(p_anzahl int)
returns int language plpgsql security definer as $$
declare budget int; frei int; heute date; k mail_kontingent;
begin
  if p_anzahl <= 0 then return 0; end if;
  perform pg_advisory_xact_lock(hashtext('mail_kontingent'));
  heute := _mail_tag();
  budget := coalesce(_e('mail_tagesbudget')::int, 250);
  insert into mail_kontingent (tag) values (heute) on conflict (tag) do nothing;
  select * into k from mail_kontingent where tag = heute for update;
  frei := greatest(0, least(p_anzahl, budget - k.reserviert));
  update mail_kontingent set reserviert = reserviert + frei where tag = heute;
  return frei;
end $$;

-- ---------------------------------------------------------------------
--  N04 – Mail-Zustandsautomat
-- ---------------------------------------------------------------------
--  offen ──(beansprucht)──▶ in_arbeit ──(http_post übergeben)──▶ gesendet_offen
--  gesendet_offen ──2xx──▶ gesendet
--                 ──429/5xx/Timeout, Versuche < max──▶ fehler_temporaer (faellig_am später) ──▶ offen
--                 ──4xx sonst / Versuche erschöpft──▶ fehler_endgueltig
--                 ──keine Antwort nach mail_unklar_nach_minuten──▶ unklar   (KEINE automatische Wiederholung)
--  offen/in_arbeit ──Einwilligung/Status weg──▶ storniert
--  in_arbeit älter 30 Min (Läufer abgestürzt vor http_post) ──▶ offen
alter table nachricht drop constraint if exists nachricht_status;
alter table nachricht add constraint nachricht_status check (status in
  ('offen','in_arbeit','gesendet_offen','gesendet','fehler_temporaer','fehler_endgueltig','storniert','unklar'));
alter table nachricht add column if not exists angestossen_am timestamptz;
alter table nachricht add column if not exists status_seit timestamptz not null default now();
create index if not exists nachricht_status_idx on nachricht (status, faellig_am);

-- Bestand: angestoßene Nachrichten ohne Ergebnis (request_id gesetzt, nicht gesendet) NICHT
-- blind erneut senden – sie warten auf die Antwort bzw. werden nach der Frist „unklar“
update nachricht set status = 'gesendet_offen', status_seit = now(),
       angestossen_am = coalesce(angestossen_am, beansprucht_am, erstellt_am)
 where request_id is not null and gesendet_am is null and status in ('offen', 'in_arbeit', 'gesendet_offen');
-- Bestand aus 029: gestrandete gesendet_offen ohne request_id waren Fehler → erneut einplanen
update nachricht set status = 'offen', status_seit = now(), faellig_am = now()
 where status = 'gesendet_offen' and request_id is null and gesendet_am is null and versuche < 3;
update nachricht set status = 'fehler_endgueltig', status_seit = now()
 where status = 'gesendet_offen' and request_id is null and gesendet_am is null and versuche >= 3;
update nachricht set status = 'gesendet' where gesendet_am is not null and status <> 'gesendet';
update nachricht set status = 'storniert' where status = 'storniert';

create or replace function job_mail_senden(p_max int default 40)
returns int language plpgsql security definer as $$
declare n record; req bigint; anz int := 0; key text; absender text; name text;
        antwort text; basis text; frei int; ew_art text; ok boolean;
begin
  if coalesce(_e('mail_aktiv'),'false') <> 'true' then return 0; end if;
  key := _e('mail_api_key');
  if key is null or key = '' then return 0; end if;
  absender := _e('mail_absender'); name := _e('mail_absendername');
  antwort := _e('mail_antwort_an'); basis := _e('club_basis_url');

  -- hängengebliebene Beanspruchungen (Läufer vor der Übergabe abgebrochen) freigeben
  update nachricht set status = 'offen', beansprucht_am = null, status_seit = now()
   where status = 'in_arbeit' and beansprucht_am < now() - interval '30 minutes';
  -- vorübergehend fehlgeschlagene sind wieder fällig
  update nachricht set status = 'offen', status_seit = now()
   where status = 'fehler_temporaer' and faellig_am <= now();

  for n in
    update nachricht na set beansprucht_am = now(), status = 'in_arbeit', status_seit = now()
     where na.id in (
       select id from nachricht
        where kanal = 'email' and status = 'offen' and faellig_am <= now()
        order by erstellt_am
        limit p_max
        for update skip locked)
    returning na.*
  loop
    ew_art := case when n.anlass = 'geburtstag' then 'geburtstag'
                when n.anlass in ('verfall_warnung','willkommen') then null
                else 'email_werbung' end;
    if not exists (select 1 from kundin k where k.id = n.kundin_id and k.status = 'aktiv')
       or (ew_art is not null and not exists (
             select 1 from einwilligung e where e.kundin_id = n.kundin_id
              and e.art = ew_art and e.widerrufen_am is null)) then
      update nachricht set status = 'storniert', beansprucht_am = null, status_seit = now(),
             fehler = 'Einwilligung/Status beim Versand nicht mehr gegeben' where id = n.id;
      continue;
    end if;
    -- Tageskontingent: ein Platz je Versuch, gemeinsam mit allen anderen Wegen
    if _mail_reservieren(1) < 1 then
      update nachricht set status = 'offen', beansprucht_am = null, status_seit = now(),
             faellig_am = greatest(faellig_am, (_mail_tag() + 1)::timestamptz) where id = n.id;
      continue;
    end if;

    select net.http_post(
      url := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object('api-key', key, 'Content-Type', 'application/json'),
      body := jsonb_build_object(
        'sender',  jsonb_build_object('email', absender, 'name', name),
        'replyTo', jsonb_build_object('email', antwort),
        'to', jsonb_build_array(jsonb_build_object(
                'email', (select email from kundin where id = n.kundin_id),
                'name', (select vorname || ' ' || nachname from kundin where id = n.kundin_id))),
        'subject', coalesce(n.betreff, 'La Perlé Club'),
        'htmlContent', _mail_html(coalesce(n.betreff,'La Perlé Club'), n.text,
                                  basis || '?t=' || (select zugangstoken from kundin where id = n.kundin_id),
                                  'Zum Clubbereich',
                                  basis || '?t=' || (select zugangstoken from kundin where id = n.kundin_id)
                                        || '#einwilligungen'),
        'textContent', n.text)
    ) into req;

    update nachricht set request_id = req, versuche = versuche + 1, status = 'gesendet_offen',
           angestossen_am = now(), status_seit = now()
     where id = n.id;
    anz := anz + 1;
  end loop;
  return anz;
end $$;

-- Antworten auswerten. Läuft getrennt vom Senden (pg_net startet erst nach Commit).
create or replace function job_mail_pruefen()
returns jsonb language plpgsql security definer as $$
declare ok int := 0; temp int := 0; endg int := 0; unkl int := 0; n record; stc int; cont text;
        maxv int := coalesce(_e('mail_wiederholungen')::int, 3);
        frist interval := (coalesce(_e('mail_unklar_nach_minuten'), '30') || ' minutes')::interval;
begin
  for n in select * from nachricht where status = 'gesendet_offen' loop
    stc := null; cont := null;
    if n.request_id is not null then
      select status_code, content into stc, cont from net._http_response where id = n.request_id;
    end if;
    if stc is null then
      -- keine Antwort (noch nicht da, verloren oder von pg_net bereits aufgeräumt)
      if coalesce(n.angestossen_am, n.status_seit) < now() - frist then
        update nachricht set status = 'unklar', status_seit = now(),
               fehler = 'Keine Antwort des Anbieters – Zustellung ungeklärt, keine automatische Wiederholung' where id = n.id;
        unkl := unkl + 1;
      end if;
      continue;
    end if;
    if stc between 200 and 299 then
      update nachricht set gesendet_am = now(), fehler = null, status = 'gesendet', status_seit = now() where id = n.id;
      update mail_kontingent set bestaetigt = bestaetigt + 1 where tag = _mail_tag();
      ok := ok + 1;
    elsif (stc = 429 or stc >= 500 or stc = 408) and n.versuche < maxv then
      update nachricht set status = 'fehler_temporaer', status_seit = now(), request_id = null,
             fehler = 'HTTP ' || stc || ': ' || left(coalesce(cont,''), 300),
             faellig_am = now() + (power(2, n.versuche) * 10 || ' minutes')::interval
       where id = n.id;
      temp := temp + 1;
    else
      update nachricht set status = 'fehler_endgueltig', status_seit = now(), request_id = null,
             fehler = 'HTTP ' || stc || ': ' || left(coalesce(cont,''), 300)
       where id = n.id;
      endg := endg + 1;
    end if;
  end loop;
  return jsonb_build_object('gesendet', ok, 'vorruebergehend', temp, 'endgueltig', endg, 'unklar', unkl,
                            'fehlgeschlagen', temp + endg);
end $$;

-- Backend: anstoßen ohne Warten; Prüfen als eigener Aufruf (ersetzt pg_sleep(8))
create or replace function admin_mail_jetzt(p_token text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; a int;
begin
  s := _admin(p_token);
  a := job_mail_senden();
  return jsonb_build_object('angestossen', a,
    'hinweis', 'Antworten kommen nach dem Speichern an – in etwa 10 Sekunden „Status prüfen“ wählen.');
end $$;
create or replace function admin_mail_pruefen(p_token text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung;
begin
  s := _admin(p_token);
  return job_mail_pruefen();
end $$;

-- Testmail zählt im selben Kontingent; Antwort wird als Nachricht ohne Kundin NICHT
-- gespeichert (kein Datensatz) – aber der Platz ist reserviert.
create or replace function admin_mail_test(p_token text, p_an text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; req bigint; key text;
begin
  s := _admin(p_token);
  key := _e('mail_api_key');
  if key is null or key = '' then raise exception 'Kein API-Schlüssel hinterlegt.'; end if;
  if p_an !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Empfängeradresse ungültig.'; end if;
  if _mail_reservieren(1) < 1 then raise exception 'Tageskontingent für Mails erschöpft.'; end if;
  select net.http_post(
    url := 'https://api.brevo.com/v3/smtp/email',
    headers := jsonb_build_object('api-key', key, 'Content-Type', 'application/json'),
    body := jsonb_build_object(
      'sender',  jsonb_build_object('email', _e('mail_absender'), 'name', _e('mail_absendername')),
      'to', jsonb_build_array(jsonb_build_object('email', p_an)),
      'subject', 'Testmail aus dem La Perlé Club',
      'htmlContent', _mail_html('Der Versand läuft',
        'Wenn du diese Nachricht siehst, funktioniert der E-Mail-Versand aus deinem Treueprogramm. '
        || 'Prüf bitte auch, ob sie im Posteingang gelandet ist und nicht im Spam.',
        _e('club_basis_url'), 'Zum Club'))) into req;
  return jsonb_build_object('request_id', req,
    'hinweis', 'In etwa 10 Sekunden im Backend auf „Status prüfen“ klicken.');
end $$;

-- Postausgang zeigt den Zustand statt nur „offen/gesendet“
create or replace function admin_nachrichten(p_token text, p_nur_offen boolean default true)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung;
begin
  s := _admin(p_token);
  return jsonb_build_object(
    'offen', (select count(*) from nachricht
               where organisation_id = s.organisation_id and status in ('offen','in_arbeit','fehler_temporaer')),
    'unklar', (select count(*) from nachricht where organisation_id = s.organisation_id and status = 'unklar'),
    'kontingent', (select jsonb_build_object('tag', tag, 'reserviert', reserviert, 'bestaetigt', bestaetigt,
                                             'budget', coalesce(_e('mail_tagesbudget')::int, 250))
                     from mail_kontingent where tag = _mail_tag()),
    'zeilen', (select coalesce(jsonb_agg(jsonb_build_object(
                 'erstellt_am', n.erstellt_am, 'kanal', n.kanal, 'anlass', n.anlass,
                 'kundin', k.vorname || ' ' || left(k.nachname,1) || '.',
                 'kundennummer', k.kundennummer, 'betreff', n.betreff, 'text', n.text,
                 'gesendet_am', n.gesendet_am, 'status', n.status, 'versuche', n.versuche, 'fehler', n.fehler,
                 'faellig_am', n.faellig_am) order by n.erstellt_am desc), '[]'::jsonb)
               from (select * from nachricht
                      where organisation_id = s.organisation_id
                        and (not p_nur_offen or status not in ('gesendet','storniert'))
                      order by erstellt_am desc limit 100) n
               join kundin k on k.id = n.kundin_id),
    'laeufe', (select coalesce(jsonb_agg(jsonb_build_object(
                 'gelaufen_am', l.gelaufen_am, 'ergebnis', l.ergebnis)
                 order by l.gelaufen_am desc), '[]'::jsonb)
               from (select * from job_lauf order by gelaufen_am desc limit 14) l)
  );
end $$;

-- ---------------------------------------------------------------------
--  R03 – Altzugänge: ermitteln und Ersatz VORBEREITEN (keine Rotation, kein Versand)
-- ---------------------------------------------------------------------
-- Betroffen sind Zugangstokens, die vor 030 ausgegeben wurden (token_erneuert_am <
-- Einspielzeitpunkt) und deren Herkunft nicht als Empfangsweg oder Umzug belegt ist.
-- Herkunft ist im Bestand NICHT sicher erkennbar (Selbstregistrierung schrieb keinen
-- Marker): „selbstregistrierung“ nur bei Einwilligung über „registrierung“, sonst
-- „unsicher“. Ein Besuch belegt nicht, dass niemand sonst den alten Link kennt –
-- deshalb ist „mit Besuch“ nur ausgewiesen, nicht ausgenommen. Umfang der Rotation
-- (p_umfang): 'gefaehrdet' = selbstregistrierung + unsicher (Standard),
-- 'ohne_besuch' = davon nur Konten ohne Besuch/Buchung. Entscheidung: E1.
insert into einstellung (schluessel, wert, hinweis) values
  ('altlink_rotation_freigegeben', 'false', 'E1: erst nach Freigabe der Inhaberin auf true – dann ersetzt job_altlinks_ersetzen() Altzugänge und stellt Zugangsmails ein'),
  ('migration_030_am', now()::text, 'Zeitpunkt, ab dem Zugangslinks nur noch per Mail ausgegeben werden')
on conflict (schluessel) do nothing;

create or replace function _altlink_gruppe(p_org uuid)
returns table (kundin_id uuid, kundennummer text, herkunft text, besuch boolean) language sql security definer stable as $$
  select k.id, k.kundennummer,
         case when exists (select 1 from einwilligung e where e.kundin_id = k.id and e.erteilt_ueber = 'terminal') then 'empfang'
              -- Willkommensbonus vom Empfang trägt eine Mitarbeiterin (002), aus der Selbstregistrierung nicht (004)
              when exists (select 1 from punktebewegung b where b.kundin_id = k.id and b.anlass = 'willkommensbonus' and b.mitarbeiterin_id is not null) then 'empfang'
              when k.registriert_am >= coalesce(_e('migration_030_am')::timestamptz, now())
                   and k.email_bestaetigt_am = k.registriert_am then 'empfang'          -- kundin_anlegen seit 030
              when exists (select 1 from einwilligung e where e.kundin_id = k.id and e.erteilt_ueber = 'registrierung') then 'selbstregistrierung'
              when exists (select 1 from punktebewegung b where b.kundin_id = k.id and b.anlass = 'willkommensbonus' and b.mitarbeiterin_id is null) then 'selbstregistrierung'
              when k.mankido_import_id is not null then 'umzug'
              else 'unsicher' end,
         k.letzter_besuch is not null or exists (select 1 from punktebewegung b where b.kundin_id = k.id
                 and b.anlass in ('behandlung','produkt','gutscheinkauf','einloesung'))
    from kundin k
   where k.organisation_id = p_org and k.status = 'aktiv'
     and k.token_erneuert_am < coalesce(_e('migration_030_am')::timestamptz, now())
$$;

create or replace function admin_altlinks(p_token text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung;
begin
  s := _admin(p_token);
  return (select jsonb_build_object(
    'gesamt', count(*),
    'selbstregistrierung_ohne_besuch', count(*) filter (where herkunft = 'selbstregistrierung' and not besuch),
    'selbstregistrierung_mit_besuch',  count(*) filter (where herkunft = 'selbstregistrierung' and besuch),
    'empfang', count(*) filter (where herkunft = 'empfang'),
    'umzug', count(*) filter (where herkunft = 'umzug'),
    'unsicher', count(*) filter (where herkunft = 'unsicher'),
    'freigegeben', coalesce(_e('altlink_rotation_freigegeben'), 'false') = 'true')
    from _altlink_gruppe(s.organisation_id));
end $$;

-- Ersetzt Altzugänge der gefährdeten Gruppe (Selbstregistrierung ohne Besuch + unsicher):
-- neuer Token, Bestätigung zurückgesetzt, Zugangsmail eingestellt (geht nur bei mail_aktiv).
-- Läuft NUR, wenn E1 freigegeben ist. Punkte bleiben unberührt. Trockenlauf zählt nur.
create or replace function job_altlinks_ersetzen(p_trocken boolean default true, p_umfang text default 'gefaehrdet')
returns jsonb language plpgsql security definer as $$
declare o organisation; g record; n int := 0; k kundin; frei boolean;
begin
  frei := coalesce(_e('altlink_rotation_freigegeben'), 'false') = 'true';
  if p_umfang not in ('gefaehrdet', 'ohne_besuch') then raise exception 'Unbekannter Umfang.'; end if;
  if not p_trocken and not frei then
    raise exception 'E1 nicht freigegeben (Einstellung altlink_rotation_freigegeben).';
  end if;
  for o in select * from organisation loop
    for g in select * from _altlink_gruppe(o.id)
              where herkunft in ('selbstregistrierung', 'unsicher')
                and (p_umfang = 'gefaehrdet' or not besuch) loop
      n := n + 1;
      if p_trocken then continue; end if;
      update kundin set zugangstoken = encode(gen_random_bytes(16), 'hex'), token_erneuert_am = now(),
             email_bestaetigt_am = null
       where id = g.kundin_id returning * into k;
      -- Zugangsmail: vertraglich (kein Werbeanlass), landet im Postausgang und unterliegt dem Kontingent
      insert into nachricht (organisation_id, kundin_id, kanal, anlass, betreff, text, schluessel)
      values (o.id, k.id, 'email', 'willkommen', 'Dein neuer Zugang zum La Perlé Club',
              'Wir haben deinen persönlichen Zugangslink erneuert. Deine Perlen sind unverändert. Öffne den Link in dieser Mail, um deinen Clubbereich zu sehen.',
              'altlink_' || to_char(now(), 'YYYYMMDD'))
      on conflict (kundin_id, schluessel) do nothing;
    end loop;
  end loop;
  return jsonb_build_object('betroffen', n, 'umfang', p_umfang, 'ausgefuehrt', not p_trocken, 'freigegeben', frei);
end $$;

-- ---------------------------------------------------------------------
--  Feier (Astra §5 Punkt 5): Quittierung nur bis zum tatsächlich gezeigten Stand
-- ---------------------------------------------------------------------
-- Der Client übergibt Rangstufe und Prämienzahl der gezeigten Feier. Ist der
-- Server inzwischen weiter (neuer Fortschritt während des offenen Dialogs),
-- bleibt dieser Rest unquittiert und wird beim nächsten Laden gefeiert.
-- Ohne Argumente: alter Vertrag (aktueller Stand). Keine geräteübergreifende
-- Genau-einmal-Garantie – die Quittung ist stand-, nicht ereignisbezogen.
drop function if exists feier_quittieren(text);
create or replace function feier_quittieren(p_token text, p_level int default null, p_praemien int default null)
returns jsonb language plpgsql security definer as $$
declare k kundin; lvl jsonb; frei int; l int; pr int;
begin
  k := _kundin_per_token(p_token);
  lvl := _level_stand(k.id);
  select count(*) into frei from praemie p, punktekonto pk
   where p.organisation_id = k.organisation_id and p.aktiv
     and pk.kundin_id = k.id and p.punkte <= pk.stand;
  l  := least(coalesce(p_level, (lvl->>'stufe')::int), (lvl->>'stufe')::int);
  pr := least(coalesce(p_praemien, frei), frei);
  update kundin set gesehen_level = greatest(coalesce(gesehen_level, 0), l),
                    gesehen_praemien = greatest(coalesce(gesehen_praemien, 0), pr)
   where id = k.id;
  return jsonb_build_object('ok', true, 'gesehen_level', l, 'gesehen_praemien', pr,
                            'offen', ((lvl->>'stufe')::int > l) or (frei > pr));
end $$;

-- ---------------------------------------------------------------------
--  T05 – punkte_buchen (siehe oben, ersetzt)  |  N01 – Suchpfad für alles Neue
-- ---------------------------------------------------------------------
do $sp$
declare f record;
begin
  for f in
    select p.oid::regprocedure as sig
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prosecdef
  loop
    execute format('alter function %s set search_path = public, extensions, pg_temp', f.sig);
  end loop;
end $sp$;

-- ---------------------------------------------------------------------
--  N07 – Rechte: exakte Signaturen versioniert, Prüfung statt Zählen
-- ---------------------------------------------------------------------
create table if not exists rechte_erwartet (
  signatur text primary key      -- z. B. punkte_buchen(text,uuid,numeric,text,uuid,text)
);
alter table rechte_erwartet enable row level security;
truncate rechte_erwartet;
insert into rechte_erwartet values
  ('terminal_anmelden(text,text)'), ('terminal_abmelden(text)'),
  ('kundin_laden(text,text)'), ('kundin_anlegen(text,text,text,text,date,text)'),
  ('punkte_buchen(text,uuid,numeric,text,uuid,text)'),
  ('praemie_ausgeben(text,uuid,uuid,uuid,text,numeric,numeric,text)'),
  ('gluecksrad_drehen(text,uuid,text)'), ('punkte_korrigieren(text,uuid,integer,text,text)'),
  ('buchungen_der_kundin(text,uuid,integer)'), ('punkte_uebernehmen(text,uuid,integer,text,text)'),
  ('empfehlung_erfassen(text,uuid,text,text)'), ('vorgang_status(text,text)'),
  ('selbst_registrieren(text,text,text,text,text,text)'), ('kunde_laden(text)'),
  ('kunde_einwilligungen(text)'), ('kunde_zusatz(text)'), ('kunde_ziel(text)'),
  ('einwilligung_setzen(text,text,boolean,text)'), ('geburtsdatum_setzen(text,date)'),
  ('advent_oeffnen(text,integer)'), ('feier_quittieren(text,integer,integer)'), ('bestenliste(text,text)'),
  ('spitzname_setzen(text,text,boolean)'), ('feedback_abgeben(text,integer,text,text,integer)'),
  ('bewertung_status_setzen(text,text)'), ('ziel_setzen(text,text,boolean)'), ('ziel_erreicht(text)'),
  ('wallet_gespeichert(text)'), ('wallet_kartendaten(text)'),
  ('admin_kennzahlen(text,date,date)'), ('admin_praemienauszug(text,date,date)'), ('admin_stammdaten(text)'),
  ('admin_praemie_speichern(text,uuid,text,text,integer,text,numeric,boolean,text)'),
  ('admin_advent_speichern(text,integer,text,text,integer,uuid,boolean,text)'),
  ('admin_nachrichten(text,boolean)'), ('admin_job_starten(text)'),
  ('admin_mail_einstellungen(text)'), ('admin_mail_speichern(text,text,text)'), ('admin_mail_test(text,text)'),
  ('admin_mail_jetzt(text)'), ('admin_mail_pruefen(text)'),
  ('admin_kunden(text,text,text,text,integer)'), ('admin_kundin(text,text)'), ('admin_verhalten(text,integer)'),
  ('admin_zielgruppe(text)'), ('admin_kunden_export(text)'),
  ('admin_level(text)'), ('admin_level_speichern(text,uuid,text,integer,text,numeric,boolean)'),
  ('admin_level_simulieren(text,integer,integer,integer,integer)'), ('admin_level_uebernehmen(text,integer,integer,integer,integer)'),
  ('admin_spitznamen(text)'), ('admin_spitzname_loeschen(text,text)'), ('admin_uebernahme(text)'),
  ('admin_uebernahme_einstellen(text,boolean,integer,text)'), ('admin_wallet(text)'), ('admin_funktionen(text)'),
  ('admin_funktion_schalten(text,text,boolean)'), ('admin_feedback(text,integer)'),
  ('admin_feedback_gelesen(text,text,timestamp with time zone)'), ('admin_rueckkehr(text)'),
  ('admin_kampagnen(text)'), ('admin_kampagne_vorschau(text,text)'),
  ('admin_kampagne_senden(text,text,text,text,boolean,boolean,integer,text,text)'), ('admin_kampagne_beenden(text,uuid)'),
  ('admin_aktionen(text)'), ('admin_aktion_anlegen(text,text,numeric,date,date)'), ('admin_aktion_beenden(text,uuid)'),
  ('admin_bericht(text,text)'), ('admin_berichte(text)'), ('admin_sitzungen_widerrufen(text,uuid)'),
  ('admin_altlinks(text)');

-- Vergibt Rechte NUR an die erwarteten exakten Signaturen; meldet Abweichungen.
create or replace function rechte_setzen()
returns jsonb language plpgsql security definer as $$
declare sig text; fehlend text[] := '{}'; offen int; zuviel text[];
begin
  execute 'revoke execute on all functions in schema public from public, anon, authenticated';
  execute 'revoke all on all tables in schema public from anon, authenticated';
  execute 'revoke all on all sequences in schema public from anon, authenticated';
  execute 'alter default privileges in schema public revoke execute on functions from public, anon, authenticated';
  execute 'alter default privileges in schema public revoke all on tables from anon, authenticated';

  execute 'grant execute on all functions in schema public to service_role';
  execute 'grant all on all tables in schema public to service_role';
  execute 'grant all on all sequences in schema public to service_role';
  execute 'alter default privileges in schema public grant execute on functions to service_role';
  execute 'alter default privileges in schema public grant all on tables to service_role';

  for sig in select signatur from rechte_erwartet loop
    begin
      execute format('grant execute on function public.%s to anon', sig);
    exception when undefined_function then
      fehlend := fehlend || sig;
    end;
  end loop;

  for sig in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
            where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity loop
    execute format('alter table public.%I enable row level security', sig);
  end loop;

  -- Abgleich: alles, was anon kann, muss in der Liste stehen – und umgekehrt
  select array_agg(p.oid::regprocedure::text) into zuviel
    from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute')
     and replace(p.oid::regprocedure::text, ' ', '') not in (select replace(signatur, ' ', '') from rechte_erwartet)
     and replace(p.oid::regprocedure::text, 'timestamp with time zone', 'timestamptz') not in (select signatur from rechte_erwartet);
  select count(*) into offen from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
   where ns.nspname = 'public' and has_function_privilege('anon', p.oid, 'execute');
  if array_length(fehlend, 1) > 0 then
    raise exception 'rechte_setzen: erwartete Signaturen fehlen: %', array_to_string(fehlend, ', ');
  end if;
  return jsonb_build_object('fuer_anon_aufrufbar', offen, 'erwartet', (select count(*) from rechte_erwartet),
                            'nicht_erwartet_aber_offen', coalesce(zuviel, '{}'));
end $$;

-- ---------------------------------------------------------------------
--  Zeitpläne
-- ---------------------------------------------------------------------
do $plan$
begin
  perform cron.unschedule('laperle_mail') from cron.job where jobname = 'laperle_mail';
  -- Senden und Prüfen in getrennten Aufrufen; die Prüfung wertet die Antworten des
  -- vorigen Laufs aus (pg_net startet Anfragen erst nach Commit – kein pg_sleep)
  perform cron.schedule('laperle_mail', '*/10 * * * *', 'select job_mail_senden(); select job_mail_pruefen();');
exception when others then
  raise notice 'pg_cron nicht verfügbar – job_mail_senden()/job_mail_pruefen() bitte anders einplanen (%).', sqlerrm;
end $plan$;

select rechte_setzen() as ergebnis;
notify pgrst, 'reload schema';


-- SOURCE supabase/migrations/20260917221455_betriebsstabilisierung.sql
-- Betriebsstabilisierung nach Lieferung 2. NACH 001–031, atomar ausführen.
-- Keine Kundentokenrotation und keine externen Aufrufe beim Einspielen.
set local search_path = public, extensions, pg_temp;
alter table wallet_pass add column if not exists lease_id uuid;
alter table wallet_pass add column if not exists abgeglichen_am timestamptz;
alter table wallet_pass add column if not exists nicht_gefunden_anzahl integer not null default 0;


create or replace function wallet_offene_karten(p_grenze int default 50)
returns jsonb language plpgsql security definer as $$
declare lease interval := interval '3 minutes'; ids uuid[] := '{}'; r record;
begin
  -- Auswahl + Lease in einem Schritt: zwei parallele Läufe bekommen nie dieselbe Karte
  for r in
    with kandidaten as (
      select w.id from wallet_pass w
        join kundin k on k.id = w.kundin_id
       where w.plattform = 'google' and w.zurueckgezogen_am is null
         and w.zuletzt_abgerufen is not null                     -- „gespeichert“
         and k.status = 'aktiv'
         and (w.stand_version > w.quittiert_version or coalesce(w.abgeglichen_am, '-infinity') < now() - interval '1 hour')
         and coalesce(w.naechster_versuch, '-infinity') <= now()  -- Fehlerpause vorbei
         and coalesce(w.gesperrt_bis, '-infinity') < now()        -- kein anderer Lauf dran
       order by w.naechster_versuch nulls first, w.aktualisiert_am  -- faire Auswahl: nie fehlgeschlagene zuerst
       limit greatest(1, least(p_grenze, 200))
       for update of w skip locked)
    update wallet_pass w set gesperrt_bis = now() + lease, lease_id = gen_random_uuid()
      from kandidaten c where w.id = c.id
    returning w.id
  loop
    ids := ids || r.id;
  end loop;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
      'object_id', w.serien_nummer, 'lease_id', w.lease_id, 'lease_bis', w.gesperrt_bis,
      'club_url', coalesce(_e('club_basis_url'), '') || '?t=' || k.zugangstoken,
      'kundin_id',  w.kundin_id,
      'version',    w.stand_version,
      'kundennummer', k.kundennummer,
      'stand',      coalesce(pk.stand, 0),
      'rang',       coalesce((_level_stand(w.kundin_id))->>'name', 'Bronze'),
      'naechste',   coalesce((
         select p.bezeichnung || ' – noch ' || (p.punkte - coalesce(pk.stand, 0)) || ' Perlen'
           from praemie p
          where p.organisation_id = k.organisation_id and p.aktiv and p.punkte > coalesce(pk.stand, 0)
          order by p.punkte limit 1), 'Alle Prämien erreichbar')) order by w.aktualisiert_am), '[]'::jsonb)
      from wallet_pass w
      join kundin k on k.id = w.kundin_id
      left join punktekonto pk on pk.kundin_id = w.kundin_id
     where w.id = any(coalesce(ids, '{}')));
end $$;


create or replace function wallet_quittieren(p_quittungen jsonb)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare q jsonb; w wallet_pass; n int:=0; f int:=0; st int; v bigint;
begin
 for q in select * from jsonb_array_elements(p_quittungen) loop
  select * into w from wallet_pass where serien_nummer=q->>'object_id' for update;
  if w.id is null then continue; end if;
  v:=(q->>'version')::bigint;
  if w.lease_id is null or w.gesperrt_bis is null or q->>'lease_id' is distinct from w.lease_id::text or w.gesperrt_bis < clock_timestamp() then
   -- Eine verspätete externe Antwort kann den Anbieterstand verändert haben.
   -- Erneute Abgleichpflicht erhalten; niemals die Lease eines anderen Workers freigeben.
   update wallet_pass set stand_version=stand_version+1, aktualisierung_noetig=true,
     abgeglichen_am=null where id=w.id;
   f:=f+1; continue;
  end if;
  if coalesce((q->>'ok')::boolean,false) and v between 0 and w.stand_version then
   update wallet_pass set quittiert_version=greatest(quittiert_version,v),
    gesperrt_bis=null,lease_id=null,naechster_versuch=null,fehler_anzahl=0,nicht_gefunden_anzahl=0,
    letzter_fehler=null,abgeglichen_am=now(),
    aktualisierung_noetig=(stand_version>greatest(quittiert_version,v)) where id=w.id;
   n:=n+1;
  else
   st:=coalesce((q->>'status')::int,0);
   update wallet_pass set fehler_anzahl=fehler_anzahl+1,
    nicht_gefunden_anzahl=case when st=404 then nicht_gefunden_anzahl+1 else 0 end,
    letzter_fehler=left(coalesce(q->>'fehler','HTTP '||st),300),
    naechster_versuch=now()+case when st=429 then interval '60 seconds'
      else least(interval '1 day',make_interval(mins=>power(2,least(w.fehler_anzahl,10))::int)) end,
    gesperrt_bis=null,lease_id=null,
    zurueckgezogen_am=case when st=410 or (st=404 and w.nicht_gefunden_anzahl+1>=3) then now() else zurueckgezogen_am end
    where id=w.id;
   f:=f+1;
  end if;
 end loop;
 return jsonb_build_object('quittiert',n,'fehler',f);
end $$;


create or replace function wallet_kartendaten(p_token text)
returns jsonb language plpgsql security definer as $$
declare k kundin; o organisation; stand int; lvl jsonb; naechste praemie; wp wallet_pass;
begin
  k := _kundin_per_token(p_token);
  select * into o from organisation where id = k.organisation_id;
  select pk.stand into stand from punktekonto pk where pk.kundin_id = k.id;
  lvl := _level_stand(k.id);

  select * into naechste from praemie
   where organisation_id = o.id and aktiv and punkte > stand order by punkte limit 1;

  -- Objekt-Kennung je Kundin, stabil über die Zeit
  perform pg_advisory_xact_lock(hashtext('wallet-link:' || k.id::text));
  select * into wp from wallet_pass where kundin_id=k.id and plattform='google' for update;
  if wp.id is not null and wp.zurueckgezogen_am is not null then
    update wallet_pass set zurueckgezogen_am=null,fehler_anzahl=0,nicht_gefunden_anzahl=0,
      naechster_versuch=null,stand_version=stand_version+1,aktualisierung_noetig=true,
      abgeglichen_am=null where id=wp.id returning * into wp;
  end if;
  if wp.id is null then
    insert into wallet_pass (kundin_id, plattform, serien_nummer, auth_token)
    values (k.id, 'google',
            _e('google_issuer_id') || '.kundin_' || replace(k.id::text, '-', ''),
            encode(gen_random_bytes(16), 'hex'))
    returning * into wp;
  end if;

  return jsonb_build_object(
    'aktiv',        coalesce(_e('wallet_aktiv'), 'false') = 'true',
    'issuer_id',    _e('google_issuer_id'),
    'class_id',     _e('google_class_id'),
    'object_id',    wp.serien_nummer,
    'vorname',      k.vorname,
    'nachname',     k.nachname,
    'kundennummer', k.kundennummer,
    'stand',        stand,
    'rang',         lvl->>'name',
    'naechste',     case when naechste.id is null then 'alle erreicht'
                    else (naechste.punkte - stand) || ' bis ' || naechste.bezeichnung end,
    'club_url',     coalesce(_e('club_basis_url'), 'https://laperle-beauty.de') || '?t=' || k.zugangstoken
  );
end $$;

create or replace function job_mail_pruefen()
returns jsonb language plpgsql security definer as $$
declare ok int := 0; temp int := 0; endg int := 0; unkl int := 0; n record; stc int; cont text;
        maxv int := coalesce(_e('mail_wiederholungen')::int, 3);
        frist interval := (coalesce(_e('mail_unklar_nach_minuten'), '30') || ' minutes')::interval;
begin
  for n in select * from nachricht where status in ('gesendet_offen','unklar') and request_id is not null for update skip locked loop
    stc := null; cont := null;
    if n.request_id is not null then
      select status_code, content into stc, cont from net._http_response where id = n.request_id;
    end if;
    if stc is null then
      -- keine Antwort (noch nicht da, verloren oder von pg_net bereits aufgeräumt)
      if coalesce(n.angestossen_am, n.status_seit) < now() - frist then
        update nachricht set status = 'unklar', status_seit = now(),
               fehler = 'Keine Antwort des Anbieters – Zustellung ungeklärt, keine automatische Wiederholung' where id = n.id;
        unkl := unkl + 1;
      end if;
      continue;
    end if;
    if stc between 200 and 299 then
      update nachricht set gesendet_am = now(), fehler = null, status = 'gesendet', status_seit = now() where id = n.id;
      update mail_kontingent set bestaetigt = bestaetigt + 1 where tag = (n.angestossen_am at time zone coalesce(_e('mail_zeitzone'),'Europe/Berlin'))::date;
      ok := ok + 1;
    elsif stc >= 500 or stc = 408 then
      update nachricht set status='unklar',status_seit=now(),
        fehler='HTTP '||stc||': Annahme nicht sicher ausgeschlossen; Anbieterprotokoll prüfen.' where id=n.id;
      unkl:=unkl+1;
    elsif stc = 429 and n.versuche < maxv then
      update nachricht set status = 'fehler_temporaer', status_seit = now(), request_id = null,
             fehler = 'HTTP ' || stc || ': ' || left(coalesce(cont,''), 300),
             faellig_am = now() + (power(2, n.versuche) * 10 || ' minutes')::interval
       where id = n.id;
      temp := temp + 1;
    else
      update nachricht set status = 'fehler_endgueltig', status_seit = now(), request_id = null,
             fehler = 'HTTP ' || stc || ': ' || left(coalesce(cont,''), 300)
       where id = n.id;
      endg := endg + 1;
    end if;
  end loop;
  return jsonb_build_object('gesendet', ok, 'vorruebergehend', temp, 'endgueltig', endg, 'unklar', unkl,
                            'fehlgeschlagen', temp + endg);
end $$;


create table if not exists mail_klaerung (
 id bigint generated always as identity primary key, nachricht_id uuid not null references nachricht(id),
 mitarbeiterin_id uuid not null references mitarbeiterin(id), aktion text not null,
 notiz text not null, erstellt_am timestamptz not null default now());
alter table mail_klaerung enable row level security;
create or replace function admin_mail_klaeren(p_token text,p_id uuid,p_aktion text,p_notiz text)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung; n nachricht;
begin
 s:=_admin(p_token);
 if length(trim(coalesce(p_notiz,'')))<10 then raise exception 'Bitte Ergebnis der Anbieterprüfung notieren (mindestens 10 Zeichen).'; end if;
 select * into n from nachricht where id=p_id and organisation_id=s.organisation_id for update;
 if n.id is null or n.status not in ('unklar','fehler_endgueltig') then raise exception 'Nachricht ist nicht zur Klärung offen.'; end if;
 if p_aktion not in ('gesendet','nicht_gesendet','storniert') then raise exception 'Ungültige Entscheidung.'; end if;
 if p_aktion='nicht_gesendet' and n.versuche>=coalesce(_e('mail_wiederholungen')::int,3) then
   raise exception 'Versuchslimit erreicht. Zuerst Versandkonfiguration und Wiederherstellungsweg prüfen.';
 end if;
 insert into mail_klaerung(nachricht_id,mitarbeiterin_id,aktion,notiz) values(n.id,s.mitarbeiterin_id,p_aktion,trim(p_notiz));
 update nachricht set status=case when p_aktion='nicht_gesendet' then 'offen' else p_aktion end,
  gesendet_am=case when p_aktion='gesendet' then coalesce(gesendet_am,now()) else gesendet_am end,
  request_id=null,faellig_am=now(),status_seit=now(),beansprucht_am=null,fehler=null where id=n.id;
 return jsonb_build_object('ok',true);
end $$;
insert into rollenmatrix values ('admin_mail_klaeren','{zentrale}','Anbieterprotokoll manuell abgleichen') on conflict(funktion) do nothing;
insert into rechte_erwartet values ('admin_mail_klaeren(text,uuid,text,text)') on conflict do nothing;


create or replace function job_altlinks_ersetzen(p_trocken boolean default true, p_umfang text default 'gefaehrdet')
returns jsonb language plpgsql security definer as $$
declare o organisation; g record; n int := 0; k kundin; frei boolean;
begin
  frei := coalesce(_e('altlink_rotation_freigegeben'), 'false') = 'true';
  if p_umfang not in ('gefaehrdet', 'ohne_besuch') then raise exception 'Unbekannter Umfang.'; end if;
  if not p_trocken and not frei then
    raise exception 'E1 nicht freigegeben (Einstellung altlink_rotation_freigegeben).';
  end if;
  if not p_trocken and (coalesce(_e('mail_aktiv'),'false')<>'true' or coalesce(_e('mail_api_key'),'')='') then
    raise exception 'Rotation gesperrt: zuerst Mailversand einrichten und prüfen.';
  end if;
  perform pg_advisory_xact_lock(hashtext('altlink_rotation'));
  for o in select * from organisation loop
    for g in select * from _altlink_gruppe(o.id)
              where herkunft in ('selbstregistrierung', 'unsicher')
                and (p_umfang = 'gefaehrdet' or not besuch)
              order by kundin_id loop
      if not p_trocken and n>=least(20,greatest(1,coalesce(_e('altlink_tranche')::int,10))) then exit; end if;
      if not p_trocken and (select count(*) from nachricht where kanal='email' and status in ('offen','in_arbeit','gesendet_offen','unklar','fehler_temporaer'))
          >= greatest(0,coalesce(_e('mail_tagesbudget')::int,250)-coalesce((select reserviert from mail_kontingent where tag=_mail_tag()),0)) then exit; end if;
      n := n + 1;
      if p_trocken then continue; end if;
      update kundin set zugangstoken = encode(gen_random_bytes(16), 'hex'), token_erneuert_am = now(),
             email_bestaetigt_am = null
       where id = g.kundin_id returning * into k;
      update wallet_pass set stand_version=stand_version+1,aktualisierung_noetig=true,abgeglichen_am=null
       where kundin_id=k.id and zurueckgezogen_am is null;
      -- Zugangsmail: vertraglich (kein Werbeanlass), landet im Postausgang und unterliegt dem Kontingent
      insert into nachricht (organisation_id, kundin_id, kanal, anlass, betreff, text, schluessel)
      values (o.id, k.id, 'email', 'willkommen', 'Dein neuer Zugang zum La Perlé Club',
              'Wir haben deinen persönlichen Zugangslink erneuert. Deine Perlen sind unverändert. Öffne den Link in dieser Mail, um deinen Clubbereich zu sehen.',
              'altlink_' || k.token_erneuert_am::text)
      on conflict (kundin_id, schluessel) do nothing;
    end loop;
  end loop;
  return jsonb_build_object('betroffen', n, 'umfang', p_umfang, 'ausgefuehrt', not p_trocken, 'freigegeben', frei);
end $$;


create or replace function admin_nachrichten(p_token text, p_nur_offen boolean default true)
returns jsonb language plpgsql security definer as $$
declare s terminal_sitzung;
begin
  s := _admin(p_token);
  return jsonb_build_object(
    'offen', (select count(*) from nachricht
               where organisation_id = s.organisation_id and status in ('offen','in_arbeit','fehler_temporaer')),
    'unklar', (select count(*) from nachricht where organisation_id = s.organisation_id and status = 'unklar'),
    'kontingent', (select jsonb_build_object('tag', tag, 'reserviert', reserviert, 'bestaetigt', bestaetigt,
                                             'budget', coalesce(_e('mail_tagesbudget')::int, 250))
                     from mail_kontingent where tag = _mail_tag()),
    'zeilen', (select coalesce(jsonb_agg(jsonb_build_object(
                 'id', n.id, 'erstellt_am', n.erstellt_am, 'kanal', n.kanal, 'anlass', n.anlass,
                 'kundin', k.vorname || ' ' || left(k.nachname,1) || '.',
                 'kundennummer', k.kundennummer, 'betreff', n.betreff, 'text', n.text,
                 'gesendet_am', n.gesendet_am, 'status', n.status, 'versuche', n.versuche, 'fehler', n.fehler,
                 'faellig_am', n.faellig_am) order by n.erstellt_am desc), '[]'::jsonb)
               from (select * from nachricht
                      where organisation_id = s.organisation_id
                        and (not p_nur_offen or status not in ('gesendet','storniert'))
                      order by erstellt_am desc limit 100) n
               join kundin k on k.id = n.kundin_id),
    'laeufe', (select coalesce(jsonb_agg(jsonb_build_object(
                 'gelaufen_am', l.gelaufen_am, 'ergebnis', l.ergebnis)
                 order by l.gelaufen_am desc), '[]'::jsonb)
               from (select * from job_lauf order by gelaufen_am desc limit 14) l)
  );
end $$;


-- Kontrollierter Wiederherstellungsweg: nur an die bereits hinterlegte Adresse,
-- keine Tokenausgabe, kein Tokenwechsel, höchstens ein Auftrag pro Stunde.
create or replace function admin_zugangsmail(p_token text,p_kundennummer text)
returns jsonb language plpgsql security definer as $$
declare sess terminal_sitzung; k kundin; nid uuid;
begin
 sess:=_admin(p_token);
 select * into k from kundin where kundennummer=p_kundennummer and organisation_id=sess.organisation_id and status='aktiv' for update;
 if k.id is null or coalesce(k.email,'')='' then raise exception 'Kein aktives Konto mit E-Mail-Adresse gefunden.'; end if;
 if coalesce(_e('mail_aktiv'),'false')<>'true' or coalesce(_e('mail_api_key'),'')='' then raise exception 'Mailversand zuerst einrichten.'; end if;
 if exists(select 1 from nachricht where kundin_id=k.id and schluessel like 'zugang_hilfe_%' and erstellt_am>now()-interval '1 hour') then
  raise exception 'Für dieses Konto wurde bereits ein Zugang angefordert. Bitte Postausgang prüfen.';
 end if;
 insert into nachricht(organisation_id,kundin_id,kanal,anlass,betreff,text,schluessel)
 values(k.organisation_id,k.id,'email','willkommen','Dein Zugang zum La Perlé Club',
 'Hier findest du deinen persönlichen Zugang. Deine Perlen bleiben unverändert.', 'zugang_hilfe_'||gen_random_uuid()) returning id into nid;
 return jsonb_build_object('eingereiht',true,'nachricht_id',nid);
end $$;
insert into rollenmatrix values('admin_zugangsmail','{zentrale}','Zugang an hinterlegte Adresse erneut einreihen') on conflict do nothing;
insert into rechte_erwartet values('admin_zugangsmail(text,text)') on conflict do nothing;

create or replace function _admin(p_token text,p_funktion text)
returns terminal_sitzung language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare s terminal_sitzung; r text; erlaubt text[];
begin
 s:=_sitzung(p_token);
 select rolle into r from mitarbeiterin where id=s.mitarbeiterin_id;
 if r='personal' then raise exception 'Kein Zugriff auf die Auswertungen.'; end if;
 select rollen into erlaubt from rollenmatrix where funktion=p_funktion;
 if erlaubt is null then raise exception 'Für diese Funktion ist keine Berechtigung hinterlegt.'; end if;
 if not(r=any(erlaubt)) then raise exception 'Nur die Zentrale.'; end if;
 return s;
end $$;
do $$ declare f record; def text; begin
 for f in select p.oid,p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'admin\_%' escape '\' loop
  def:=pg_get_functiondef(f.oid);
  def:=replace(def,'_admin(p_token)',format('_admin(p_token, %L)',f.proname));
  execute def;
 end loop;
end $$;
do $$ declare f record; begin
 for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef loop
  execute format('alter function %s set search_path=public,extensions,pg_temp',f.sig);
 end loop;
end $$;
select rechte_setzen();
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260917225404_wallet_vertrag_erhalten.sql
-- Wallet-Wiederaufnahme mit vollständigem bestehenden Datenvertrag.
-- Logo, Funktionsschalter und Zielzeile aus Migration 020 bleiben erhalten.
set local search_path=public,extensions,pg_temp;
create or replace function wallet_kartendaten(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin; o organisation; stand int; lvl jsonb; naechste praemie; wp wallet_pass;
begin
  k := _kundin_per_token(p_token);
  select * into o from organisation where id = k.organisation_id;
  select pk.stand into stand from punktekonto pk where pk.kundin_id = k.id;
  lvl := _level_stand(k.id);

  select * into naechste from praemie
   where organisation_id = o.id and aktiv and punkte > stand order by punkte limit 1;

  perform pg_advisory_xact_lock(hashtext('wallet-link:' || k.id::text));
  select * into wp from wallet_pass where kundin_id=k.id and plattform='google' for update;
  if wp.id is not null and wp.zurueckgezogen_am is not null then
    update wallet_pass set zurueckgezogen_am=null,fehler_anzahl=0,nicht_gefunden_anzahl=0,
      naechster_versuch=null,stand_version=stand_version+1,aktualisierung_noetig=true,
      abgeglichen_am=null where id=wp.id returning * into wp;
  end if;

  if wp.id is null then
    insert into wallet_pass (kundin_id, plattform, serien_nummer, auth_token)
    values (k.id, 'google',
            _e('google_issuer_id') || '.kundin_' || replace(k.id::text, '-', ''),
            encode(gen_random_bytes(16), 'hex'))
    returning * into wp;
  end if;

  return jsonb_build_object(
    'aktiv',        coalesce(_e('wallet_aktiv'), 'false') = 'true' and _an('wallet'),
    'issuer_id',    _e('google_issuer_id'),
    'class_id',     _e('google_class_id'),
    'logo_url',     _e('logo_url'),
    'object_id',    wp.serien_nummer,
    'vorname',      k.vorname, 'nachname', k.nachname, 'kundennummer', k.kundennummer,
    'stand',        stand,
    'rang',         case when _an('level') then lvl->>'name' else null end,
    -- Wenn die Kundin ein Ziel hinterlegt hat, steht das auf der Karte
    'zeile',        coalesce(
                      case when _an('ziel') and k.ziel_erreicht_am is null then k.ziel end,
                      case when naechste.id is null then 'Alle Prämien erreicht'
                           else naechste.bezeichnung || ' in Reichweite' end),
    'naechste',     case when naechste.id is null then 'alle erreicht'
                    else (naechste.punkte - stand) || ' bis ' || naechste.bezeichnung end,
    'club_url',     coalesce(_e('club_basis_url'), 'https://laperle-beauty.de') || '?t=' || k.zugangstoken
  );
end $$;
select rechte_setzen();
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260917225812_helfer_suchpfade.sql
-- Fester Suchpfad auch für interne SECURITY-INVOKER-Helfer.
-- Erweiterungsfunktionen gehören dem Anbieter und werden nicht verändert.
do $$ declare f record; begin
 for f in
  select p.oid::regprocedure as sig from pg_proc p
  join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.prokind='f'
   and not exists (select 1 from pg_depend d where d.classid='pg_proc'::regclass and d.objid=p.oid and d.deptype='e')
   and not exists (select 1 from unnest(coalesce(p.proconfig,'{}'::text[])) c where c like 'search_path=%')
 loop execute format('alter function %s set search_path=public,extensions,pg_temp',f.sig); end loop;
end $$;
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260917230735_studio_berichtsdatum.sql
-- Studio Frankfurt: Berichtsgrenzen und DATE-Casts konsistent in Europe/Berlin.
-- Keine Änderung an gespeicherten Zeitstempeln oder Buchungen.
do $$ declare f record; begin
 for f in select p.oid::regprocedure sig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname like 'admin\_%' escape '\'
 loop execute format('alter function %s set timezone=%L',f.sig,'Europe/Berlin'); end loop;
end $$;
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260918010240_mail_vorlagen_freigegeben.sql
-- Freigegebene Kundenmails: Texte, Vorschau, anlassbezogene CTA und Textalternative.
-- Voraussetzung: Stand 04 (001–031 + vier nachfolgende Migrationen).
-- Keine Aktivierung des Versands, keine Änderung an Kundentoken/Versandfreigaben.
alter table public.nachricht add column if not exists mail_inhalt jsonb;
insert into public.einstellung(schluessel,wert,hinweis) values
 ('buchung_url','https://beautinda.de/salon/51EsvFBHxDRcmZqOg3rC','Ziel der Terminbuttons in E-Mails'),
 ('mail_recht_url',null,'Optional: absolute HTTPS-Adresse der Club-Rechtsseite; sonst recht.html neben der Clubseite')
on conflict(schluessel) do nothing;

create or replace function public._mail_ersetzen(p_text text,p_daten jsonb)
returns text language plpgsql immutable set search_path=public,extensions,pg_temp as $$
declare m text[]; r text:=''; key text;
begin
 -- Ein Durchlauf: Platzhalter in Kundennamen/Prämien werden niemals erneut ersetzt.
 for m in select regexp_matches(p_text,'(\[(Vorname|Anzahl|Prämie|Geburtstagsgeschenk|Datum)\]|[^\[]+|\[)','g') loop
  key:=m[2];
  if key is null then r:=r||m[1];
  elsif not (p_daten ? key) or p_daten->>key is null then raise exception 'Mailangabe fehlt: %',key;
  else r:=r||replace(replace(p_daten->>key,E'\r',' '),E'\n',' '); end if;
 end loop;
 return r;
end $$;

create or replace function public._mail_vorlage(p_name text,p_daten jsonb default '{}'::jsonb)
returns jsonb language plpgsql immutable set search_path=public,extensions,pg_temp as $$
declare alle jsonb := $templates${"einladung": {"betreff": "[Vorname], entdecke den La Perlé Club ✨", "vorschau": "Sammle Perlen bei deinen Besuchen und freue dich auf ausgewählte Prämien.", "vorher": "Hallo [Vorname],\n\ndu genießt deine Behandlung – und deine Treue wird belohnt. Im La Perlé Club sammelst du bei deinen Besuchen Perlen, die du gegen ausgewählte Prämien eintauschen kannst.\n\nIn deinem persönlichen Clubbereich hast du deinen Perlenstand, deinen Rang und deine Prämien jederzeit im Blick. So siehst du, welcher kleinen Auszeit du schon ein Stück näher bist.\n\n**Melde dich jetzt an und entdecke deine Clubvorteile.**", "nachher": "Wir freuen uns, dich im Club willkommen zu heißen. 🤍\n\nDein La Perlé Team", "button": "Jetzt Clubmitglied werden", "ziel": "registrierung", "werbung": true}, "willkommen": {"betreff": "[Vorname], willkommen im La Perlé Club ✨", "vorschau": "Dein persönlicher Clubbereich ist bereit. Entdecke deine Perlen, deine Karte und deine Prämien.", "vorher": "Hallo [Vorname],\n\nschön, dass du dabei bist. Im La Perlé Club wird aus deiner Treue etwas Besonderes: Du sammelst bei deinen Besuchen Perlen, entdeckst deinen persönlichen Rang und kannst deine Perlen gegen ausgewählte Prämien eintauschen.\n\nDein persönlicher Clubbereich ist jetzt für dich bereit. Dort findest du deinen Perlenstand, deine Kundenkarte und die Prämien, auf die du dich freuen kannst.\n\n**Entdecke jetzt, welche kleine Auszeit deine nächste Prämie werden könnte.**", "nachher": "Bewahre diese E-Mail auf: Über deinen persönlichen Link gelangst du jederzeit wieder in deinen Clubbereich. Bitte teile ihn nicht mit anderen.\n\nWir freuen uns darauf, dich bald wieder bei uns zu verwöhnen. 🤍\n\nDein La Perlé Team", "button": "Meinen Club entdecken", "ziel": "club", "werbung": false}, "praemie_nah": {"betreff": "Nur noch [Anzahl] Perlen bis zu deiner Prämie ✨", "vorschau": "[Prämie] ist in Reichweite – schau dir an, worauf du dich freuen kannst.", "vorher": "Hallo [Vorname],\n\ndu bist deiner nächsten Prämie schon ganz nah: Für **[Prämie]** fehlen dir noch **[Anzahl] Perlen**.\n\nBei deinen nächsten Besuchen sammelst du weiter. In deinem Clubbereich kannst du dir die Prämie genauer ansehen und deinen aktuellen Perlenstand prüfen.\n\n**Entdecke jetzt, worauf du dich freuen kannst.**", "nachher": "Wir freuen uns auf deine nächste Auszeit bei uns. 🤍\n\nDein La Perlé Team", "button": "Meine nächste Prämie ansehen", "ziel": "praemien", "werbung": true}, "geburtstag": {"betreff": "Alles Liebe zum Geburtstag, [Vorname] 🤍", "vorschau": "Ein kleines Geburtstagsgeschenk wartet in deinem Clubbereich auf dich.", "vorher": "Hallo [Vorname],\n\nheute darfst du dich feiern lassen. Wir wünschen dir einen wunderschönen Geburtstag und viele kleine Momente, die dir guttun. ✨\n\nAuch wir möchten dir eine Freude machen: In deinem Clubbereich haben wir **[Geburtstagsgeschenk]** für dich hinterlegt.\n\nDein Geschenk ist bis zum **[Datum]** einlösbar. Öffne deinen Clubbereich, schau dir die Details an und zeige dein Geschenk bei deinem Besuch am Empfang vor.", "nachher": "Lass es dir heute besonders gut gehen.\n\nDein La Perlé Team", "button": "Mein Geburtstagsgeschenk ansehen", "ziel": "geschenke", "werbung": true}, "rueckkehr1": {"betreff": "[Vorname], Zeit für deine nächste Beauty-Auszeit? ✨", "vorschau": "Finde einen Termin, der zu dir passt – wir freuen uns auf dich.", "vorher": "Hallo [Vorname],\n\nwie wäre es, dir wieder etwas Zeit für dich zu nehmen?\n\nOb du deine gewohnte Behandlung fortsetzen oder etwas Neues entdecken möchtest: Wir freuen uns darauf, dich bei La Perlé zu begrüßen.\n\n**Such dir jetzt deine Behandlung und einen passenden Termin aus.**", "nachher": "Du bist noch unsicher, welche Behandlung zu dir passt? Antworte einfach auf diese E-Mail – wir beraten dich gerne.\n\nBis bald bei uns. 🤍\n\nDein La Perlé Team", "button": "Meine Auszeit buchen", "ziel": "buchung", "werbung": true}, "rueckkehr2": {"betreff": "[Vorname], schön, dich wiederzusehen 🤍", "vorschau": "Deine nächste Auszeit bei La Perlé beginnt mit einem passenden Termin.", "vorher": "Hallo [Vorname],\n\ndein letzter Besuch liegt schon etwas zurück. Vielleicht ist jetzt ein schöner Moment, wieder etwas Zeit für dich einzuplanen.\n\nWir freuen uns darauf, dich wieder bei uns zu begrüßen und gemeinsam zu schauen, was du dir für deine nächste Behandlung wünschst.\n\n**Entdecke unsere Behandlungen und finde deinen Wunschtermin.**", "nachher": "Du möchtest vorher etwas fragen oder uns Rückmeldung zu deinem letzten Besuch geben? Antworte uns einfach auf diese E-Mail. Wir nehmen uns gerne Zeit für dich.\n\nDein La Perlé Team", "button": "Meinen nächsten Besuch planen", "ziel": "buchung", "werbung": true}, "bewertung": {"betreff": "[Vorname], wie hat dir dein Besuch gefallen? 🤍", "vorschau": "Teile deine ehrliche Erfahrung und hilf anderen, La Perlé kennenzulernen.", "vorher": "Hallo [Vorname],\n\ndanke, dass du bei uns warst. Wie hast du deine Behandlung und die Zeit bei La Perlé erlebt?\n\nMit deiner ehrlichen Bewertung bei Google hilfst du anderen, sich ein Bild von unserem Studio zu machen. Gleichzeitig zeigst du uns, was dir gefallen hat und wo wir noch besser werden können.\n\n**Teile jetzt deine Erfahrung – wir freuen uns über deine Rückmeldung.**", "nachher": "Wenn du uns etwas persönlich mitteilen möchtest, kannst du auch direkt auf diese E-Mail antworten.\n\nDanke für deine Zeit.\n\nDein La Perlé Team", "button": "Meine Erfahrung bei Google teilen", "ziel": "bewertung", "werbung": true}, "verfall_warnung": {"betreff": "Deine [Anzahl] Perlen sind bis zum [Datum] gültig", "vorschau": "Hier findest du deinen aktuellen Perlenstand und die Informationen zur Gültigkeit.", "vorher": "Hallo [Vorname],\n\nauf deinem Clubkonto befinden sich **[Anzahl] Perlen**. Nach den geltenden Clubregeln sind sie noch bis zum **[Datum]** gültig und verfallen anschließend, wenn bis dahin kein weiterer Besuch erfolgt.\n\nEin weiterer Besuch bei uns vor Ablauf setzt die Gültigkeitsfrist zurück. Deinen Perlenstand und die verfügbaren Prämien findest du in deinem persönlichen Clubbereich.", "nachher": "Du hast Fragen zu deinen Perlen oder zur Gültigkeit? Antworte einfach auf diese E-Mail – wir helfen dir gerne weiter.\n\nDein La Perlé Team", "button": "Meinen Perlenstand prüfen", "ziel": "club", "werbung": false}, "zugang": {"betreff": "[Vorname], hier ist dein Zugang zum La Perlé Club", "vorschau": "Öffne deinen persönlichen Clubbereich und sieh deinen aktuellen Perlenstand.", "vorher": "Hallo [Vorname],\n\nhier ist dein persönlicher Zugang zum La Perlé Club. Über den Button gelangst du direkt zu deinem Perlenstand, deiner Kundenkarte und deinen Prämien.", "nachher": "Bewahre diese E-Mail auf und teile deinen persönlichen Zugangslink nicht mit anderen.\n\nFalls du keinen Zugang angefordert hast, musst du nichts unternehmen. Bei Fragen kannst du direkt auf diese E-Mail antworten.\n\nDein La Perlé Team", "button": "Meinen Club öffnen", "ziel": "club", "werbung": false}, "zugang_hilfe": {"betreff": "Dein persönlicher Zugang zum La Perlé Club", "vorschau": "Hier findest du deinen Clubbereich wieder. Deine Perlen bleiben erhalten.", "vorher": "Hallo [Vorname],\n\nwir senden dir deinen persönlichen Clubzugang noch einmal zu. Dein bestehendes Konto und deine gesammelten Perlen bleiben unverändert.\n\n**Öffne deinen Clubbereich einfach über diesen Button.**", "nachher": "Bewahre diese E-Mail auf und teile deinen persönlichen Zugangslink nicht mit anderen. Wenn du weitere Hilfe brauchst, antworte uns einfach auf diese E-Mail.\n\nDein La Perlé Team", "button": "Meinen Club öffnen", "ziel": "club", "werbung": false}, "altlink": {"betreff": "Dein neuer Zugangslink zum La Perlé Club", "vorschau": "Bitte nutze künftig diesen Link. Dein Clubkonto und deine Perlen bleiben unverändert.", "vorher": "Hallo [Vorname],\n\nwir haben deinen persönlichen Zugangslink zum La Perlé Club erneuert. Dein bisheriger Link ist nicht mehr gültig. Dein Clubkonto und deine gesammelten Perlen bleiben unverändert.\n\n**Nutze ab jetzt den Button in dieser E-Mail, um deinen Clubbereich zu öffnen.**", "nachher": "Bewahre diese E-Mail auf und ersetze gegebenenfalls dein bisheriges Lesezeichen. Bitte teile deinen persönlichen Zugangslink nicht mit anderen.\n\nBei Fragen antworte einfach auf diese E-Mail – wir helfen dir gerne weiter.\n\nDein La Perlé Team", "button": "Meinen Club mit neuem Link öffnen", "ziel": "club", "werbung": false}}$templates$::jsonb; t jsonb; f text; d jsonb;
begin
 t:=alle->p_name;
 if t is null then raise exception 'Unbekannte Mailvorlage'; end if;
 d:=coalesce(p_daten,'{}'::jsonb);
 if nullif(trim(d->>'Vorname'),'') is null then
   d:=d||jsonb_build_object('Vorname','');
   t:=jsonb_set(t,'{betreff}',to_jsonb(replace(replace(t->>'betreff','[Vorname], ',''),', [Vorname]','')));
   t:=jsonb_set(t,'{vorher}',to_jsonb(replace(t->>'vorher','Hallo [Vorname],','Hallo,')));
 end if;
 foreach f in array array['betreff','vorschau','vorher','nachher','button'] loop
  t:=jsonb_set(t,array[f],to_jsonb(_mail_ersetzen(t->>f,d)));
 end loop;
 return t||jsonb_build_object('vorlage',p_name,'version',1);
end $$;

create or replace function public._mail_einreihen(p_kundin uuid,p_vorlage text,p_anlass text,p_schluessel text,p_daten jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin; t jsonb; v_art text;
begin
 select * into k from kundin where id=p_kundin and status='aktiv';
 if k.id is null then return; end if;
 v_art:=case when p_anlass='geburtstag' then 'geburtstag' when p_anlass in ('willkommen','verfall_warnung') then null else 'email_werbung' end;
 if v_art is not null and not exists(select 1 from einwilligung where kundin_id=k.id and einwilligung.art=v_art and widerrufen_am is null) then return; end if;
 t:=_mail_vorlage(p_vorlage,coalesce(p_daten,'{}'::jsonb)||jsonb_build_object('Vorname',k.vorname));
 insert into nachricht(organisation_id,kundin_id,kanal,anlass,betreff,text,schluessel,mail_inhalt)
 values(k.organisation_id,k.id,'email',p_anlass,t->>'betreff',replace((t->>'vorher')||E'\n\n'||(t->>'nachher'),'**',''),p_schluessel,t)
 on conflict(kundin_id,schluessel) do nothing;
end $$;

-- Kompatibilität für Zugangsmails aus Registrierung, Wiederherstellung und Rotation.
-- Bestehende RPCs und deren Rate-Limits/Tokenregeln bleiben unverändert.
create or replace function public._mail_zugang_normalisieren()
returns trigger language plpgsql set search_path=public,extensions,pg_temp as $$
declare v text; t jsonb; name text;
begin
 if new.kanal<>'email' or new.mail_inhalt is not null then return new; end if;
 v:=case when new.schluessel='willkommen' then 'willkommen'
         when new.schluessel like 'zugang_hilfe_%' then 'zugang_hilfe'
         when new.schluessel like 'zugang_%' then 'zugang'
         when new.schluessel like 'altlink_%' then 'altlink' end;
 if v is null or new.anlass<>'willkommen' then return new; end if;
 select vorname into name from kundin where id=new.kundin_id;
 t:=_mail_vorlage(v,jsonb_build_object('Vorname',name));
 new.mail_inhalt:=t; new.betreff:=t->>'betreff';
 new.text:=replace((t->>'vorher')||E'\n\n'||(t->>'nachher'),'**','');
 return new;
end $$;
drop trigger if exists mail_zugang_normalisieren on public.nachricht;
create trigger mail_zugang_normalisieren before insert or update of mail_inhalt on public.nachricht
for each row execute function public._mail_zugang_normalisieren();

create or replace function public._willkommen(p_kundin_id uuid)
returns void language plpgsql security definer set search_path=public,extensions,pg_temp as $$
begin perform _mail_einreihen(p_kundin_id,'willkommen','willkommen','willkommen'); end $$;

create or replace function public.job_praemie_nah()
returns int language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare k record; n int:=0; q text:=to_char(current_date,'YYYY')||'Q'||to_char(current_date,'Q');
begin
 for k in
  select distinct on (ku.id) ku.id,p.bezeichnung,p.punkte-pk.stand as fehlen
  from kundin ku join punktekonto pk on pk.kundin_id=ku.id
  join praemie p on p.organisation_id=ku.organisation_id and p.aktiv
  where ku.status='aktiv' and p.punkte>pk.stand and p.punkte-pk.stand<=50
    and not exists(select 1 from nachricht where kundin_id=ku.id and schluessel='praemie_nah_'||q)
  order by ku.id,p.punkte,p.id
 loop
  perform _mail_einreihen(k.id,'praemie_nah','praemie_nah','praemie_nah_'||q,jsonb_build_object('Anzahl',k.fehlen,'Prämie',k.bezeichnung)); n:=n+1;
 end loop;
 return n;
end $$;

create or replace function public.job_geburtstag()
returns int language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare a aktion; k kundin; e einloesung; n int:=0; jahr text:=to_char(current_date,'YYYY');
begin
 -- ausloeser bezeichnet den Geburtstag; art bezeichnet den tatsächlichen Vorteil.
 for a in select * from aktion where ausloeser='geburtstag' and aktiv order by id loop
  for k in select ku.* from kundin ku where organisation_id=a.organisation_id and status='aktiv'
    and extract(month from geburtsdatum)=extract(month from current_date)
    and extract(day from geburtsdatum)=extract(day from current_date) for update
  loop
   if exists(select 1 from einloesung where kundin_id=k.id and aktion_id=a.id and to_char(angefordert_am,'YYYY')=jahr) then continue; end if;
   insert into einloesung(organisation_id,kundin_id,quelle,aktion_id,bezeichnung,art,nennwert,gueltig_bis)
   values(a.organisation_id,k.id,'aktion',a.id,coalesce(a.titel->>'de',a.bezeichnung),a.art,
     case a.art when 'betrag' then a.wert||' €' when 'prozent' then a.wert||' %' else coalesce(a.titel->>'de',a.bezeichnung) end,
     now()+make_interval(days=>a.gueltig_tage)) returning * into e;
   perform _mail_einreihen(k.id,'geburtstag','geburtstag','geburtstag_'||jahr,
      jsonb_build_object('Geburtstagsgeschenk',case a.art when 'betrag' then e.nennwert||' Geburtstagsgutschein' when 'prozent' then e.nennwert||' Geburtstagsvorteil' else e.bezeichnung end,'Datum',to_char(e.gueltig_bis,'DD.MM.YYYY'))); n:=n+1;
  end loop;
 end loop;
 return n;
end $$;

create or replace function public.job_verfall_warnen()
returns int language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare o organisation; k kundin; n int:=0; stand int; verfaellt date;
begin
 for o in select * from organisation where verfall_monate is not null loop
  for k in select * from kundin where organisation_id=o.id and status='aktiv'
   and coalesce(letzter_besuch,registriert_am)<now()-make_interval(months=>o.verfall_monate-1)
   and coalesce(letzter_besuch,registriert_am)>now()-make_interval(months=>o.verfall_monate)
  loop
   select pk.stand into stand from punktekonto pk where pk.kundin_id=k.id;
   if coalesce(stand,0)<=0 then continue; end if;
   verfaellt:=(coalesce(k.letzter_besuch,k.registriert_am)+make_interval(months=>o.verfall_monate))::date;
   perform _mail_einreihen(k.id,'verfall_warnung','verfall_warnung','verfall_'||to_char(verfaellt,'YYYYMM'),jsonb_build_object('Anzahl',stand,'Datum',to_char(verfaellt,'DD.MM.YYYY'))); n:=n+1;
  end loop;
 end loop;
 return n;
end $$;

create or replace function job_rueckkehr()
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare r record; stups int := 0; vermisst int := 0; basis text;
begin
  if not _an('rueckkehr') then return jsonb_build_object('stups', 0, 'vermisst', 0); end if;
  basis := coalesce(_e('club_basis_url'), 'https://laperle-beauty.de');

  for r in
    select * from rueckkehr_kandidaten
     where faellige_stufe in (1,2) and faellige_stufe > rueckkehr_stufe
  loop
    if r.faellige_stufe = 1 then
      perform _mail_einreihen(r.kundin_id,'rueckkehr1','vermisst','rueckkehr1_' || to_char(now(),'YYYYMMDD'));
      stups := stups + 1;
    else
      perform _mail_einreihen(r.kundin_id,'rueckkehr2','vermisst','rueckkehr2_' || to_char(now(),'YYYYMMDD'));
      vermisst := vermisst + 1;
    end if;

    update kundin set rueckkehr_stufe = r.faellige_stufe, rueckkehr_zuletzt = now()
     where id = r.kundin_id;
  end loop;

  return jsonb_build_object('stups', stups, 'vermisst', vermisst);
end $$;

create or replace function job_bewertung_einladen()
returns int language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare o organisation; k kundin; n int := 0; abstand int; url text;
begin
  if not _an('bewertung') then return 0; end if;
  url := _e('google_bewertung_url');
  if coalesce(url,'') = '' then return 0; end if;
  abstand := coalesce(_e('bewertung_abstand_tage')::int, 120);

  for o in select * from organisation loop
    for k in
      select ku.* from kundin ku
       where ku.organisation_id = o.id and ku.status = 'aktiv'
         and ku.bewertung_status in ('offen','gebeten')
         and (ku.bewertung_zuletzt is null
              or ku.bewertung_zuletzt < now() - (abstand || ' days')::interval)
         -- erst nach einem tatsächlichen Besuch, und nicht direkt danach
         and exists (select 1 from punktebewegung b
                      where b.kundin_id = ku.id and b.anlass in ('behandlung','produkt')
                        and b.zeitpunkt < now() - interval '2 days')
    loop
      perform _mail_einreihen(k.id,'bewertung','programm','bewertung_' || to_char(now(),'YYYYMM'));
      update kundin set bewertung_status = 'gebeten', bewertung_zuletzt = now() where id = k.id;
      n := n + 1;
    end loop;
  end loop;
  return n;
end $$;

create or replace function public._mail_https(p_url text)
returns text language plpgsql immutable set search_path=public,extensions,pg_temp as $$
begin
 if p_url is null or p_url !~ '^https://[a-zA-Z0-9][a-zA-Z0-9.-]*(:[0-9]+)?([/?#][^[:space:]<>"\\]*)?$' then
  raise exception 'Mail-Link fehlt oder ist keine gültige HTTPS-Adresse';
 end if;
 return p_url;
end $$;

create or replace function public._mail_absatz(p_text text)
returns text language sql immutable set search_path=public,extensions,pg_temp as $$
 select replace(regexp_replace(_html_esc(coalesce(p_text,'')), '\*\*([^*]+)\*\*','<strong>\1</strong>','g'),E'\n','<br>')
$$;

create or replace function public._mail_html_freigegeben(p_inhalt jsonb,p_link text,p_abmelden text,p_recht text)
returns text language plpgsql stable set search_path=public,extensions,pg_temp as $$
declare logo text := coalesce(_e('logo_url'), '');
begin
return
'<!doctype html><html lang="de"><head><meta charset="utf-8">'
||'<meta name="viewport" content="width=device-width,initial-scale=1">'
||'<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
||'<title>' || _html_esc(p_inhalt->>'betreff') || '</title>'
||'<style>body{margin:0;padding:0;background:#21191A}'
||'a[x-apple-data-detectors]{color:inherit!important;text-decoration:none!important}'
||'@media (max-width:620px){.aussen{padding:16px 8px!important}.innen{padding-left:20px!important;padding-right:20px!important}}</style>'
||'</head>'
||'<body style="margin:0;padding:0;background:#21191A;">'
||'<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#21191A">'||_html_esc(p_inhalt->>'vorschau')||'</div>'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#21191A;">'
||'<tr><td align="center" class="aussen" style="padding:32px 16px;">'
||'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#302327;border:1px solid #5A4242;border-radius:18px;">'
||'<tr><td style="padding:26px 32px 18px;text-align:center;border-bottom:1px solid #5A4242;">'
|| case when logo = ''
   then '<div style="font-family:Georgia,''Times New Roman'',serif;font-size:14px;letter-spacing:.26em;color:#DFBE95;">LA PERL&Eacute;</div>'
   else '<img src="' || _html_esc(logo) || '" width="118" alt="La Perl&eacute;" '
     || 'style="width:118px;height:auto;display:block;margin:0 auto;border:0" />' end
||'</td></tr>'
||'<tr><td class="innen" style="padding:32px 32px 8px;">'
||'<h1 style="margin:0 0 16px;font-family:Georgia,''Times New Roman'',serif;font-weight:400;font-size:27px;line-height:1.2;color:#F6E9DF;">'
|| _html_esc(p_inhalt->>'betreff') ||'</h1>'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7;color:#F6E9DF;">'
|| _mail_absatz(p_inhalt->>'vorher') ||'</p>'
|| case when p_link is null then '' else
   '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 8px;"><tr><td '
   ||'style="background:#E0BE98;border-radius:50px;">'
   ||'<a href="'|| _html_esc(p_link) ||'" style="display:inline-block;padding:15px 30px;font-family:Helvetica,Arial,sans-serif;'
   ||'font-size:16px;font-weight:bold;letter-spacing:.01em;color:#2E211B;text-decoration:none;">'
   || _html_esc(coalesce(p_inhalt->>'button','Ansehen')) ||' &rarr;</a></td></tr></table>' end
||'<p style="margin:22px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:16px;line-height:1.7;color:#F6E9DF">'||_mail_absatz(p_inhalt->>'nachher')||'</p>'
||'</td></tr>'
||'<tr><td class="innen" style="padding:18px 32px 28px;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.6;color:#C6ABA8;">'
|| case when p_abmelden is null
 then 'Diese E-Mail enthält Informationen zu deinem La Perlé Clubkonto oder deinem angeforderten Zugang.'
 else 'Du möchtest solche E-Mails nicht mehr erhalten? <a href="'||_html_esc(p_abmelden)||'" style="color:#DFBE95">E-Mail-Einstellungen ändern</a> · <a href="'||_html_esc(p_abmelden)||'" style="color:#DFBE95">Von Werbe-E-Mails abmelden</a>' end
||'</p></td></tr>'
||'<tr><td style="padding:18px 32px;text-align:center;border-top:1px solid #5A4242;">'
||'<p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#C6ABA8;">'
||'La Perl&eacute; Beauty Boutique<br>Bruchfeldstra&szlig;e 33&nbsp;&middot;&nbsp;60528 Frankfurt am Main<br><a href="'||_html_esc(p_recht||'#impressum')||'" style="color:#DFBE95">Impressum</a> · <a href="'||_html_esc(p_recht||'#datenschutz')||'" style="color:#DFBE95">Datenschutz</a></p>'
||'</td></tr></table></td></tr></table></body></html>';
end $$;

-- Komposition zentral für HTML, Klartext, Vorschau und Tests. Kein Versand.
create or replace function public._mail_ausgabe(p_inhalt jsonb,p_club text,p_abmelden text default null)
returns jsonb language plpgsql stable set search_path=public,extensions,pg_temp as $$
declare link text; basis text; recht text; settings text; plain text;
begin
 basis:=_mail_https(_e('club_basis_url'));
 if basis ~ '[?#]' then raise exception 'Club-Basisadresse darf keine Query oder Fragment enthalten'; end if;
 recht:=coalesce(nullif(_e('mail_recht_url'),''),
   case when basis ~ '/[^/]+\.html$' then regexp_replace(basis,'[^/]+$','recht.html') else rtrim(basis,'/')||'/recht.html' end);
 recht:=_mail_https(recht);
 link:=case p_inhalt->>'ziel'
  when 'registrierung' then basis
  when 'buchung' then _e('buchung_url')
  when 'bewertung' then _e('google_bewertung_url')
  when 'praemien' then p_club||'#praemienBox'
  when 'geschenke' then p_club||'#gewinneBox'
  else p_club end;
 link:=_mail_https(link);
 if coalesce((p_inhalt->>'werbung')::boolean,false) then
  settings:=_mail_https(p_abmelden);
 end if;
 plain:=replace(coalesce(p_inhalt->>'vorher',''),'**','')||E'\n\n'||(p_inhalt->>'button')||': '||link||E'\n\n'||replace(coalesce(p_inhalt->>'nachher',''),'**','');
 plain:=plain||E'\n\n'||case when settings is null then 'Diese E-Mail enthält Informationen zu deinem La Perlé Clubkonto oder deinem angeforderten Zugang.'
 else 'E-Mail-Einstellungen ändern / Von Werbe-E-Mails abmelden: '||settings end
 ||E'\nLa Perlé Beauty Boutique\nBruchfeldstraße 33 · 60528 Frankfurt am Main\nImpressum: '||recht||'#impressum'||E'\nDatenschutz: '||recht||'#datenschutz';
 return jsonb_build_object('subject',p_inhalt->>'betreff','htmlContent',_mail_html_freigegeben(p_inhalt,link,settings,recht),'textContent',plain);
end $$;

create or replace function public._mail_nachricht(p_n nachricht)
returns jsonb language plpgsql stable set search_path=public,extensions,pg_temp as $$
declare k kundin; club text; t jsonb;
begin
 select * into k from kundin where id=p_n.kundin_id;
 if k.id is null then raise exception 'Mailkonto fehlt'; end if;
 club:=_mail_https(_e('club_basis_url'))||'?t='||k.zugangstoken;
 t:=coalesce(p_n.mail_inhalt,jsonb_build_object('betreff',coalesce(p_n.betreff,'La Perlé Club'),'vorher',p_n.text,'nachher','','vorschau','','button','Zum Clubbereich','ziel','club','werbung',p_n.anlass not in ('willkommen','verfall_warnung')));
 return _mail_ausgabe(t,club,club||'#einwilligungen');
end $$;

create or replace function job_mail_senden(p_max int default 40)
returns int language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare n nachricht; req bigint; anz int := 0; key text; absender text; name text;
        antwort text; basis text; frei int; ew_art text; ok boolean; inhalt jsonb;
begin
  if coalesce(_e('mail_aktiv'),'false') <> 'true' then return 0; end if;
  key := _e('mail_api_key');
  if key is null or key = '' then return 0; end if;
  absender := _e('mail_absender'); name := _e('mail_absendername');
  antwort := _e('mail_antwort_an'); basis := _e('club_basis_url');

  -- hängengebliebene Beanspruchungen (Läufer vor der Übergabe abgebrochen) freigeben
  update nachricht set status = 'offen', beansprucht_am = null, status_seit = now()
   where status = 'in_arbeit' and beansprucht_am < now() - interval '30 minutes';
  -- vorübergehend fehlgeschlagene sind wieder fällig
  update nachricht set status = 'offen', status_seit = now()
   where status = 'fehler_temporaer' and faellig_am <= now();

  for n in
    update nachricht na set beansprucht_am = now(), status = 'in_arbeit', status_seit = now()
     where na.id in (
       select id from nachricht
        where kanal = 'email' and status = 'offen' and faellig_am <= now()
        order by erstellt_am
        limit p_max
        for update skip locked)
    returning na.*
  loop
    ew_art := case when n.anlass = 'geburtstag' then 'geburtstag'
                when n.anlass in ('verfall_warnung','willkommen') then null
                else 'email_werbung' end;
    if not exists (select 1 from kundin k where k.id = n.kundin_id and k.status = 'aktiv')
       or (ew_art is not null and not exists (
             select 1 from einwilligung e where e.kundin_id = n.kundin_id
              and e.art = ew_art and e.widerrufen_am is null)) then
      update nachricht set status = 'storniert', beansprucht_am = null, status_seit = now(),
             fehler = 'Einwilligung/Status beim Versand nicht mehr gegeben' where id = n.id;
      continue;
    end if;
    begin
      inhalt:=_mail_nachricht(n);
    exception when others then
      update nachricht set status='fehler_temporaer',beansprucht_am=null,status_seit=now(),faellig_am=now()+interval '1 hour',fehler='Mailvorlage/Linkkonfiguration: '||sqlerrm where id=n.id;
      continue;
    end;
    -- Tageskontingent: ein Platz je Versuch, gemeinsam mit allen anderen Wegen
    if _mail_reservieren(1) < 1 then
      update nachricht set status = 'offen', beansprucht_am = null, status_seit = now(),
             faellig_am = greatest(faellig_am, (_mail_tag() + 1)::timestamptz) where id = n.id;
      continue;
    end if;

    select net.http_post(
      url := 'https://api.brevo.com/v3/smtp/email',
      headers := jsonb_build_object('api-key', key, 'Content-Type', 'application/json'),
      body := jsonb_build_object(
        'sender',  jsonb_build_object('email', absender, 'name', name),
        'replyTo', jsonb_build_object('email', antwort),
        'to', jsonb_build_array(jsonb_build_object(
                'email', (select email from kundin where id = n.kundin_id),
                'name', (select vorname || ' ' || nachname from kundin where id = n.kundin_id))),
        'subject',inhalt->>'subject',
        'htmlContent',inhalt->>'htmlContent',
        'textContent',inhalt->>'textContent')
    ) into req;

    update nachricht set request_id = req, versuche = versuche + 1, status = 'gesendet_offen',
           angestossen_am = now(), status_seit = now()
     where id = n.id;
    anz := anz + 1;
  end loop;
  return anz;
end $$;

create or replace function admin_mail_speichern(p_token text, p_schluessel text, p_wert text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare s terminal_sitzung; m mitarbeiterin;
begin
  s := _admin(p_token,'admin_mail_speichern');
  select * into m from mitarbeiterin where id = s.mitarbeiterin_id;
  if m.rolle <> 'zentrale' then raise exception 'Nur die Zentrale.'; end if;
  if p_schluessel in ('buchung_url','mail_recht_url') and nullif(p_wert,'') is not null then perform _mail_https(p_wert); end if;
  if p_schluessel not in ('buchung_url','mail_recht_url','mail_anbieter','mail_api_key','mail_absender','mail_absendername',
                          'mail_antwort_an','club_basis_url','mail_aktiv',
                          'google_bewertung_url','feedback_punkte','feedback_ab_besuchen',
                          'bewertung_abstand_tage','wallet_aktiv','logo_url',
                          'rueckkehr_faktor1','rueckkehr_faktor2','rueckkehr_standard',
                          'rueckkehr_min_besuche','rueckkehr_min_tage','rueckkehr_max_tage',
                          'korrektur_grenze') then
    raise exception 'Unbekannte Einstellung.';
  end if;
  update einstellung set wert = p_wert where schluessel = p_schluessel;
  return jsonb_build_object('ok', true);
end $$;

update public.nachricht set mail_inhalt=null
where kanal='email' and status='offen' and versuche=0 and request_id is null and mail_inhalt is null
and anlass='willkommen' and (schluessel='willkommen' or schluessel like 'zugang_%' or schluessel like 'altlink_%');


-- Testversand verwendet dieselbe freigegebene Vorlage und beide MIME-Versionen.
create or replace function public.admin_mail_test(p_token text,p_an text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp set timezone='Europe/Berlin' as $$
declare s terminal_sitzung; req bigint; key text; inhalt jsonb;
begin
 s:=_admin(p_token,'admin_mail_test');
 key:=_e('mail_api_key');
 if coalesce(key,'')='' then raise exception 'Kein API-Schlüssel hinterlegt.'; end if;
 if p_an !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Empfängeradresse ungültig.'; end if;
 inhalt:=_mail_ausgabe(_mail_vorlage('willkommen',jsonb_build_object('Vorname','Test')), _e('club_basis_url'));
 if _mail_reservieren(1)<1 then raise exception 'Tageskontingent für Mails erschöpft.'; end if;
 select net.http_post(url:='https://api.brevo.com/v3/smtp/email',headers:=jsonb_build_object('api-key',key,'Content-Type','application/json'),
 body:=inhalt||jsonb_build_object('subject','TEST – '||(inhalt->>'subject'),
   'sender',jsonb_build_object('email',_e('mail_absender'),'name',_e('mail_absendername')),
   'replyTo',jsonb_build_object('email',_e('mail_antwort_an')),
   'to',jsonb_build_array(jsonb_build_object('email',p_an)))) into req;
 return jsonb_build_object('request_id',req,'hinweis','Testmail mit freigegebener Willkommensvorlage angefordert. Eingang im Testpostfach prüfen.');
end $$;

-- Bereits wartende, nie versuchte automatische Mails ebenfalls aktualisieren.
-- Unklare oder schon angenommene Sendungen bleiben unangetastet.
do $$
declare n record; t jsonb; daten jsonb; v text; p record; e record; frist date; stand int;
begin
 for n in select na.*,k.vorname,k.letzter_besuch,k.registriert_am,o.verfall_monate
  from nachricht na join kundin k on k.id=na.kundin_id join organisation o on o.id=k.organisation_id
  where na.kanal='email' and na.status='offen' and na.versuche=0 and na.request_id is null and na.mail_inhalt is null
 loop
  v:=null; daten:=jsonb_build_object('Vorname',n.vorname);
  if n.anlass='vermisst' and n.schluessel like 'rueckkehr1_%' then v:='rueckkehr1';
  elsif n.anlass='vermisst' and n.schluessel like 'rueckkehr2_%' then v:='rueckkehr2';
  elsif n.anlass='programm' and n.schluessel like 'bewertung_%' then v:='bewertung';
  elsif n.anlass='praemie_nah' then
   select pr.bezeichnung,pr.punkte-pk.stand as fehlen into p from punktekonto pk join praemie pr on pr.organisation_id=n.organisation_id and pr.aktiv
    where pk.kundin_id=n.kundin_id and pr.punkte>pk.stand and pr.punkte-pk.stand<=50 order by pr.punkte,pr.id limit 1;
   if found then v:='praemie_nah'; daten:=daten||jsonb_build_object('Prämie',p.bezeichnung,'Anzahl',p.fehlen); end if;
  elsif n.anlass='geburtstag' then
   select x.* into e from einloesung x join aktion a on a.id=x.aktion_id and a.ausloeser='geburtstag'
    where x.kundin_id=n.kundin_id and x.status='angefordert' and x.gueltig_bis>now() order by x.angefordert_am desc limit 1;
   if found then v:='geburtstag'; daten:=daten||jsonb_build_object('Geburtstagsgeschenk',case e.art when 'betrag' then e.nennwert||' Geburtstagsgutschein' when 'prozent' then e.nennwert||' Geburtstagsvorteil' else e.bezeichnung end,'Datum',to_char(e.gueltig_bis at time zone 'Europe/Berlin','DD.MM.YYYY')); end if;
  elsif n.anlass='verfall_warnung' and n.verfall_monate is not null then
   select pk.stand into stand from punktekonto pk where pk.kundin_id=n.kundin_id;
   frist:=((coalesce(n.letzter_besuch,n.registriert_am)+make_interval(months=>n.verfall_monate)) at time zone 'Europe/Berlin')::date;
   if stand>0 and frist>=(now() at time zone 'Europe/Berlin')::date then v:='verfall_warnung'; daten:=daten||jsonb_build_object('Anzahl',stand,'Datum',to_char(frist,'DD.MM.YYYY')); end if;
  end if;
  if v is not null then
   t:=_mail_vorlage(v,daten);
   update nachricht set mail_inhalt=t,betreff=t->>'betreff',text=replace((t->>'vorher')||E'\n\n'||(t->>'nachher'),'**','') where id=n.id;
  elsif n.anlass in ('praemie_nah','geburtstag','verfall_warnung') then
   update nachricht set status='storniert',status_seit=now(),fehler='Anlass bei Vorlagenumstellung nicht mehr aktuell' where id=n.id;
  end if;
 end loop;
end $$;

select public.rechte_setzen();
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260918012545_wallet_apple_und_google_ausgabe.sql
-- Erste native Kartenausgabe. Keine Aktivierung, keine externen Aufrufe.
set local search_path=public,extensions,pg_temp;
insert into einstellung(schluessel,wert,hinweis) values
 ('apple_wallet_aktiv','false','Apple erst nach Schlüssel- und Gerätetest aktivieren')
on conflict(schluessel) do nothing;
create or replace function wallet_kartendaten(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin; o organisation; stand int; lvl jsonb; naechste praemie; wp wallet_pass;
begin
  k := _kundin_per_token(p_token);
  if coalesce(_e('wallet_aktiv'),'false') <> 'true' or not _an('wallet') then
    return jsonb_build_object('aktiv',false);
  end if;
  select * into o from organisation where id = k.organisation_id;
  select pk.stand into stand from punktekonto pk where pk.kundin_id = k.id;
  lvl := _level_stand(k.id);

  select * into naechste from praemie
   where organisation_id = o.id and aktiv and punkte > stand order by punkte limit 1;

  perform pg_advisory_xact_lock(hashtext('wallet-link:' || k.id::text));
  select * into wp from wallet_pass where kundin_id=k.id and plattform='google' for update;
  if wp.id is not null and wp.zurueckgezogen_am is not null then
    update wallet_pass set zurueckgezogen_am=null,fehler_anzahl=0,nicht_gefunden_anzahl=0,
      naechster_versuch=null,stand_version=stand_version+1,aktualisierung_noetig=true,
      abgeglichen_am=null where id=wp.id returning * into wp;
  end if;

  if wp.id is null then
    insert into wallet_pass (kundin_id, plattform, serien_nummer, auth_token)
    values (k.id, 'google',
            _e('google_issuer_id') || '.kundin_' || replace(k.id::text, '-', ''),
            encode(gen_random_bytes(16), 'hex'))
    returning * into wp;
  end if;

  return jsonb_build_object(
    'aktiv',        coalesce(_e('wallet_aktiv'), 'false') = 'true' and _an('wallet'),
    'issuer_id',    _e('google_issuer_id'),
    'class_id',     _e('google_class_id'),
    'logo_url',     _e('logo_url'),
    'object_id',    wp.serien_nummer,
    'vorname',      k.vorname, 'nachname', k.nachname, 'kundennummer', k.kundennummer,
    'stand',        stand,
    'rang',         case when _an('level') then lvl->>'name' else null end,
    -- Wenn die Kundin ein Ziel hinterlegt hat, steht das auf der Karte
    'zeile',        coalesce(
                      case when _an('ziel') and k.ziel_erreicht_am is null then k.ziel end,
                      case when naechste.id is null then 'Alle Prämien erreicht'
                           else naechste.bezeichnung || ' in Reichweite' end),
    'naechste',     case when naechste.id is null then 'alle erreicht'
                    else (naechste.punkte - stand) || ' bis ' || naechste.bezeichnung end,
    'club_url',     coalesce(_e('club_basis_url'), 'https://laperle-beauty.de') || '?t=' || k.zugangstoken
  );
end $$;

create or replace function wallet_apple_kartendaten(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin; o organisation; stand int; lvl jsonb; naechste praemie; wp wallet_pass;
begin
  k := _kundin_per_token(p_token);
  if coalesce(_e('apple_wallet_aktiv'),'false') <> 'true' or not _an('wallet') then
    return jsonb_build_object('aktiv',false);
  end if;
  select * into o from organisation where id = k.organisation_id;
  select pk.stand into stand from punktekonto pk where pk.kundin_id = k.id;
  lvl := _level_stand(k.id);

  select * into naechste from praemie
   where organisation_id = o.id and aktiv and punkte > stand order by punkte limit 1;

  perform pg_advisory_xact_lock(hashtext('wallet-apple-link:' || k.id::text));
  select * into wp from wallet_pass where kundin_id=k.id and plattform='apple' for update;
  if wp.id is not null and wp.zurueckgezogen_am is not null then
    update wallet_pass set zurueckgezogen_am=null,fehler_anzahl=0,nicht_gefunden_anzahl=0,
      naechster_versuch=null,stand_version=stand_version+1,aktualisierung_noetig=true,
      abgeglichen_am=null where id=wp.id returning * into wp;
  end if;

  if wp.id is null then
    insert into wallet_pass (kundin_id, plattform, serien_nummer, auth_token)
    values (k.id, 'apple',
            'laperle_' || replace(k.id::text, '-', ''),
            encode(gen_random_bytes(16), 'hex'))
    returning * into wp;
  end if;

  return jsonb_build_object(
    'aktiv',        coalesce(_e('apple_wallet_aktiv'), 'false') = 'true' and _an('wallet'),
    'pass_type',    'pass.de.laperlebeauty.club',
    'team_id',      'FPDU6B86GK',
    'logo_url',     _e('logo_url'),
    'object_id',    wp.serien_nummer,
    'vorname',      k.vorname, 'nachname', k.nachname, 'kundennummer', k.kundennummer,
    'stand',        stand,
    'rang',         case when _an('level') then lvl->>'name' else null end,
    -- Wenn die Kundin ein Ziel hinterlegt hat, steht das auf der Karte
    'zeile',        coalesce(
                      case when _an('ziel') and k.ziel_erreicht_am is null then k.ziel end,
                      case when naechste.id is null then 'Alle Prämien erreicht'
                           else naechste.bezeichnung || ' in Reichweite' end),
    'naechste',     case when naechste.id is null then 'alle erreicht'
                    else (naechste.punkte - stand) || ' bis ' || naechste.bezeichnung end,
    'club_url',     coalesce(_e('club_basis_url'), 'https://laperle-beauty.de') || '?t=' || k.zugangstoken
  );
end $$;

insert into rechte_erwartet(signatur) values ('wallet_apple_kartendaten(text)') on conflict do nothing;
select rechte_setzen();
notify pgrst,'reload schema';


-- SOURCE supabase/migrations/20260918165551_wallet_automatic_updates.sql
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


-- SOURCE supabase/migrations/20260918180259_wallet_final_readiness.sql
-- Preserve worker leases/receipts, include current holder name and level gate.
set local search_path=public,extensions,pg_temp;
do $migration$
declare definition text;
begin
 select pg_get_functiondef('wallet_offene_karten(integer)'::regprocedure) into definition;
 if position('''vorname'', k.vorname' in definition)=0 then
  definition:=replace(definition,'''kundennummer'', k.kundennummer,','''vorname'', k.vorname, ''nachname'', k.nachname, ''kundennummer'', k.kundennummer,');
 end if;
 definition:=replace(definition,'coalesce((_level_stand(w.kundin_id))->>''name'', ''Bronze'')','case when _an(''level'') then (_level_stand(w.kundin_id))->>''name'' else null end');
 execute definition;
end $migration$;
notify pgrst,'reload schema';

do $$ begin
assert not exists(select id,zugangstoken,email from release_customer_identity except select id,zugangstoken,email from kundin),'Existing customer identities changed';
assert (select count(*) from release_customer_identity)=(select count(*) from kundin),'Customer count changed';
end $$;
select 'PASS upgrade rehearsal and existing customer identity preservation' as result;
rollback;

