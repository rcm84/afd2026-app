-- Requires the original schema and 002_participant_roles.sql. No RLS changes.
begin;
grant delete on public.lodgings, public.food_stalls, public.transport_routes to authenticated;

-- A coordinator promotes a current member with a normal UPDATE. Demote any
-- previous lead in the same transaction, as the same caller under existing RLS.
create or replace function afd_private.rotate_commission_lead()
returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.commissions c
  where c.id=new.commission_id and c.event_id=new.event_id for update;
  if not found then raise exception 'COMMISSION_NOT_AVAILABLE'; end if;
  if not exists(select 1 from public.event_memberships m where m.event_id=new.event_id
                and m.user_id=new.user_id and m.active and m.role in ('staff','coordinator')) then
    raise exception 'RESPONSIBLE_MUST_BE_ACTIVE_TEAM_MEMBER';
  end if;
  update public.commission_members m set role='member'
  where m.event_id=new.event_id and m.commission_id=new.commission_id
    and m.user_id<>new.user_id and m.role='lead';
  return new;
end $$;
create trigger afd_rotate_commission_lead before update of role on public.commission_members
for each row when (new.role='lead') execute function afd_private.rotate_commission_lead();
revoke all on function afd_private.rotate_commission_lead() from public,anon,authenticated;
commit;
