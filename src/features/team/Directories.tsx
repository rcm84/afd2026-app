import {useEffect,useState,type FormEvent} from 'react';
import {Card,Heading} from '../../shared/ui';
import {msg,sb} from '../../lib/supabase/client';
import type {Database} from '../../lib/supabase/database.types';
import {useData} from '../../lib/supabase/data';
import {useTeamAccess} from './access';
type Tables=Database['public']['Tables'];
type Kind='lodging'|'food'|'transport';
type Entry={id:string;version:number;published:boolean;values:Record<string,string>;title:string};
type Field={key:string;label:string;required?:boolean;type?:'number';step?:string;options?:readonly (readonly [string,string])[]};
const yes=(key:string,label:string):Field=>({key,label,required:true});
const specs:Record<Kind,{title:string;fields:Field[]}>= {
 lodging:{title:'Hospedaje',fields:[yes('name','Nombre'),{...yes('kind','Tipo'),options:[['hotel','Hotel'],['hostal','Hostal'],['church','Iglesia'],['house','Casa'],['other','Otro']]},{...yes('price_amount','Precio'),type:'number',step:'0.01'},{...yes('currency','Moneda'),options:[['CUP','CUP'],['USD','USD'],['EUR','EUR']]},{...yes('price_unit','Unidad del precio'),options:[['person_night','Persona / noche'],['room_night','Habitación / noche'],['stay','Estancia']]},yes('public_contact','Contacto público'),yes('address','Dirección'),{key:'distance_m',label:'Distancia (m)',type:'number'},{...yes('capacity_total','Cupos totales'),type:'number'},{...yes('capacity_available','Cupos disponibles'),type:'number'}]},
 food:{title:'Puestos de comida',fields:[yes('name','Nombre'),yes('public_responsible_name','Responsable'),yes('location_text','Lugar'),yes('hours_text','Horario')]},
 transport:{title:'Transporte',fields:[yes('origin','Origen'),yes('destination','Destino'),yes('schedule_text','Horario'),yes('public_contact','Contacto público')]},
};
function asEntry<T extends {id:string;version:number;is_published:boolean}>(row:T,kind:Kind,title:string):Entry{
 const raw:Record<string,unknown>=Object.fromEntries(Object.entries(row));return {id:row.id,version:row.version,published:row.is_published,title,values:Object.fromEntries(specs[kind].fields.map(f=>[f.key,String(raw[f.key]??'')]))};
}
async function list(kind:Kind,event:string,c:string){
 if(kind==='lodging'){const {data,error}=await sb.from('lodgings').select('*').eq('event_id',event).eq('commission_id',c).order('name');if(error)throw error;return data.map(x=>asEntry(x,kind,x.name));}
 if(kind==='food'){const {data,error}=await sb.from('food_stalls').select('*').eq('event_id',event).eq('commission_id',c).order('name');if(error)throw error;return data.map(x=>asEntry(x,kind,x.name));}
 const {data,error}=await sb.from('transport_routes').select('*').eq('event_id',event).eq('commission_id',c).order('origin').order('destination');if(error)throw error;return data.map(x=>asEntry(x,kind,`${x.origin} → ${x.destination}`));
}
const required=(v:Record<string,string>,key:string)=>{const s=v[key]?.trim();if(!s)throw Error('Completa los campos obligatorios.');return s;};
function number(v:Record<string,string>,key:string,int=false){const n=Number(required(v,key));if(!Number.isFinite(n)||n<0||(int&&(!Number.isSafeInteger(n)||n>2147483647)))throw Error('Revisa importes, distancias y cupos.');return n;}
function check(r:{error:unknown;data:unknown},empty='El registro cambió o ya no tienes acceso. Actualiza la lista.'){if(r.error)throw r.error;if(!Array.isArray(r.data)||r.data.length!==1)throw Error(empty);}
async function persist(kind:Kind,event_id:string,commission_id:string,v:Record<string,string>,is_published:boolean,editing?:Entry){
 if(kind==='lodging'){
  const capacity_total=number(v,'capacity_total',true),capacity_available=number(v,'capacity_available',true);if(capacity_available>capacity_total)throw Error('Los cupos disponibles no pueden superar el total.');
  const x={name:required(v,'name'),kind:required(v,'kind'),price_amount:number(v,'price_amount'),currency:required(v,'currency'),price_unit:required(v,'price_unit'),public_contact:required(v,'public_contact'),address:required(v,'address'),distance_m:v.distance_m?.trim()?number(v,'distance_m',true):null,capacity_total,capacity_available,is_published,availability_as_of:new Date().toISOString()} satisfies Tables['lodgings']['Update'];
  check(editing?await sb.from('lodgings').update(x).eq('event_id',event_id).eq('commission_id',commission_id).eq('id',editing.id).eq('version',editing.version).select('id'):await sb.from('lodgings').insert({...x,event_id,commission_id}).select('id'));return;
 }
 if(kind==='food'){
  const x={name:required(v,'name'),public_responsible_name:required(v,'public_responsible_name'),location_text:required(v,'location_text'),hours_text:required(v,'hours_text'),is_published} satisfies Tables['food_stalls']['Update'];
  check(editing?await sb.from('food_stalls').update(x).eq('event_id',event_id).eq('commission_id',commission_id).eq('id',editing.id).eq('version',editing.version).select('id'):await sb.from('food_stalls').insert({...x,event_id,commission_id,public_contact:''}).select('id'));return;
 }
 const origin=required(v,'origin'),destination=required(v,'destination');
 const x={origin,destination,title:`${origin} → ${destination}`,schedule_text:required(v,'schedule_text'),public_contact:required(v,'public_contact'),is_published} satisfies Tables['transport_routes']['Update'];
 check(editing?await sb.from('transport_routes').update(x).eq('event_id',event_id).eq('commission_id',commission_id).eq('id',editing.id).eq('version',editing.version).select('id'):await sb.from('transport_routes').insert({...x,event_id,commission_id}).select('id'));
}
async function remove(kind:Kind,event:string,c:string,entry:Entry){
 const t=kind==='lodging'?'lodgings':kind==='food'?'food_stalls':'transport_routes';
 const result=await sb.from(t).delete().eq('event_id',event).eq('commission_id',c).eq('id',entry.id).eq('version',entry.version).select('id');
 if(result.error?.code==='23503')throw Error('El registro tiene datos relacionados y no puede eliminarse. Edítalo y desmarca «Publicar» para retirarlo del directorio.');
 if(result.error?.code==='42501')throw Error('El servidor no permite eliminar este registro. Comprueba el permiso de la cuenta y la migración 003.');
 check(result);
}
export function DirectoryPanel({kind}:{kind:Kind}){
 const {value:access,error:accessError}=useTeamAccess();const spec=specs[kind];const [picked,setPicked]=useState('');
 const groups=access?.commissions.filter(c=>c.scope===kind)??[];const c=groups.some(x=>x.id===picked)?picked:groups[0]?.id;
 const data=useData(access&&c?`directory:${kind}:${access.userId}:${c}`:null,()=>list(kind,access!.eventId,c!),{cache:false});
 const [editing,setEditing]=useState<Entry>();const [values,setValues]=useState<Record<string,string>>({});const [published,setPublished]=useState(false);const [deleting,setDeleting]=useState<Entry>();const [busy,setBusy]=useState(false);const [status,setStatus]=useState('');const [error,setError]=useState('');
 function reset(){setEditing(undefined);setValues({});setPublished(false);setDeleting(undefined);}
 useEffect(()=>{reset();setError('');setStatus('');},[c,kind]);
 async function save(e:FormEvent){e.preventDefault();if(!access||!c||busy)return;setBusy(true);setError('');setStatus('');try{await persist(kind,access.eventId,c,values,published,editing);reset();data.refresh();setStatus('Registro guardado.');}catch(x){setError(msg(x));}finally{setBusy(false);}}
 async function confirm(){if(!deleting||!c||!access||busy)return;setBusy(true);setError('');setStatus('');try{await remove(kind,access.eventId,c,deleting);reset();data.refresh();setStatus('Registro eliminado.');}catch(x){setError(msg(x));}finally{setBusy(false);}}
 return <main className="page stack"><Heading title={spec.title}/>{(error||data.error||accessError)&&<p role="alert">{error||data.error||accessError}</p>}{status&&<p role="status">{status}</p>}{!c&&access&&<p>No tienes una comisión autorizada para este panel.</p>}{c&&<><label>Comisión<select disabled={busy} value={c} onChange={e=>setPicked(e.target.value)}>{groups.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label><Card><h2>{editing?'Editar registro':'Crear registro'}</h2><form className="stack" onSubmit={save}><fieldset disabled={busy} className="field-grid">{spec.fields.map(f=><label key={f.key}>{f.label}{f.options?<select required={f.required} value={values[f.key]??''} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}><option value="">Selecciona…</option>{f.options.map(([k,name])=><option key={k} value={k}>{name}</option>)}</select>:<input required={f.required} type={f.type??'text'} min={f.type==='number'?0:undefined} step={f.step??(f.type==='number'?1:undefined)} value={values[f.key]??''} onChange={e=>setValues(v=>({...v,[f.key]:e.target.value}))}/>}</label>)}</fieldset><label className="check-label"><input type="checkbox" checked={published} disabled={busy} onChange={e=>setPublished(e.target.checked)}/>Publicar en el directorio</label><div className="row"><button className="btn btn-staff" disabled={busy}>Guardar</button>{editing&&<button type="button" className="btn btn-secondary" disabled={busy} onClick={reset}>Cancelar edición</button>}</div></form></Card><div className="row between"><h2>Registros</h2><button className="btn btn-secondary" disabled={busy} onClick={data.refresh}>Actualizar</button></div>{!data.error&&!data.value&&<p>Cargando…</p>}{data.value?.length===0&&<p>No hay registros.</p>}<div className="grid-cards">{data.value?.map(x=><Card key={x.id}><h3>{x.title}</h3><p>{x.published?'Publicado':'No publicado'}</p><dl className="info-list">{spec.fields.map(f=><div key={f.key}><dt>{f.label}</dt><dd>{f.options?.find(([k])=>k===x.values[f.key])?.[1]??(x.values[f.key]||'—')}</dd></div>)}</dl><div className="row"><button className="btn btn-staff" disabled={busy} onClick={()=>{setEditing(x);setValues({...x.values});setPublished(x.published);setDeleting(undefined);setError('');}}>Editar</button><button className="btn btn-secondary" disabled={busy} onClick={()=>setDeleting(x)}>Eliminar</button></div>{deleting?.id===x.id&&<div className="notice mt-4"><p>¿Eliminar definitivamente «{x.title}»?</p><div className="row"><button className="btn btn-staff" disabled={busy} onClick={()=>void confirm()}>Confirmar eliminación</button><button className="btn btn-secondary" disabled={busy} onClick={()=>setDeleting(undefined)}>Cancelar</button></div></div>}</Card>)}</div></>}</main>;
}
