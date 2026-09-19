-- Explicit owner decision: participation only from age 18.
insert into club_private.rechtsfassung(version,inhalt_sha256,url) values ('2026-09-19.4','fc4d31563d91b71edfe752165ca0d8cf54803357baffdce3255b420c2d51ccf1','https://laperle069.github.io/laperle-club/club/recht-2026-09-19-4.html') on conflict(version) do nothing;
CREATE OR REPLACE FUNCTION public.selbst_registrieren(p_vorname text, p_nachname text, p_email text, p_studio_kennung text DEFAULT NULL::text, p_sprache text DEFAULT 'de'::text, p_werberin text DEFAULT NULL::text, p_rechtsversion text DEFAULT NULL::text, p_altersfreigabe text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions', 'pg_temp'
AS $function$
declare o organisation; st studio; k kundin; nr text; w kundin;
        mail text := lower(trim(p_email)); limit_h int; heute int;
begin
  if p_rechtsversion is distinct from '2026-09-19.4' or p_altersfreigabe is distinct from 'volljaehrig' then
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

create or replace function public.kunde_rechtsnachweis(p_token text, p_version text, p_altersfreigabe text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin;
begin
 k:=_kundin_per_token(p_token);
 if p_version is distinct from '2026-09-19.4' or p_altersfreigabe is distinct from 'volljaehrig' then raise exception 'Bitte Bedingungen und Altersangabe bestätigen.'; end if;
 insert into club_private.rechtsnachweis(kundin_id,version,altersfreigabe,bestaetigt_am,quelle)
 values(k.id,p_version,p_altersfreigabe,now(),'kundenbereich')
 on conflict(kundin_id,version) do update set bestaetigt_am=coalesce(club_private.rechtsnachweis.bestaetigt_am,now()), altersfreigabe=excluded.altersfreigabe;
 return jsonb_build_object('ok',true);
end $$;

create or replace function public.kunde_datenschutzstatus(p_token text)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin;
begin
 k:=_kundin_per_token(p_token);
 return jsonb_build_object('version','2026-09-19.4','angenommen',exists(select 1 from club_private.rechtsnachweis where kundin_id=k.id and version='2026-09-19.4' and bestaetigt_am is not null));
end $$;
notify pgrst, 'reload schema';
