-- Rank progress comes from lifetime earned pearls, never the spendable balance.
-- Keep authentication, leases and existing grants unchanged.
do $$
declare sig text; def text; needle text; replacement text;
begin
 foreach sig in array array['public.wallet_kartendaten(text)','public.wallet_apple_kartendaten(text)','public.wallet_offene_karten(integer)','public.wallet_apple_service(text,jsonb)'] loop
  def := pg_get_functiondef(sig::regprocedure);
  if position('rangfortschritt' in def)>0 then continue; end if;
  if sig='public.wallet_apple_service(text,jsonb)' then
   needle := '''kundennummer'',customer_record.kundennummer,';
   replacement := needle || '''rangfortschritt'',case when _an(''level'') then _level_stand(customer_record.id)->''naechste'' else null end,';
  else
   needle := '''kundennummer'', k.kundennummer,';
   replacement := needle || '''rangfortschritt'',case when _an(''level'') then _level_stand(k.id)->''naechste'' else null end,';
  end if;
  if position(needle in def)=0 then raise exception 'Unexpected wallet function: %',sig; end if;
  execute replace(def,needle,replacement);
 end loop;
end $$;
