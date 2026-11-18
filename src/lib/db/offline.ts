import Dexie,{type Table} from 'dexie';
export type Person={id:string;name:string;registration_number:number;token:string;type:string;status:'active'|'cancelled';wristband_label:string;wristband_color:string;checked_in_at:string|null};
export type Outcome='accepted'|'duplicate'|'unknown'|'cancelled';
export type Scope={key:string;event:string;owner:string;device:string};
export type Manifest=Scope & {snapshot_at:string;participants:Person[]};
export type Op={id:string;scope:string;event:string;owner:string;device:string;token:string;person:string;scanned:string;state:'pending'|'ack'|'review';outcome?:Outcome;attempts:number;next:number;error?:string};
export type Cache={key:string;value:unknown;at:string};
class AfdDB extends Dexie{
 manifests!:Table<Manifest,string>; ops!:Table<Op,string>; cache!:Table<Cache,string>; scopes!:Table<Scope,string>;
 constructor(){super('afd-real-v1');this.version(1).stores({manifests:'key,owner',ops:'id,scope,&[scope+token],[scope+state]',cache:'key',scopes:'key,owner'});}
}
export const db=new AfdDB();
const OWNER='afd-local-owner-v1'; const SCOPE='afd-selected-scope-v1';
export const owner=()=>localStorage.getItem(OWNER);
export const scopeKey=()=>localStorage.getItem(SCOPE);
export function rememberOwner(id:string){if(owner()!==id)localStorage.removeItem(SCOPE);localStorage.setItem(OWNER,id);}
export function selectScope(id:string){localStorage.setItem(SCOPE,id);}
export async function clearPrivate(id:string){
 await db.transaction('rw',db.manifests,db.ops,db.scopes,db.cache,async()=>{
  const scopes=await db.scopes.where('owner').equals(id).primaryKeys();
  for(const key of scopes){if(await db.ops.where('[scope+state]').anyOf([[key,'pending'],[key,'review']]).count())throw Error('Hay entradas pendientes o en revisión. Resuélvelas antes de cerrar sesión.');await db.ops.where('scope').equals(key).delete();}
  await db.manifests.where('owner').equals(id).delete();await db.scopes.where('owner').equals(id).delete();
  await db.cache.filter(x=>x.key.startsWith(`private:${id}:`)).delete();
 });
 localStorage.removeItem(OWNER);localStorage.removeItem(SCOPE);
}
export async function store(key:string,value:unknown){await db.cache.put({key,value,at:new Date().toISOString()});}
