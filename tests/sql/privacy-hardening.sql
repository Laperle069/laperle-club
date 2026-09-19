-- Run only on an isolated database after both privacy SQL files.
-- All test mutations are rolled back; no real emails should be dispatched.
begin;
do $$
declare k kundin; st studio; v jsonb; denied boolean:=false; n bigint;
begin
 select * into st from studio where aktiv order by kennung limit 1;
 select count(*) into n from kundin;
 begin
  perform selbst_registrieren('QA','Privacy','privacy-test@example.invalid',st.kennung,'de',null,null,null);
 exception when others then denied:=true;
 end;
 if not denied then raise exception 'Missing acceptance was accepted'; end if;
 perform selbst_registrieren('QA','Privacy','privacy-test@example.invalid',st.kennung,'de',null,'2026-09-19.4','volljaehrig');
 select * into k from kundin where email='privacy-test@example.invalid';
 if not exists(select 1 from club_private.rechtsnachweis where kundin_id=k.id) then raise exception 'Missing evidence'; end if;
 denied:=false;
 begin
  perform einwilligung_setzen(k.zugangstoken,'email_werbung',true,'Old or forged wording');
 exception when others then denied:=true;
 end;
 if not denied then raise exception 'Old consent wording accepted'; end if;
 perform einwilligung_setzen(k.zugangstoken,'email_werbung',true,'E-Mail-Angebote – Ich möchte Angebote, Neuigkeiten sowie auf meinen Besuchen und Perlen beruhende Erinnerungen von La Perlé Beauty Boutique per E-Mail erhalten. Freiwillig und jederzeit im Club oder per E-Mail widerrufbar.');
 perform einwilligung_setzen(k.zugangstoken,'email_werbung',false,null);
 if exists(select 1 from einwilligung where kundin_id=k.id and widerrufen_am is null) then raise exception 'Revocation ineffective'; end if;
 perform kunde_loeschung_anfordern(k.zugangstoken,true);
 denied:=false;
 begin perform _kundin_per_token(k.zugangstoken); exception when others then denied:=true; end;
 if not denied then raise exception 'Closed account token still accepted'; end if;
 perform club_private.datenschutz_aufraeumen();
 if exists(select 1 from kundin where id=k.id) then raise exception 'Erasure incomplete'; end if;
 if (select count(*) from kundin)<>n then raise exception 'Unexpected other customer deletion'; end if;
 if not exists(select 1 from club_private.aufbewahrung where kundin_id=k.id) then raise exception 'Required evidence not archived'; end if;
 if has_schema_privilege('anon','club_private','USAGE') then raise exception 'Archive schema exposed'; end if;
 if has_function_privilege('anon','public.job_aufraeumen()','EXECUTE') then raise exception 'Housekeeping exposed'; end if;
 if has_function_privilege('anon','public.selbst_registrieren(text,text,text,text,text,text)','EXECUTE') then raise exception 'Legacy registration bypass'; end if;
 raise notice 'PASS privacy acceptance, consent, closure, erasure, archive and ACL checks';
end $$;
rollback;
