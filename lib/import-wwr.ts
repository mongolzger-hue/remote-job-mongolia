import 'server-only';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {getJobs,saveJobs} from './store';
import {planWwr} from './wwr';
let running:Promise<ReturnType<typeof planWwr>['summary']&{cached:boolean}>|null=null;
export async function importWwr(){if(running)return running;running=(async()=>{
 const cachePath=path.join(process.cwd(),'.data','wwr-feed.xml'),db=process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}):null;
 let xml='',cached=false;
 if(db){const result=await db.from('api_cache').select('payload,fetched_at').eq('id','wwr').maybeSingle();if(result.error)throw result.error;if(typeof result.data?.payload==='string'&&Date.now()-new Date(result.data.fetched_at).getTime()<21600000){xml=result.data.payload;cached=true;}else{const lease=await db.rpc('rjm_claim_named_feed',{feed_id:'wwr'});if(lease.error)throw lease.error;if(!lease.data)throw new Error('Feed refresh already running');}}
 else{try{const stat=await fs.stat(cachePath);if(Date.now()-stat.mtimeMs<21600000){xml=await fs.readFile(cachePath,'utf8');cached=true;}}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT')throw error;}}
 try{if(!xml){const response=await fetch('https://weworkremotely.com/remote-jobs.rss',{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('WWR feed unavailable');xml=await response.text();planWwr(xml,[]);if(db){const saved=await db.from('api_cache').update({payload:xml,fetched_at:new Date().toISOString(),locked_until:null}).eq('id','wwr');if(saved.error)throw saved.error;}else{await fs.mkdir(path.dirname(cachePath),{recursive:true});await fs.writeFile(cachePath,xml);}}
 const plan=planWwr(xml,await getJobs());await saveJobs(plan.changes);return {...plan.summary,cached};}catch(error){if(db&&!cached)await db.from('api_cache').update({locked_until:null}).eq('id','wwr');throw error;}
 })();try{return await running;}finally{running=null;}}
