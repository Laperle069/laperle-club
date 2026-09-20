-- Supply the configured Google class to the authenticated update worker.
do $$
declare def text; needle text := '''object_id'', w.serien_nummer,';
begin
 def := pg_get_functiondef('public.wallet_offene_karten(integer)'::regprocedure);
 if position('class_id' in def)>0 then return; end if;
 if position(needle in def)=0 then raise exception 'Unexpected wallet worker'; end if;
 execute replace(def,needle,needle || '''class_id'',_e(''google_class_id''),');
end $$;
