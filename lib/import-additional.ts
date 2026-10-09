import 'server-only';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {createClient} from '@supabase/supabase-js';
import {getJobs,saveJobs} from './store';
import {AdditionalSource,planAdditional} from './additional-sources';
type Feed={jobs:Record<string,unknown>[];pages:number;bounded:boolean};
const running=new Map<string,Promise<ReturnType<typeof planAdditional>['summary']&{cached:boolean;pages:number;bounded:boolean}>>();
async function request(url:URL){const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error(`Source HTTP ${r.status}`);return r.json();}
async function fetchFeed(source:AdditionalSource):Promise<Feed>{
 const jobs:Record<string,unknown>[]=[],seen=new Set<string>();let cursor:string|undefined,pages=0,bounded=false;
 const maxPages=source==='himalayas'?20:source==='jobicy'?5:1;
 for(let page=1;page<=maxPages;page++){
 const url=new URL(source==='himalayas'?'https://himalayas.app/jobs/api/search':source==='jobicy'?'https://jobicy.com/api/v2/remote-jobs':'https://remoteok.com/api');
 if(source==='himalayas'){url.searchParams.set('worldwide','true');url.searchParams.set('page',String(page));}
 if(source==='jobicy'){url.searchParams.set('geo','anywhere');url.searchParams.set('count','200');if(cursor)url.searchParams.set('cursor',cursor);}
 const data=await request(url),items=source==='remoteok'?(Array.isArray(data)?data.slice(1):null):data.jobs;
 if(!Array.isArray(items)||(!items.length&&page===1))throw new Error('Empty or malformed feed; existing jobs preserved');
 pages++;let added=0;for(const item of items){if(!item||typeof item!=='object')throw new Error('Malformed job');const identity=String(item.guid||item.url||item.id);if(!seen.has(identity)){seen.add(identity);jobs.push(item);added++;}}
 if(source==='remoteok'||!items.length||!added)break;
 if(source==='jobicy'){if(!data.hasMore)break;if(typeof data.nextCursor!=='string'||data.nextCursor===cursor)throw new Error('Invalid cursor');cursor=data.nextCursor;}
 if(source==='himalayas'&&jobs.length>=Number(data.totalCount))break;
 if(page===maxPages)bounded=true;
 }
 return {jobs,pages,bounded};
}
export async function importAdditional(source:AdditionalSource){const active=running.get(source);if(active)return active;
 const task=(async()=>{const ttl=source==='himalayas'?86400000:21600000,cachePath=path.join(process.cwd(),'.data',`${source}-import-feed.json`),db=process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY?createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}}):null;
 let feed:Feed|undefined,cached=false;
 if(db){const result=await db.from('api_cache').select('payload,fetched_at').eq('id',source).maybeSingle();if(result.error)throw result.error;if(result.data?.payload&&Date.now()-new Date(result.data.fetched_at).getTime()<ttl){feed=result.data.payload as Feed;cached=true;}else{const lease=await db.rpc('rjm_claim_named_feed',{feed_id:source});if(lease.error)throw lease.error;if(!lease.data)throw new Error('Feed refresh already running');}}
 else{try{const stat=await fs.stat(cachePath);if(Date.now()-stat.mtimeMs<ttl){feed=JSON.parse(await fs.readFile(cachePath,'utf8'));cached=true;}}catch(error){if((error as NodeJS.ErrnoException).code!=='ENOENT'&&!(error instanceof SyntaxError))throw error;}}
 try{if(!feed){feed=await fetchFeed(source);if(db){const result=await db.from('api_cache').update({payload:feed,fetched_at:new Date().toISOString(),locked_until:null}).eq('id',source);if(result.error)throw result.error;}else{await fs.mkdir(path.dirname(cachePath),{recursive:true});await fs.writeFile(cachePath,JSON.stringify(feed));}}
 if(!Array.isArray(feed.jobs))throw new Error('Invalid cache');const plan=planAdditional(source,feed.jobs,await getJobs());await saveJobs(plan.changes);return {...plan.summary,cached,pages:feed.pages,bounded:feed.bounded};
 }catch(error){if(db&&!cached)await db.from('api_cache').update({locked_until:null}).eq('id',source);throw error;}
 })();running.set(source,task);try{return await task;}finally{running.delete(source);}}
