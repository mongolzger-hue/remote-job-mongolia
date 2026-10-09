import 'server-only';
import {cache} from 'react';
import {revalidateTag} from 'next/cache';
import {configured,getJobs} from './store';
import {publicJobs,type Job} from './jobs';

const tag='public-jobs-v1';
// Only approved job content enters this cache. Accounts, entitlements and admin reads stay fresh.
async function batch(offset:number,id?:string){
 const url=new URL('/rest/v1/jobs',process.env.SUPABASE_URL!);
 url.search=new URLSearchParams({select:'*',status:'eq.approved',order:'createdAt.desc',limit:id?'1':'100',offset:String(offset),...(id?{id:'eq.'+id}:{})}).toString();
 const response=await fetch(url,{headers:{apikey:process.env.SUPABASE_SERVICE_ROLE_KEY!,Authorization:'Bearer '+process.env.SUPABASE_SERVICE_ROLE_KEY!,Prefer:'count=exact'},cache:'force-cache',next:{revalidate:60,tags:[tag]}});
 if(!response.ok)throw new Error('Public job lookup unavailable');
 return {jobs:await response.json() as Job[],count:Number(response.headers.get('content-range')?.split('/')[1]||0)};
}
export const getPublicJobs=cache(async():Promise<Job[]>=>{
 if(!configured)return publicJobs(await getJobs());
 // Bounded batches keep each cached response below Next.js' per-entry size limit.
 const first=await batch(0),remaining=await Promise.all(Array.from({length:Math.max(0,Math.ceil(first.count/100)-1)},(_,i)=>batch((i+1)*100)));
 return publicJobs([...first.jobs,...remaining.flatMap(page=>page.jobs)]);
});
export const getPublicJob=cache(async(id:string):Promise<Job|undefined>=>{
 if(!configured)return publicJobs(await getJobs()).find(job=>job.id===id);
 const job=publicJobs((await batch(0,id)).jobs)[0];
 return job?.applicationUrl==='https://example.com'?(await getPublicJobs()).find(item=>item.id===id):job;
});
export function invalidatePublicJobs(){revalidateTag(tag,{expire:0});}
