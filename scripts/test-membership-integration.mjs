// Opt-in integration test: creates disposable users/orders, sends no email or money, cleans up in finally.
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
try{process.loadEnvFile('.env.local');}catch{}
if(process.env.RUN_MEMBERSHIP_INTEGRATION!=='true')throw new Error('Set RUN_MEMBERSHIP_INTEGRATION=true to allow disposable test users and orders.');
const base=process.env.MEMBER_TEST_URL||'http://localhost:3000';
const admin=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const publicClient=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});
const tables=['memberships','membership_orders','membership_settings','member_saved_jobs'];
const ids=[];let cookie='';
async function post(path,data,session=cookie,origin=base){return fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',origin,...(session?{cookie:session}:{})},body:JSON.stringify(data),redirect:'manual'});}
async function order(userId){const {data,error}=await admin.from('membership_orders').insert({user_id:userId,amount:10000,duration_days:30,payment_reference:'TEST-'+randomUUID().toUpperCase()}).select('id').single();assert.ifError(error);return data.id;}
try{
 for(const table of tables){const r=await publicClient.from(table).select('*');assert.ok(r.error,`public key must not read ${table}`);}
 for(let i=0;i<2;i++){const email='rjm-test-'+randomUUID()+'@example.invalid',password=randomBytes(24).toString('base64url');const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{test_only:true}});assert.ifError(error);ids.push({id:data.user.id,email,password});}
 const login=await post('/api/member/auth',{action:'login',email:ids[0].email,password:ids[0].password},'');assert.equal(login.status,200);const cookies=login.headers.getSetCookie();assert.ok(cookies.length);assert.ok(cookies.every(c=>/HttpOnly/i.test(c)&&/SameSite=Lax/i.test(c)));cookie=cookies.map(c=>c.split(';')[0]).join('; ');
 const account=await fetch(base+'/account',{headers:{cookie}});assert.equal(account.status,200);assert.ok((await account.text()).includes(ids[0].email));
 const plan=await admin.from('membership_settings').select('enabled').eq('id',1).single();assert.ifError(plan.error);if(!plan.data.enabled)assert.equal((await post('/api/member/orders',{reference:'TEST-'+randomUUID(),confirmTransfer:true})).status,503);
 assert.equal((await post('/api/member/orders',{reference:'TEST1234',confirmTransfer:true},'')).status,401);
 assert.equal((await post('/api/member/saved',{jobId:'test',status:'saved'},cookie,'https://evil.invalid')).status,403);
 const {data:jobs,error:jobsError}=await admin.from('jobs').select('id,status,applicationUrl,importInfo').eq('status','approved').limit(10);assert.ifError(jobsError);const job=jobs.find(j=>j.importInfo?.active!==false&&(!j.importInfo?.expiresAt||Date.parse(j.importInfo.expiresAt)>Date.now()));assert.ok(job);
 assert.equal((await post('/api/member/saved',{jobId:job.id,status:'saved',user_id:ids[1].id})).status,200);
 const saved=await admin.from('member_saved_jobs').select('user_id,status').eq('job_id',job.id).in('user_id',ids.map(u=>u.id));assert.ifError(saved.error);assert.deepEqual(saved.data,[{user_id:ids[0].id,status:'saved'}]);
 const freeApply=await fetch(base+'/apply/'+job.id,{redirect:'manual'});assert.equal(freeApply.status,307);assert.equal(freeApply.headers.get('location'),job.applicationUrl);
 assert.equal((await post('/api/admin/memberships',{id:randomUUID(),action:'approve',bankVerified:true})).status,403);
 const first=await order(ids[0].id);const approvals=await Promise.all([1,2].map(()=>admin.rpc('rjm_review_membership',{order_id:first,approve:true,reviewer:'disposable-test-no-money'})));assert.equal(approvals.filter(r=>!r.error).length,1,'double approval must not grant twice');const expiry1=Date.parse(approvals.find(r=>!r.error).data);assert.ok(Math.abs(expiry1-Date.now()-30*86400000)<30000);
 const second=await order(ids[0].id),renewal=await admin.rpc('rjm_review_membership',{order_id:second,approve:true,reviewer:'disposable-test-no-money'});assert.ifError(renewal.error);assert.equal(Date.parse(renewal.data)-expiry1,30*86400000);
 const signedIn=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:false}});assert.ifError((await signedIn.auth.signInWithPassword({email:ids[0].email,password:ids[0].password})).error);for(const table of tables)assert.ok((await signedIn.from(table).select('*')).error,`authenticated users cannot directly access ${table}`);
 assert.equal((await post('/api/member/auth',{action:'logout'})).status,200);
 console.log('PASS: member login and private cookies, account identity, saved-job ownership, free imported apply, closed-payment guard, admin-only review, atomic double approval, 30-day renewal and RLS. No email or money was sent.');
}finally{for(const user of ids){const {error}=await admin.auth.admin.deleteUser(user.id);if(error)throw new Error('Disposable test user cleanup failed');}}
