import {randomUUID} from 'node:crypto';
import {saveJob} from '@/lib/store';
import {validateJob} from '@/lib/jobs';
import {consumeLimit} from '@/lib/security-store';
import {body,sameOrigin,HttpError,errorResponse} from '@/lib/http';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});let fields;try{if(!await consumeLimit('job-submissions',5,60000))return Response.json({error:'Too many submissions'},{status:429,headers:{'Retry-After':'60'}});const data=await body(request);if(data.website||typeof data.startedAt!=='number'||Date.now()-data.startedAt<3000||Date.now()-data.startedAt>86400000)throw new HttpError(400,'Please complete the form and try again');fields=validateJob(data);}catch(e){if(e instanceof HttpError)return errorResponse(e);return Response.json({error:'Invalid job fields or storage unavailable'},{status:400});}try{const job={...fields,id:randomUUID(),status:'pending' as const,featured:false,createdAt:new Date().toISOString()};await saveJob(job);return Response.json({id:job.id},{status:201});}catch{return Response.json({error:'Unable to save job'},{status:500});}}
