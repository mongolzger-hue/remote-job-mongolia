import {memberUser,memberDb} from '@/lib/member';
import {getJobs} from '@/lib/store';
import {publicJobs} from '@/lib/jobs';
import {applicationStatuses} from '@/lib/member-policy';
import {body,sameOrigin,HttpError,errorResponse} from '@/lib/http';
import {consumeLimit} from '@/lib/security-store';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});try{const user=await memberUser();if(!user)throw new HttpError(401,'Sign in required');if(!await consumeLimit('member-saved:'+user.id,60,60000))throw new HttpError(429,'Try again later');const data=await body(request);if(typeof data.jobId!=='string'||!publicJobs(await getJobs()).some(j=>j.id===data.jobId))throw new HttpError(404,'Job unavailable');const db=memberDb();const result=data.status==='remove'?await db.from('member_saved_jobs').delete().eq('user_id',user.id).eq('job_id',data.jobId):applicationStatuses.includes(data.status as typeof applicationStatuses[number])?await db.from('member_saved_jobs').upsert({user_id:user.id,job_id:data.jobId,status:data.status,updated_at:new Date().toISOString()}):null;if(!result)throw new HttpError(400,'Invalid application status');if(result.error)throw new HttpError(503,'Unable to save');return Response.json({ok:true});}catch(e){return errorResponse(e);}}
