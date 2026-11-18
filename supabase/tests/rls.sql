-- Ejecutar SOLO en el proyecto de pruebas, desde SQL Editor como postgres.
-- Introducir UUID reales de Auth; no son claves API. A y B deben tener pases distintos.
-- staff es Inscripciones; general pertenece a una comisión general; coord es coordinador.
begin;
select set_config('afd.test.a','',true), set_config('afd.test.b','',true),
       set_config('afd.test.staff','',true), set_config('afd.test.general','',true),
       set_config('afd.test.coord','',true),set_config('afd.test.revoked','',true);

do $$
declare e uuid; a uuid; b uuid; s uuid; g uuid; c uuid; revoked uuid; registration uuid; venue_scope uuid; device uuid; token uuid;
begin
 select id into strict e from public.events where slug='afd-2026';
 a:=nullif(current_setting('afd.test.a'),'')::uuid;
 b:=nullif(current_setting('afd.test.b'),'')::uuid;
 s:=nullif(current_setting('afd.test.staff'),'')::uuid;
 g:=nullif(current_setting('afd.test.general'),'')::uuid;
 c:=nullif(current_setting('afd.test.coord'),'')::uuid;
 revoked:=nullif(current_setting('afd.test.revoked'),'')::uuid;
 if (select count(distinct u) from unnest(array[a,b,s,g,c,revoked]) u)<>6 then raise exception 'Se requieren seis UUID distintos'; end if;
 select qr_token into strict token from public.participants where event_id=e and user_id=a and status='active';
 if not exists(select 1 from public.participants where event_id=e and user_id=b) then raise exception 'B necesita un pase'; end if;
 if exists(select 1 from public.checkins x join public.participants p on p.id=x.participant_id where x.event_id=e and p.qr_token=token) then raise exception 'A necesita un pase aún no escaneado'; end if;
 select id into strict registration from public.commissions where event_id=e and scope='registration';
 select cm.commission_id into venue_scope from public.commission_members cm join public.commissions j on j.id=cm.commission_id where j.event_id=e and j.scope='general' and cm.user_id=g limit 1;
 select id into device from public.checkin_devices where event_id=e and user_id=s and active limit 1;
 if venue_scope is null or device is null then raise exception 'Falta la comisión general o el dispositivo de Inscripciones'; end if;
 if not exists(select 1 from public.event_memberships where event_id=e and user_id=revoked and not active) then raise exception 'Falta desactivar la membresía de revoked'; end if;
 perform set_config('afd.test.event',e::text,true);
 perform set_config('afd.test.registration',registration::text,true);
 perform set_config('afd.test.general_commission',venue_scope::text,true);
 perform set_config('afd.test.device',device::text,true);
 perform set_config('afd.test.token',token::text,true);
end $$;
set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
do $$ begin
 if not exists(select 1 from public.events where slug='afd-2026') then raise exception 'El evento debería ser público'; end if;
 if exists(select 1 from public.schedule_releases where state='draft') then raise exception 'Un borrador es público'; end if;
 if exists(select 1 from public.food_stalls where not is_published) then raise exception 'Un puesto no publicado es público'; end if;
 begin
  perform public.get_checkin_manifest(current_setting('afd.test.event')::uuid);
  raise exception 'Anon pudo ejecutar get_checkin_manifest';
 exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('afd.test.a'),'role','authenticated','is_anonymous',true)::text,true);
do $$ declare e uuid:=current_setting('afd.test.event')::uuid; begin
 if (select count(*) from public.participants where event_id=e)<>1 then raise exception 'A debe ver exactamente su pase'; end if;
 if exists(select 1 from public.participants where user_id=current_setting('afd.test.b')::uuid) then raise exception 'A pudo ver el pase de B'; end if;
 if (select count(*) from public.participant_private where event_id=e)<>1 then raise exception 'A debe ver solo su teléfono'; end if;
 update public.participants set approved_type='guest' where user_id=auth.uid() and event_id=e;
 if found then raise exception 'A pudo aprobar su manilla'; end if;
 begin
  perform public.submit_checkin(gen_random_uuid(),e,current_setting('afd.test.device')::uuid,current_setting('afd.test.token')::uuid,now());
  raise exception 'A pudo registrar una entrada';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('afd.test.general'),'role','authenticated')::text,true);
