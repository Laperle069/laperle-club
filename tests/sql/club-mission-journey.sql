-- TEST only. All temporary logins, staff, customers, templates and credits roll back.
begin;
do $journey$
declare o uuid; st uuid; staff uuid; k uuid; v uuid; reward uuid; bonus uuid;
 customer_token text:='qa-journey-'||gen_random_uuid(); pin text:=gen_random_uuid()::text;
 studio_code text:='QA-'||substr(gen_random_uuid()::text,1,8); session_token text;
 request_id text:=gen_random_uuid()::text; response jsonb; duplicate jsonb; view_data jsonb;
 denied boolean; i integer;
begin
 select id into strict o from public.organisation order by id limit 1;
 select id into strict reward from public.praemie where organisation_id=o and aktiv order by punkte limit 1;
 insert into public.studio(organisation_id,kennung,name) values(o,studio_code,'QA mission studio') returning id into st;
 insert into public.mitarbeiterin(organisation_id,studio_id,name,pin_hash,rolle)
 values(o,st,'QA mission staff',extensions.crypt(pin,extensions.gen_salt('bf')),'zentrale') returning id into staff;
 response:=public.terminal_anmelden(studio_code,pin);session_token:=response->>'token';
 if session_token is null then raise exception 'Synthetic login failed';end if;
 insert into public.kundin(organisation_id,kundennummer,vorname,nachname,email,zugangstoken,email_bestaetigt_am)
 values(o,'QA-J-'||substr(gen_random_uuid()::text,1,8),'Mission','Journey','mission-'||gen_random_uuid()||'@example.invalid',customer_token,now()) returning id into k;
 response:=public.admin_mission_speichern(session_token,null,'5 x QA Intimlaser','laser_intim',5,reward,false,30);
 v:=(response->>'id')::uuid;
 if not exists(select 1 from jsonb_array_elements(public.admin_missionen(session_token)->'vorlagen') j where j->>'id'=v::text) then raise exception 'Saved draft missing in admin';end if;
 if exists(select 1 from jsonb_array_elements(public.kunde_missionen(customer_token)->'vorlagen') j where j->>'id'=v::text) then raise exception 'Draft exposed to customer';end if;
 perform public.admin_mission_speichern(session_token,v,'5 x QA Intimlaser','laser_intim',5,reward,true,30);
 perform public.mission_starten(customer_token,v);
 update club_private.mission set gestartet_am=now()-interval '10 days' where kundin_id=k;
 for i in 1..4 loop
  insert into public.punktebewegung(organisation_id,kundin_id,studio_id,betrag,anlass,kategorie,zeitpunkt)
  values(o,k,st,10,'behandlung','laser_intim',now()-i*interval '1 day');
 end loop;
 perform public.punkte_buchen(session_token,k,100,'gesicht',null,gen_random_uuid()::text);
 if (public.kunde_missionen(customer_token)#>>'{mission,fortschritt}')::int<>4 then raise exception 'Different category advanced goal';end if;
 response:=public.punkte_buchen(session_token,k,100,'laser_intim',null,request_id);
 duplicate:=public.punkte_buchen(session_token,k,100,'laser_intim',null,request_id);
 if response->>'bewegung_id' is distinct from duplicate->>'bewegung_id' then raise exception 'Duplicate booking created';end if;
 if not (public.kunde_missionen(customer_token)#>>'{mission,abgeschlossen}')::boolean then raise exception 'Terminal did not complete goal';end if;
 select einloesung_id into bonus from club_private.mission where kundin_id=k;
 if bonus is null or (select count(*) from public.einloesung where kundin_id=k)<>1 then raise exception 'One goal reward expected';end if;
 view_data:=public.kunde_laden(customer_token);
 if not exists(select 1 from jsonb_array_elements(view_data->'gewinne') j where j->>'id'=bonus::text) then raise exception 'Reward missing in Club';end if;
 view_data:=public.kundin_laden(session_token,(select kundennummer from public.kundin where id=k));
 if not exists(select 1 from jsonb_array_elements(view_data->'offene_einloesungen') j where j->>'id'=bonus::text) then raise exception 'Reward missing at terminal';end if;
 if (select gueltig_bis from public.einloesung where id=bonus) not between now()+interval '29 days' and now()+interval '31 days' then raise exception 'Reward expiry not respected';end if;
 update public.mitarbeiterin set rolle='personal' where id=staff;
 denied:=false;begin perform public.admin_mission_speichern(session_token,v,'Not allowed','laser',5,reward,true,90);exception when others then denied:=true;end;
 if not denied then raise exception 'Staff without admin role changed a goal';end if;
 perform public.terminal_abmelden(session_token);
 denied:=false;begin perform public.kundin_laden(session_token,(select kundennummer from public.kundin where id=k));exception when others then denied:=true;end;
 if not denied then raise exception 'Logged-out staff retained access';end if;
end $journey$;
rollback;
select 'PASS: real TEST login, admin draft/activation, customer selection, terminal category booking, idempotency, Club and terminal reward visibility, configured expiry, role checks, logout; all synthetic records rolled back' as result;
