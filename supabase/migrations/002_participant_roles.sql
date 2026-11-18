-- Migración 002 — Clasificación por rol ministerial (2026-11-18)
-- Decisión de Raymer: en la inscripción todos son participantes; el campo de
-- tipo congresista/invitado/servidor sobra. La división real es por rol
-- ministerial: miembro, líder, pastor, evangelista, profeta, apóstol.
-- De ese rol salen el QR y el color de la manilla (el color también asigna
-- puestos en el local y a veces la comida). Los colores por rol los dirán
-- las secretarias después; por ahora quedan en "POR CONFIRMAR".
--
-- NOTA: register_participant NO cambia. Con todos los roles en
-- self_selectable=true, el rol pedido queda como rol aprobado directamente
-- (la rama que caía a 'visitor' ya no se alcanza porque ese tipo no existe).
-- Aplicar en el proyecto de Supabase DESPUÉS de la migración 001
-- (AFD_001_schema_rls.sql, que no está versionada en este repo).
-- Ya aplicada en el proyecto de pruebas el 2026-11-18.

begin;
-- 1. Nuevos roles (códigos sin acento; las etiquetas llevan acento).
insert into public.participant_types(event_id,code,label,wristband_label,wristband_color,self_selectable) values
 ('afd20260-0000-4000-8000-000000000001','miembro','Miembro','POR CONFIRMAR','unassigned',true),
 ('afd20260-0000-4000-8000-000000000001','lider','Líder','POR CONFIRMAR','unassigned',true),
 ('afd20260-0000-4000-8000-000000000001','pastor','Pastor','POR CONFIRMAR','unassigned',true),
 ('afd20260-0000-4000-8000-000000000001','evangelista','Evangelista','POR CONFIRMAR','unassigned',true),
 ('afd20260-0000-4000-8000-000000000001','profeta','Profeta','POR CONFIRMAR','unassigned',true),
 ('afd20260-0000-4000-8000-000000000001','apostol','Apóstol','POR CONFIRMAR','unassigned',true)
on conflict(event_id,code) do nothing;

-- 2. Los participantes demo existentes pasan a 'miembro' (antes 'visitor').
update public.participants
set requested_type='miembro', approved_type='miembro'
where event_id='afd20260-0000-4000-8000-000000000001'
  and (requested_type in ('visitor','guest','server')
    or approved_type in ('visitor','guest','server'));

-- 3. Se eliminan los tipos viejos (ya sin referencias).
delete from public.participant_types
where event_id='afd20260-0000-4000-8000-000000000001'
  and code in ('visitor','guest','server');
commit;

-- Cuando las secretarias den los colores por rol, actualizar así:
-- update public.participant_types
-- set wristband_label='<color>', wristband_color='<color>'
-- where event_id='afd20260-0000-4000-8000-000000000001' and code='<rol>';
