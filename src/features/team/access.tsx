import {Link,Outlet,useLocation} from 'react-router-dom';
import {staffUser} from '../../lib/sync/checkin';
import {event,sb} from '../../lib/supabase/client';
import {useAuthId,useData} from '../../lib/supabase/data';
export type Scope='lodging'|'food'|'transport'|'registration';
export async function teamAccess(){
 const [ev,u]=await Promise.all([event(),staffUser()]);
 const {data:m,error}=await sb.from('event_memberships').select('role,active').eq('event_id',ev.id).eq('user_id',u.id).maybeSingle();
 if(error)throw error;
 if(!m?.active||!['staff','coordinator'].includes(m.role))throw Error('No tienes una membresía de equipo activa.');
 const {data:commissions,error:ce}=await sb.from('commissions').select('id,name,scope').eq('event_id',ev.id).order('name');
 if(ce)throw ce;
 return {eventId:ev.id,userId:u.id,coordinator:m.role==='coordinator',commissions};
}
export function useTeamAccess(){const id=useAuthId();return useData(id?`team-panels:${id}`:null,teamAccess,{cache:false});}
export function OnlineTeam(){const id=useAuthId();const {value,error}=useTeamAccess();const path=useLocation().pathname;return id&&value?.userId===id&&!error?<Outlet/>:<main className="page"><p role="status">{error||(!id?'Inicia sesión con tu cuenta de equipo.':'Verificando acceso del equipo…')}</p><Link className="btn btn-secondary" to="/equipo/ingresar" state={{from:path}}>Acceso de equipo</Link></main>;}
export function PanelLinks(){const {value:a,error}=useTeamAccess();if(!a||error)return null;const links=[['lodging','/equipo/hospedaje','Hospedaje'],['food','/equipo/comida','Puestos de comida'],['transport','/equipo/transporte','Transporte'],['registration','/equipo/participantes','Participantes']];return <nav className="nav" aria-label="Paneles operativos">{links.filter(([scope])=>a.coordinator||a.commissions.some(c=>c.scope===scope)).map(([,p,label])=><Link key={p} to={p}>{label}</Link>)}<Link to="/equipo/directorio-comisiones">Directorio de comisiones</Link></nav>;}
