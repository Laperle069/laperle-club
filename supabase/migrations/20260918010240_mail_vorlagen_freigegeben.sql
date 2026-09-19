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
