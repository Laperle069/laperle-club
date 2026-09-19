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
