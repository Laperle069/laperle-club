begin;
do $test$
declare o uuid; k uuid; token text:='qa-mission-'||gen_random_uuid(); v uuid; reward uuid; b uuid; result jsonb; denied boolean:=false; i integer; first_bonus uuid;
begin
 select id into o from public.organisation order by id limit 1;
 select id into reward from public.praemie where organisation_id=o and aktiv order by punkte limit 1;
 insert into public.kundin(organisation_id,kundennummer,vorname,nachname,email,zugangstoken,email_bestaetigt_am)
 values(o,'QA-M-'||substr(gen_random_uuid()::text,1,8),'Mission','Test','mission-'||gen_random_uuid()||'@example.invalid',token,now()) returning id into k;
 insert into club_private.mission_vorlage(organisation_id,titel,kategorie,anzahl,praemie_id,aktiv) values(o,'5 x Testbehandlung','laser_intim',5,reward,true) returning id into v;
 perform public.mission_starten(token,v);
 update club_private.mission set gestartet_am=now()-interval '10 days' where kundin_id=k;
 insert into public.punktebewegung(organisation_id,kundin_id,zeitpunkt,betrag,anlass,kategorie) values(o,k,now()-interval '9 days',10,'behandlung','gesicht');
 if (select fortschritt from club_private.mission where kundin_id=k)<>0 then raise exception 'Wrong category counted'; end if;
 for i in 1..5 loop
  insert into public.punktebewegung(organisation_id,kundin_id,zeitpunkt,betrag,anlass,kategorie) values(o,k,now()-i*interval '1 day',10,'behandlung','laser_intim') returning id into b;
  insert into public.punktebewegung(organisation_id,kundin_id,zeitpunkt,betrag,anlass,kategorie) values(o,k,now()-i*interval '1 day',1,'produkt','laser_intim');
 end loop;
 select einloesung_id into first_bonus from club_private.mission where kundin_id=k;
 if (select fortschritt from club_private.mission where kundin_id=k)<>5 or first_bonus is null then raise exception 'Goal completion failed';end if;
 if (select count(*) from public.einloesung where kundin_id=k)<>1 then raise exception 'Duplicate reward';end if;
 insert into public.punktebewegung(organisation_id,kundin_id,zeitpunkt,betrag,anlass,kategorie) values(o,k,now()-interval '1 day',10,'behandlung','laser_intim');
 perform club_private.refresh_mission(k);
 if (select count(*) from public.einloesung where kundin_id=k)<>1 then raise exception 'Replayed reward';end if;
 begin perform public.mission_starten(token,v);exception when others then denied:=true;end;
 if not denied then raise exception 'Completed goal can be restarted';end if;
 insert into public.punktebewegung(organisation_id,kundin_id,betrag,anlass,korrigiert_id,begruendung) values(o,k,-10,'korrektur',b,'QA cancellation');
 if (select fortschritt from club_private.mission where kundin_id=k)<>4 then raise exception 'Correction did not reduce progress';end if;
 if (select status from public.einloesung where id=first_bonus)<>'storniert' then raise exception 'Pending reward not revoked';end if;
 insert into public.punktebewegung(organisation_id,kundin_id,zeitpunkt,betrag,anlass,kategorie) values(o,k,now()-interval '6 days',10,'behandlung','laser_intim');
 if (select einloesung_id from club_private.mission where kundin_id=k)<>first_bonus then raise exception 'Correction created a second reward';end if;
 if (select status from public.einloesung where id=first_bonus)<>'angefordert' then raise exception 'Reward not restored';end if;
 result:=public.kunde_missionen(token);
 if not (result#>>'{mission,abgeschlossen}')::boolean then raise exception 'Customer response incomplete';end if;
 denied:=false;begin perform public.kunde_missionen('invalid-test-token');exception when others then denied:=true;end;
 if not denied then raise exception 'Invalid token accepted';end if;
 if has_table_privilege('anon','club_private.mission','select') or has_function_privilege('anon','club_private.refresh_mission(uuid)','execute') then raise exception 'Private access exposed';end if;
end $test$;
rollback;
select 'PASS: category matching, daily deduplication, automatic one-time reward, replay denial, correction/reinstatement, token checks and private access; synthetic rows rolled back' as result;
