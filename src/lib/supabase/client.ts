import {createClient} from '@supabase/supabase-js';
import type {Database} from './database.types';
const url=import.meta.env.VITE_SUPABASE_URL?.trim();
const key=import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
if(!url||!key) throw new Error('Configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en .env.local');
const legacyRole=(()=>{try{return JSON.parse(atob((key.split('.')[1]??'').replace(/-/g,'+').replace(/_/g,'/'))).role as unknown;}catch{return undefined;}})();
if(key.startsWith('sb_secret_')||legacyRole==='service_role') throw new Error('El frontend solo acepta la clave pública');
export const sb=createClient<Database>(url,key,{auth:{persistSession:true,autoRefreshToken:true}});
export const slug='afd-2026';
export async function event(){const {data,error}=await sb.from('events').select('*').eq('slug',slug).single();if(error)throw error;return data;}
export function msg(e:unknown){return typeof e==='object'&&e!==null&&'message' in e?String(e.message):String(e);}
export function cubaWhatsApp(raw:string){const s=raw.trim().replace(/[\s().-]/g,'');const m=s.match(/^(?:(?:\+|00)?53)?(\d{8})$/);if(!m)throw Error('Escribe ocho dígitos cubanos, con o sin +53.');return '+53'+m[1];}
