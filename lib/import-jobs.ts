import 'server-only';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {getJobs,saveJobs} from './store';
import {planImport,RemoteListing} from './remotive';
const cachePath=path.join(process.cwd(),'.data','remotive-feed.json');
type Feed={jobs:RemoteListing[]};
let running:Promise<ReturnType<typeof planImport>['summary']&{cached:boolean;fetchedAt:string}>|null=null;
async function loadFeed(){
 if(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY){
  const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
  const {data:cached,error}=await db.from('api_cache').select('payload,fetched_at').eq('id','remotive').maybeSingle();if(error)throw error;
  if(cached?.payload&&Date.now()-new Date(cached.fetched_at).getTime()<6*60*60*1000)return {feed:cached.payload as Feed,cached:true,fetchedAt:cached.fetched_at};
  const lease=await db.rpc('rjm_claim_feed');if(lease.error)throw lease.error;if(!lease.data)throw new Error('Another import is refreshing the feed. Try again shortly.');
  try{const response=await fetch('https://remotive.com/api/remote-jobs',{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('API unavailable');const feed=await response.json();if(!Array.isArray(feed.jobs)||!feed.jobs.length||!feed.jobs.every((j:RemoteListing)=>Number.isSafeInteger(j.id)))throw new Error('Invalid feed');const fetchedAt=new Date().toISOString();const saved=await db.from('api_cache').update({payload:feed,fetched_at:fetchedAt,locked_until:null}).eq('id','remotive');if(saved.error)throw saved.error;return {feed:feed as Feed,cached:false,fetchedAt};}catch(error){await db.from('api_cache').update({locked_until:null}).eq('id','remotive');throw error;}
 }

 try{const stat=await fs.stat(cachePath);if(Date.now()-stat.mtimeMs<6*60*60*1000){const feed=JSON.parse((await fs.readFile(cachePath,'utf8')).replace(/^\uFEFF/,''));if(Array.isArray(feed.jobs))return {feed:feed as Feed,cached:true,fetchedAt:stat.mtime.toISOString()};}}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT'&&!(e instanceof SyntaxError))throw e;}
 const response=await fetch('https://remotive.com/api/remote-jobs',{cache:'no-store',signal:AbortSignal.timeout(30000)});if(!response.ok)throw new Error('Remotive API is unavailable. Try again later.');
 const feed=await response.json();if(!Array.isArray(feed.jobs)||!feed.jobs.length||!feed.jobs.every((j:RemoteListing)=>Number.isSafeInteger(j.id)))throw new Error('Unexpected or empty Remotive response; existing listings were preserved.');
 await fs.mkdir(path.dirname(cachePath),{recursive:true});await fs.writeFile(cachePath,JSON.stringify(feed));return {feed:feed as Feed,cached:false,fetchedAt:new Date().toISOString()};
}
export async function importJobs(){if(running)return running;running=(async()=>{const {feed,cached,fetchedAt}=await loadFeed();const plan=planImport(feed.jobs,await getJobs());await saveJobs(plan.changes);return {...plan.summary,cached,fetchedAt};})();try{return await running;}finally{running=null;}}
