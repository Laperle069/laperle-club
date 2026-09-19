-- Explicitly scoped administrative erasure; never processes other accounts.
create or replace function club_private.datenschutz_konto_bereinigen(p_kundin uuid)
returns jsonb language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare k kundin; a record; n integer:=0; fehler integer:=0; vorher text;
begin
 if p_kundin is null then raise exception 'Eine konkrete Konto-ID ist erforderlich'; end if;
 insert into club_private.loeschauftrag(kundin_id,quelle)
 select c.id,'inaktivitaet' from kundin c join organisation o on o.id=c.organisation_id
 where c.id=p_kundin and c.status<>'geloescht' and o.loeschung_nach_monaten>0
 and coalesce(c.letzter_besuch,c.registriert_am)<now()-make_interval(months=>o.loeschung_nach_monaten)
 on conflict(kundin_id) do nothing;
 for a in select * from club_private.loeschauftrag where kundin_id=p_kundin and abgeschlossen_am is null
 and (gesperrt_bis is null or gesperrt_bis<now())
 order by angefordert_am limit 1 for update skip locked loop
 begin
  select * into k from kundin where id=a.kundin_id for update;
  -- A new visit cancels inactivity eligibility; explicit requests remain effective.
  if a.quelle='inaktivitaet' and not exists(select 1 from organisation o where o.id=k.organisation_id
    and o.loeschung_nach_monaten>0 and coalesce(k.letzter_besuch,k.registriert_am)<now()-make_interval(months=>o.loeschung_nach_monaten)) then
    delete from club_private.loeschauftrag where kundin_id=k.id; continue;
  end if;
  -- Financial receipt snapshots are restricted and do not retain the entire customer record.
  insert into club_private.aufbewahrung(kundin_id,zweck,daten,loeschen_ab)
  select k.id,'beleg',jsonb_build_object('kundennummer',k.kundennummer,'vorname',k.vorname,'nachname',k.nachname,
    'beleg',to_jsonb(e)-'begruendung','punktebuchung',case when b.id is null then null else to_jsonb(b)-'begruendung' end),
    (date_trunc('year',coalesce(e.ausgegeben_am,e.angefordert_am) at time zone 'Europe/Berlin')+interval '9 years') at time zone 'Europe/Berlin'
  from einloesung e left join punktebewegung b on b.id=e.punktebewegung_id
  where e.kundin_id=k.id and e.status='ausgegeben'
    and (date_trunc('year',coalesce(e.ausgegeben_am,e.angefordert_am) at time zone 'Europe/Berlin')+interval '9 years') at time zone 'Europe/Berlin'>now();
  insert into club_private.aufbewahrung(kundin_id,zweck,daten,loeschen_ab)
  select k.id,'einwilligung',jsonb_build_object('email',k.email,'nachweis',to_jsonb(e)),now()+interval '3 years'
    from einwilligung e where kundin_id=k.id;
  insert into club_private.aufbewahrung(kundin_id,zweck,daten,loeschen_ab)
  select k.id,'vertrag',jsonb_build_object('email',k.email,'nachweis',to_jsonb(r)),now()+interval '3 years'
    from club_private.rechtsnachweis r where kundin_id=k.id;
  -- Provider deletion is separately tracked; no claim that provider copies are already erased.
  insert into club_private.dienstleister_loeschung(anbieter,kennung)
    values('brevo',k.email) on conflict do nothing;
  insert into club_private.dienstleister_loeschung(anbieter,kennung)
    select 'google_wallet',serien_nummer from wallet_pass where kundin_id=k.id and plattform='google'
    on conflict do nothing;
  delete from wallet_pass where kundin_id=k.id;
  delete from feedback where kundin_id=k.id;
  delete from empfehlung where werberin_id=k.id or geworbene_id=k.id;
  delete from gluecksrad_dreh where kundin_id=k.id;
  delete from advent_oeffnung where kundin_id=k.id;
  delete from einloesung where kundin_id=k.id;
  vorher:=current_setting('laperle.privacy_erasure',true);
  perform set_config('laperle.privacy_erasure','on',true);
  delete from punktebewegung where kundin_id=k.id;
  perform set_config('laperle.privacy_erasure',coalesce(vorher,''),true);
  delete from kundin where id=k.id; -- remaining contact data, messages, consents and request cascade
  n:=n+1;
 exception when foreign_key_violation then
  -- Unexpected cross-account references must be reviewed, never deleted indiscriminately.
  update club_private.loeschauftrag set gesperrt_bis=now()+interval '1 day',
   sperrgrund='Kontenübergreifender Bezug: Zuordnung vor Löschung prüfen.' where kundin_id=a.kundin_id;
  fehler:=fehler+1;
 end;
 end loop;
 delete from club_private.aufbewahrung where kundin_id=p_kundin and loeschen_ab<=now() and (gesperrt_bis is null or gesperrt_bis<now());

 return jsonb_build_object('konten_geloescht',n,'pruefung_noetig',fehler,
  'dienstleister_offen',(select count(*) from club_private.dienstleister_loeschung where erledigt_am is null));
end $$;
revoke all on function club_private.datenschutz_konto_bereinigen(uuid) from public,anon,authenticated;

