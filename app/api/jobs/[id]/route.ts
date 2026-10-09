import {invalidatePublicJobs} from '@/lib/public-job-store';
import {isAdmin} from '@/lib/auth';
import {getJobs,saveJob} from '@/lib/store';
import {validateJob} from '@/lib/jobs';
import {body,sameOrigin} from '@/lib/http';
async function mutate(request:Request,context:{params:Promise<{id:string}>},remove:boolean){if(!sameOrigin(request)||!await isAdmin())return Response.json({error:'Forbidden'},{status:403});try{const {id}=await context.params,job=(await getJobs()).find(j=>j.id===id);if(!job)return Response.json({error:'Not found'},{status:404});if(remove){await saveJob(job,true);}else{const data=await body(request);if(data.status==='approved'&&Object.keys(data).length===1)await saveJob({...job,status:'approved'});else await saveJob({...job,...validateJob(data),featured:data.featured==='on'||data.featured===true,membersOnly:!job.importInfo&&(data.membersOnly==='on'||data.membersOnly===true)});}invalidatePublicJobs();return Response.json({ok:true});}catch{return Response.json({error:'Unable to update job'},{status:400});}}
export const PATCH=(r:Request,c:{params:Promise<{id:string}>})=>mutate(r,c,false);
export const DELETE=(r:Request,c:{params:Promise<{id:string}>})=>mutate(r,c,true);
