-- Explicit deny-all policies document that only authorized RPCs can access these private tables.
create policy mission_no_direct_access on club_private.mission for all to anon,authenticated using(false) with check(false);
create policy mission_vorlage_no_direct_access on club_private.mission_vorlage for all to anon,authenticated using(false) with check(false);
-- Preserve existing role checks and signatures. Empty image input removes an image;
-- omitted input (NULL) preserves the existing image for older clients.
do $patch$
declare sig text; definition text;
begin
 foreach sig in array array['public.admin_advent_speichern(text,integer,text,text,integer,uuid,boolean,text)','public.admin_praemie_speichern(text,uuid,text,text,integer,text,numeric,boolean,text)'] loop
  definition:=pg_get_functiondef(sig::regprocedure);
  if position('coalesce(nullif(trim(p_bild),''''), bild_url)' in definition)=0 then raise exception 'Image function changed: %',sig;end if;
  definition:=replace(definition,'coalesce(nullif(trim(p_bild),''''), bild_url)','case when p_bild is null then bild_url else nullif(trim(p_bild),'''') end');
  execute definition;
 end loop;
end $patch$;