do $$ declare e uuid:=current_setting('afd.test.event')::uuid; c uuid:=current_setting('afd.test.registration')::uuid; begin
 if not exists(select 1 from public.commissions where id=current_setting('afd.test.general_commission')::uuid) then raise exception 'General no ve su comisión'; end if;
 if exists(select 1 from public.commissions where id=c) then raise exception 'General ve Inscripciones'; end if;
 begin perform public.get_checkin_manifest(e); raise exception 'General descargó manifiesto';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
 begin perform public.get_commission_roster(e,c); raise exception 'General descargó padrón';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
 begin perform public.publish_schedule(e,gen_random_uuid(),null); raise exception 'General pudo publicar';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('afd.test.staff'),'role','authenticated')::text,true);
do $$ declare e uuid:=current_setting('afd.test.event')::uuid; c uuid:=current_setting('afd.test.registration')::uuid;
 d uuid:=current_setting('afd.test.device')::uuid; t uuid:=current_setting('afd.test.token')::uuid;
 id uuid:=gen_random_uuid(); dt timestamptz:=now(); a jsonb; b jsonb; manifest jsonb;
begin
 manifest:=public.get_checkin_manifest(e);
 if not exists(select 1 from jsonb_array_elements(manifest->'participants') p where p->>'token'=t::text) then raise exception 'Falta pase en manifiesto'; end if;
 if exists(select 1 from jsonb_array_elements(manifest->'participants') p where p ?| array['whatsapp','church','province']) then raise exception 'El manifiesto contiene PII no autorizada'; end if;
 if jsonb_array_length(public.get_commission_roster(e,c))<2 then raise exception 'Faltan registros en el padrón autorizado'; end if;
 begin perform public.submit_checkin(gen_random_uuid(),e,gen_random_uuid(),t,dt); raise exception 'Dispositivo no autorizado aceptado';
 exception when raise_exception then if sqlerrm<>'DEVICE_DISABLED' then raise; end if; end;
 a:=public.submit_checkin(id,e,d,t,dt);b:=public.submit_checkin(id,e,d,t,dt);
 if a is distinct from b or a->>'result' is distinct from 'accepted' then raise exception 'Reintento no idempotente: %, %',a,b; end if;
 b:=public.submit_checkin(gen_random_uuid(),e,d,t,dt);
 if b->>'result' is distinct from 'duplicate' then raise exception 'Segundo UUID debió ser duplicado'; end if;
 if (select count(*) from public.checkins where event_id=e and participant_id=(a->>'participant_id')::uuid)<>1 then raise exception 'Hay más de una entrada'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('afd.test.revoked'),'role','authenticated')::text,true);
do $$ begin
 begin perform public.get_checkin_manifest(current_setting('afd.test.event')::uuid); raise exception 'Revocado descargó manifiesto';
 exception when raise_exception then if sqlerrm<>'FORBIDDEN' then raise; end if; end;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('afd.test.coord'),'role','authenticated')::text,true);
do $$ declare e uuid:=current_setting('afd.test.event')::uuid; d uuid:=gen_random_uuid(); old_release uuid; start_day date; z text; begin
 select active_release_id, starts_on, timezone into old_release,start_day,z from public.events where id=e;
 insert into public.schedule_releases(id,event_id,label) values(d,e,'Prueba RLS (rollback)');
 insert into public.sessions(event_id,release_id,starts_at,ends_at,title,sort_order) values(e,d,(start_day+time '09:00') at time zone z,(start_day+time '10:00') at time zone z,'Prueba transaccional',0);
 perform public.publish_schedule(e,d,old_release);
 if (select active_release_id from public.events where id=e) is distinct from d then raise exception 'La publicación no se hizo activa'; end if;
end $$;
rollback;
