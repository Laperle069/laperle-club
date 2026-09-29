-- Expose the configured reward type for local preference ranking.
-- No questionnaire answers are stored; authorization and completion rules stay intact.
CREATE OR REPLACE FUNCTION club_private.missionen(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare k public.kundin; m club_private.mission; result jsonb;
begin
 k:=public._kundin_per_token(p_token);
 select * into m from club_private.mission where kundin_id=k.id and aktiv order by (abgeschlossen_am is null) desc, gestartet_am desc limit 1;
 return jsonb_build_object('aus',not public._an('ziel'),'vorlagen',(select coalesce(jsonb_agg(jsonb_build_object('id',v.id,'titel',v.titel,'anzahl',v.anzahl,'kategorie',v.kategorie,'belohnung',p.bezeichnung,'belohnung_art',p.art) order by v.titel),'[]'::jsonb) from club_private.mission_vorlage v join public.praemie p on p.id=v.praemie_id and p.organisation_id=v.organisation_id where v.organisation_id=k.organisation_id and v.aktiv and p.aktiv),
 'erledigt',(select coalesce(jsonb_agg(vorlage_id),'[]'::jsonb) from club_private.mission where kundin_id=k.id and abgeschlossen_am is not null),
 'mission',case when m.id is null then null else jsonb_build_object('id',m.id,'titel',m.titel,'anzahl',m.anzahl,'fortschritt',m.fortschritt,'belohnung',m.belohnung,'abgeschlossen',m.abgeschlossen_am is not null) end);
end $function$

