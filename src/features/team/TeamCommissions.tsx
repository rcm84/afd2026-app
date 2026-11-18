import {useState} from 'react';
import {Card,Heading} from '../../shared/ui';
import {sb,msg} from '../../lib/supabase/client';
import {useData} from '../../lib/supabase/data';
import {useTeamAccess} from './access';
export function TeamCommissions(){
 const {value:a}=useTeamAccess();const [status,setStatus]=useState('');const [error,setError]=useState('');const [busy,setBusy]=useState<string>();const [chosen,setChosen]=useState<Record<string,string>>({});
 const d=useData(a?`commission-directory:${a.userId}:${a.eventId}`:null,async()=>{
  const id=a!.eventId; const {data:commissions,error}=await sb.from('commissions').select('id,name,description').eq('event_id',id).order('name');if(error)throw error;
  const {data:members,error:me}=await sb.from('commission_members').select('commission_id,user_id,role').eq('event_id',id).order('user_id');if(me)throw me;
  const ids=[...new Set(members.map(x=>x.user_id))];const names=new Map<string,string>();
  for(let i=0;i<ids.length;i+=100){const {data:p,error:pe}=await sb.from('profiles').select('id,display_name').in('id',ids.slice(i,i+100));if(pe)throw pe;for(const row of p)names.set(row.id,row.display_name);}
  return commissions.map(c=>({...c,members:members.filter(x=>x.commission_id===c.id).map(x=>({...x,name:names.get(x.user_id)||`Sin perfil · ${x.user_id.slice(0,8)}`}))}));
 },{cache:false});
 async function save(id:string){const target=chosen[id];if(!a?.coordinator||!target||busy)return;setBusy(id);setStatus('');setError('');try{const {data,error}=await sb.from('commission_members').update({role:'lead'}).eq('event_id',a.eventId).eq('commission_id',id).eq('user_id',target).select('user_id');if(error)throw error;if(data.length!==1)throw Error('El miembro ya no pertenece a esta comisión.');d.refresh();setChosen(x=>({...x,[id]:''}));setStatus('Responsable actualizado.');}catch(e){setError(msg(e));}finally{setBusy(undefined);}}
 return <main className="page stack"><Heading title="Directorio de comisiones">{a?.coordinator?'Coordinación puede cambiar el responsable de cada comisión.':'Solo aparecen tus comisiones autorizadas.'}</Heading><div className="row"><button className="btn btn-secondary" onClick={d.refresh}>Actualizar</button>{d.value&&<span>{d.value.length} comisiones visibles</span>}</div>{(error||d.error)&&<p role="alert">{error||d.error}</p>}{status&&<p role="status">{status}</p>}<div className="grid-cards">{d.value?.map(c=><Card key={c.id}><h2>{c.name}</h2><p>{c.description}</p><p>Responsable: {c.members.filter(m=>m.role==='lead').map(m=>m.name).join(', ')||'Sin asignar'}</p><h3>Miembros</h3>{c.members.length?<ul>{c.members.map(m=><li key={m.user_id}>{m.name}{m.role==='lead'?' · Responsable':''}</li>)}</ul>:<p>No hay miembros asignados.</p>}{a?.coordinator&&c.members.length>0&&<form className="stack mt-4" onSubmit={e=>{e.preventDefault();void save(c.id);}}><label>Nuevo responsable<select required value={chosen[c.id]??''} onChange={e=>setChosen(x=>({...x,[c.id]:e.target.value}))}><option value="">Selecciona un miembro</option>{c.members.map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}</select></label><button className="btn btn-staff" disabled={!!busy||!chosen[c.id]}>Guardar responsable</button></form>}</Card>)}</div></main>;
}
