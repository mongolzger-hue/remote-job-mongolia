import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Job, seedJobs } from './jobs';
export const configured=Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const db=()=>createClient(process.env.SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}});
const file=path.join(process.cwd(),'.data','jobs.json');
export async function getJobs():Promise<Job[]> {
 if(Boolean(process.env.SUPABASE_URL)!==Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY))throw new Error('Both Supabase variables must be configured');
 if(configured){const {data,error}=await db().from('jobs').select('*').order('createdAt',{ascending:false});if(error)throw error;return data as Job[];}
 try{return JSON.parse(await fs.readFile(file,'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code==='ENOENT')return structuredClone(seedJobs);throw e;}
}
let queue=Promise.resolve();
export async function saveJob(job:Job,remove=false) {
 if(configured){const {error}=await (remove?db().from('jobs').delete().eq('id',job.id):db().from('jobs').upsert(job));if(error)throw error;return;}
 const task=queue.then(async()=>{const jobs=await getJobs();const next=jobs.filter(j=>j.id!==job.id);if(!remove)next.unshift(job);await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file+'.tmp',JSON.stringify(next,null,2));await fs.rename(file+'.tmp',file);});queue=task.catch(()=>{});await task;
}
export async function saveJobs(incoming:Job[]){
 if(!incoming.length)return;
 if(configured){const {error}=await db().from('jobs').upsert(incoming);if(error)throw error;return;}
 const task=queue.then(async()=>{const jobs=await getJobs(),updates=new Map(incoming.map(j=>[j.id,j]));const next=[...incoming,...jobs.filter(j=>!updates.has(j.id))];await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file+'.tmp',JSON.stringify(next,null,2));await fs.rename(file+'.tmp',file);});queue=task.catch(()=>{});await task;
}
