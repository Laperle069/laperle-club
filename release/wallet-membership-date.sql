-- Always use the original registration date, including subsequent card updates.
-- Keep authentication, leases and existing grants unchanged.
do $$
declare sig text; def text; needle text; replacement text;
begin
 foreach sig in array array['public.wallet_kartendaten(text)','public.wallet_apple_kartendaten(text)','public.wallet_offene_karten(integer)','public.wallet_apple_service(text,jsonb)'] loop
  def := pg_get_functiondef(sig::regprocedure);
  if position('mitglied_seit' in def)>0 then continue; end if;
  if sig='public.wallet_apple_service(text,jsonb)' then
   needle := '''kundennummer'',customer_record.kundennummer,';
   replacement := needle || '''mitglied_seit'',to_char(customer_record.registriert_am at time zone ''Europe/Berlin'',''DD.MM.YYYY''),';
  else
   needle := '''kundennummer'', k.kundennummer,';
   replacement := needle || '''mitglied_seit'',to_char(k.registriert_am at time zone ''Europe/Berlin'',''DD.MM.YYYY''),';
  end if;
  if position(needle in def)=0 then raise exception 'Unexpected wallet function: %',sig; end if;
  execute replace(def,needle,replacement);
 end loop;
end $$;
