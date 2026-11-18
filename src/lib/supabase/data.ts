import {useEffect,useRef,useState} from 'react';
import {db,store} from '../db/offline';
import {msg,sb} from './client';
export function useData<T>(key:string|null,load:()=>Promise<T>,options:{cache?:boolean;live?:boolean}={}){
 const loadRef=useRef(load);loadRef.current=load;const [data,setData]=useState<{key:string;value:T;at:string}>();const [error,setError]=useState('');const [count,setCount]=useState(0);
 const cache=options.cache!==false;const live=!!options.live;
 useEffect(()=>{if(!key)return;let active=true,busy=false;setError('');const refresh=async()=>{if(busy)return;busy=true;try{if(!navigator.onLine)throw Error('Sin conexión');const value=await loadRef.current();const at=new Date().toISOString();if(key.startsWith('private:')){const {data:s}=await sb.auth.getSession();if(!s.session||!key.startsWith(`private:${s.session.user.id}:`))return;}if(active){if(cache)await store(key,value);if(active){setData({key,value,at});setError('');}}}catch(e){if(active)setError(msg(e));}finally{busy=false;}};
 void (async()=>{try{if(cache){const hit=await db.cache.get(key);if(active&&hit)setData({key,value:hit.value as T,at:hit.at});}}catch(e){if(active)setError(msg(e));}if(active)void refresh();})();
 const focus=()=>{if(document.visibilityState==='visible')void refresh();};window.addEventListener('online',focus);window.addEventListener('focus',focus);document.addEventListener('visibilitychange',focus);
 const timer=live?window.setInterval(focus,120000):undefined;
 const channel=live?sb.channel(`afd-public-${key}-${crypto.randomUUID()}`).on('postgres_changes',{event:'UPDATE',schema:'public',table:'events',filter:'slug=eq.afd-2026'},focus).subscribe():undefined;
 return()=>{active=false;window.removeEventListener('online',focus);window.removeEventListener('focus',focus);document.removeEventListener('visibilitychange',focus);if(timer!==undefined)clearInterval(timer);if(channel)void sb.removeChannel(channel);};},[key,cache,live,count]);
 return {value:data?.key===key?data?.value:undefined,at:data?.key===key?data?.at:undefined,error,refresh:()=>setCount(x=>x+1)};
}
export function useAuthId(){const [id,setId]=useState<string|null>(null);useEffect(()=>{let active=true;void sb.auth.getSession().then(({data})=>{if(active)setId(data.session?.user.id??null);});const {data}=sb.auth.onAuthStateChange((_e,s)=>setId(s?.user.id??null));return()=>{active=false;data.subscription.unsubscribe();};},[]);return id;}
