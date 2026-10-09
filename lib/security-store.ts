import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
type State={limits:Record<string,{count:number;expires:number}>;sessions:Record<string,number>};
const file=path.join(process.cwd(),'.data','security.json');
const configured=Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY);
const db=()=>createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});
let queue=Promise.resolve();
async function local<T>(fn:(state:State)=>T):Promise<T>{let result:T;const task=queue.then(async()=>{let state:State;try{state=JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;state={limits:{},sessions:{}};}const now=Date.now();for(const [k,v] of Object.entries(state.limits))if(v.expires<now)delete state.limits[k];for(const [k,v] of Object.entries(state.sessions))if(v<now)delete state.sessions[k];result=fn(state);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file+'.tmp',JSON.stringify(state),{mode:0o600});await fs.rename(file+'.tmp',file);});queue=task.catch(()=>{});await task;return result!;}
export const digest=(s:string)=>createHash('sha256').update(s).digest('hex');
export async function consumeLimit(key:string,max:number,windowMs:number){const id=digest(key);if(configured){const {data,error}=await db().rpc('rjm_rate_limit',{bucket:id,max_count:max,window_seconds:Math.ceil(windowMs/1000)});if(error)throw error;return data===true;}if(process.env.NODE_ENV==='production'&&process.env.ALLOW_LOCAL_STORAGE!=='true')throw new Error('Durable Supabase storage is required');return local(state=>{const existing=state.limits[id];if(existing&&existing.expires>Date.now()){if(existing.count>=max)return false;existing.count++;return true;}state.limits[id]={count:1,expires:Date.now()+windowMs};return true;});}
export async function session(action:'create'|'check'|'delete',token:string,expires=0){const id=digest(token);if(configured){if(action==='check'){const {data,error}=await db().from('admin_sessions').select('expires_at').eq('id',id).maybeSingle();if(error)throw error;return !!data&&new Date(data.expires_at).getTime()>Date.now();}const {error}=await(action==='delete'?db().from('admin_sessions').delete().eq('id',id):db().from('admin_sessions').insert({id,expires_at:new Date(expires).toISOString()}));if(error)throw error;return true;}return local(state=>{if(action==='create')state.sessions[id]=expires;if(action==='delete')delete state.sessions[id];return action==='check'?Boolean(state.sessions[id]&&state.sessions[id]>Date.now()):true;});}
