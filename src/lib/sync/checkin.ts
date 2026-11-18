import {db,owner,rememberOwner,selectScope,scopeKey,type Manifest,type Op,type Outcome,type Person,type Scope} from '../db/offline';
import {event,msg,sb} from '../supabase/client';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const asRecord=(v:unknown)=>v && typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null;
export function qrToken(raw:string,eventId:string){const [tag,e,t,...extra]=raw.trim().split(':');return !extra.length&&tag==='AFD1'&&e?.toLowerCase()===eventId.toLowerCase()&&t&&uuid.test(t)?t.toLowerCase():null;}
export async function staffUser(){const {data,error}=await sb.auth.getUser();if(error)throw error;if(!data.user||data.user.is_anonymous)throw Error('Inicia sesión con tu cuenta de equipo.');return data.user;}
export async function devices(){const [ev,user]=await Promise.all([event(),staffUser()]);const {data,error}=await sb.from('checkin_devices').select('id,label').eq('event_id',ev.id).eq('user_id',user.id).eq('active',true);if(error)throw error;return {ev,user,devices:data??[]};}
function parseManifest(raw:unknown,scope:Scope):Manifest{
 const x=asRecord(raw);if(!x||x.event_id!==scope.event||typeof x.snapshot_at!=='string'||!Number.isFinite(Date.parse(x.snapshot_at))||!Array.isArray(x.participants))throw Error('Manifiesto inválido');
 const people:Person[]=x.participants.map((item:unknown)=>{const p=asRecord(item);if(!p||typeof p.id!=='string'||typeof p.name!=='string'||typeof p.registration_number!=='number'||typeof p.token!=='string'||!uuid.test(p.token)||typeof p.type!=='string'||(p.status!=='active'&&p.status!=='cancelled')||typeof p.wristband_label!=='string'||typeof p.wristband_color!=='string'||(p.checked_in_at!==null&&typeof p.checked_in_at!=='string'))throw Error('Fila inválida en el manifiesto');return {id:p.id,name:p.name,registration_number:p.registration_number,token:p.token.toLowerCase(),type:p.type,status:p.status,wristband_label:p.wristband_label,wristband_color:p.wristband_color,checked_in_at:p.checked_in_at};});
 return {...scope,snapshot_at:x.snapshot_at,participants:people};
}
export async function download(device:string){
 const d=await devices();if(!d.devices.some(x=>x.id===device))throw Error('Dispositivo no autorizado');
 const scope={event:d.ev.id,owner:d.user.id,device,key:`${d.ev.id}:${d.user.id}:${device}`};
 const old=scopeKey();if(old&&old!==scope.key&&await db.ops.where('[scope+state]').anyOf([[old,'pending'],[old,'review']]).count())throw Error('Sincroniza o resuelve las operaciones de la puerta anterior antes de cambiar de dispositivo.');
 const {data,error}=await sb.rpc('get_checkin_manifest',{p_event:scope.event});if(error)throw error;
 const downloaded=parseManifest(data,scope);
 await db.transaction('rw',db.manifests,db.scopes,async()=>{const last=await db.manifests.get(scope.key);if(!last||Date.parse(last.snapshot_at)<=Date.parse(downloaded.snapshot_at))await db.manifests.put(downloaded);await db.scopes.put(scope);});
 rememberOwner(scope.owner);selectScope(scope.key);
 return scope;
}
export type LocalResult={state:'pending'|'accepted'|'duplicate'|'unknown'|'cancelled'|'review';person?:Person;op?:string};
export async function record(scope:Scope,token:string|null):Promise<LocalResult>{
 if(owner()!==scope.owner)throw Error('La sesión local no corresponde al dispositivo.');
 if(!token)return {state:'unknown'};
 return db.transaction('rw',db.ops,db.manifests,async()=>{
  const manifest=await db.manifests.get(scope.key);if(!manifest)throw Error('Descarga el manifiesto antes de registrar entradas.');
  const person=manifest.participants.find(p=>p.token===token);if(!person)return {state:'unknown'};
  if(person.status==='cancelled')return {state:'cancelled',person};
  const old=await db.ops.where('[scope+token]').equals([scope.key,token]).first();
  if(old){if(old.state==='review')return {state:'review',person,op:old.id};if(old.outcome==='unknown'||old.outcome==='cancelled')return {state:old.outcome,person,op:old.id};return {state:'duplicate',person,op:old.id};}
  if(person.checked_in_at)return {state:'duplicate',person};
  const id=crypto.randomUUID();await db.ops.add({id,scope:scope.key,event:scope.event,owner:scope.owner,device:scope.device,token,person:person.id,scanned:new Date().toISOString(),state:'pending',attempts:0,next:0});
  return {state:'pending',person,op:id};
 });
}
const running=new Map<string,Promise<void>>();
export async function sync(scope:Scope,force=false){
 const active=running.get(scope.key);if(active)return active;
 const work=run(scope,force).finally(()=>running.delete(scope.key));running.set(scope.key,work);return work;
}
async function run(scope:Scope,force:boolean){
 if(!navigator.onLine||owner()!==scope.owner)return;
 const pending=await db.ops.where('[scope+state]').equals([scope.key,'pending']).toArray();
 const todo=pending.filter(p=>force||p.next<=Date.now()).sort((a,b)=>a.scanned.localeCompare(b.scanned));if(!todo.length)return;
 const user=await staffUser();if(user.id!==scope.owner)throw Error('Vuelve a entrar con la cuenta que registró las operaciones.');
 for(const op of todo){
  if(owner()!==scope.owner||!navigator.onLine)break;
  const retry=async(error:unknown)=>{const attempts=op.attempts+1;await db.transaction('rw',db.ops,async()=>{if((await db.ops.get(op.id))?.state==='pending')await db.ops.update(op.id,{attempts,error:msg(error),next:Date.now()+Math.min(60_000,1000*2**Math.min(attempts,6))+Math.floor(Math.random()*750)});});};
  try{
   const {data,error}=await sb.rpc('submit_checkin',{p_operation:op.id,p_event:op.event,p_device:op.device,p_token:op.token,p_scanned_at:op.scanned}).abortSignal(AbortSignal.timeout(12000));
   if(error){if(/^(FORBIDDEN|DEVICE_DISABLED|OPERATION_COLLISION)$/.test(error.message)){await db.transaction('rw',db.ops,async()=>{if((await db.ops.get(op.id))?.state==='pending')await db.ops.update(op.id,{state:'review',error:error.message});});continue;}throw error;}
   const ack=asRecord(data);const outcome=ack?.result;
   if(ack?.operation_id!==op.id||!['accepted','duplicate','unknown','cancelled'].includes(String(outcome)))throw Error('Acuse inválido; se conservará el mismo operation_id.');
   if((outcome==='accepted'||outcome==='duplicate'||outcome==='cancelled')&&ack.participant_id!==op.person)throw Error('El acuse identifica a otra persona; revisar padrón.');
   await db.ops.update(op.id,{state:'ack',outcome:outcome as Outcome,error:undefined});
  }catch(e){await retry(e);break;}
 }
}
export async function reopenReview(scope:Scope){
 const user=await staffUser();if(user.id!==scope.owner||owner()!==scope.owner)throw Error('Usa la cuenta original.');
 await db.ops.where('[scope+state]').equals([scope.key,'review']).modify({state:'pending',next:0});
 return sync(scope,true);
}
