import {useEffect} from 'react';
import {Link,Navigate,Outlet,Route,Routes,useLocation} from 'react-router-dom';
import {PublicLayout,StaffLayout} from './layouts';
import {owner} from '../lib/db/offline';
import {event,sb} from '../lib/supabase/client';
import {staffUser} from '../lib/sync/checkin';
import {useData} from '../lib/supabase/data';
import RegistrationPage from '../features/registration/RegistrationPage';
import PassPage from '../features/registration/PassPage';
import LoginPage from '../features/auth/LoginPage';
import CheckinPage from '../features/checkin/CheckinPage';
import {Home,Agenda,Lodging,Food,Transport,Notices,Offline} from '../features/public/DirectoryPages';
import {Team,Commissions,Commission,SyncStatus} from '../features/commissions/RealTeam';
import {ScheduleEditor,NoticeEditor} from '../features/coordination/RealEditors';
function LocalTeam(){return owner()?<Outlet/>:<Navigate to="/equipo/ingresar" replace/>;}
function Coordinator(){const d=useData(owner()?`coordinator:${owner()}`:null,async()=>{const [ev,u]=await Promise.all([event(),staffUser()]);const {data,error}=await sb.from('event_memberships').select('role,active').eq('event_id',ev.id).eq('user_id',u.id).maybeSingle();if(error)throw error;return data?.role==='coordinator'&&data.active;},{cache:false});return d.value===true&&!d.error?<Outlet/>:<main className="page"><p role="status">{d.error??(d.value===false?'Solo coordinación.':'Verificando acceso…')}</p><Link className="btn btn-secondary" to="/equipo">Volver al equipo</Link></main>;}
export default function App(){const loc=useLocation();useEffect(()=>{window.scrollTo(0,0);},[loc.pathname]);return <Routes>
 <Route element={<PublicLayout/>}><Route index element={<Home/>}/><Route path="/inscripcion" element={<RegistrationPage/>}/><Route path="/mi-pase" element={<PassPage/>}/><Route path="/agenda" element={<Agenda/>}/><Route path="/hospedaje" element={<Lodging/>}/><Route path="/comida" element={<Food/>}/><Route path="/transporte" element={<Transport/>}/><Route path="/avisos" element={<Notices/>}/><Route path="/sin-conexion" element={<Offline/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route>
 <Route element={<StaffLayout/>}><Route path="/equipo/ingresar" element={owner()?<Navigate to="/equipo" replace/>:<LoginPage/>}/></Route>
 <Route element={<LocalTeam/>}><Route path="/equipo/puerta" element={<CheckinPage/>}/><Route element={<StaffLayout/>}><Route path="/equipo" element={<Team/>}/><Route path="/equipo/comisiones" element={<Commissions/>}/><Route path="/equipo/comisiones/:id" element={<Commission key={loc.pathname}/>}/><Route path="/equipo/sincronizacion" element={<SyncStatus/>}/><Route element={<Coordinator/>}><Route path="/coordinacion" element={<Team coord/>}/><Route path="/coordinacion/participantes" element={<Commission participants/>}/><Route path="/coordinacion/agenda" element={<ScheduleEditor/>}/><Route path="/coordinacion/avisos" element={<NoticeEditor/>}/><Route path="/coordinacion/comisiones" element={<Commissions/>}/></Route></Route></Route>
 </Routes>;}
