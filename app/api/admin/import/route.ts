import {invalidatePublicJobs} from '@/lib/public-job-store';
import {isAdmin} from '@/lib/auth';
import {sameOrigin} from '@/lib/http';
import {importJobs} from '@/lib/import-jobs';
import {importWwr} from '@/lib/import-wwr';
import {importAdditional} from '@/lib/import-additional';
export const maxDuration=60;
import {consumeLimit} from '@/lib/security-store';
export const runtime='nodejs';
export async function POST(request:Request){if(!sameOrigin(request)||!await isAdmin())return Response.json({error:'Forbidden'},{status:403});try{if(!await consumeLimit('admin-import',6,60000))return Response.json({error:'Too many imports'},{status:429});const source=new URL(request.url).searchParams.get('source');if(source&&['himalayas','jobicy','remoteok'].includes(source)){const result=await importAdditional(source as 'himalayas'|'jobicy'|'remoteok');invalidatePublicJobs();return Response.json(result);}if(source&&!['wwr','remotive'].includes(source))return Response.json({error:'Unknown source'},{status:400});const result=source==='wwr'?await importWwr():await importJobs();invalidatePublicJobs();return Response.json(result);}catch(error){console.error('Job import failed',error);return Response.json({error:'Unable to import jobs. Check the API connection and database schema, then try again.'},{status:502});}}


