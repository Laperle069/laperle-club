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
