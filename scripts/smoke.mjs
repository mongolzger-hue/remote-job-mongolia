import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {totp} from '../lib/crypto.ts';
let loginFields={password:process.env.ADMIN_PASSWORD||'local-demo-admin'};
try{const credentials=await readFile('.data/admin-setup.txt','utf8');loginFields={username:credentials.match(/^Username: (.+)$/m)[1],password:credentials.match(/^Password: (.+)$/m)[1],code:totp(credentials.match(/^Authenticator secret: (.+)$/m)[1])};}catch{}

const base=process.env.SMOKE_BASE_URL||'http://localhost:3000';
const headers={'Content-Type':'application/json',origin:base};
const request=(url,method='GET',data,cookie)=>fetch(base+url,{method,headers:{...headers,...(cookie?{cookie}:{})},body:data?JSON.stringify(data):undefined});
const fields={startedAt:Date.now()-5000,website:'',title:'Smoke Test Engineer',company:'Local Test Company',location:'Ulaanbaatar',salary:'₮5,000,000 / month',category:'Engineering',remoteType:'Mongolia',employment:'Full-time',description:'Disposable integration test listing.',applicationUrl:'https://example.org/careers'};
let id,cookie;
try{
 for(const url of ['/','/?lang=mn','/post','/admin','/robots.txt','/sitemap.xml'])assert.equal((await request(url)).status,200,url);
 assert.equal((await request('/jobs/missing')).status,404);
 assert.equal((await request('/api/jobs','POST',{...fields,applicationUrl:'javascript:alert(1)'})).status,400);
 const created=await request('/api/jobs','POST',fields);assert.equal(created.status,201);id=(await created.json()).id;
 assert.equal((await request(`/jobs/${id}`)).status,404,'pending stays private');
 assert.equal((await request(`/api/jobs/${id}`,'PATCH',{status:'approved'})).status,403,'unauthenticated mutation blocked');
 const login=await request('/api/admin','POST',loginFields);assert.equal(login.status,200);cookie=login.headers.get('set-cookie').split(';')[0];
 assert.equal((await request(`/api/jobs/${id}`,'PATCH',{status:'approved'},cookie)).status,200);
 const page=await request(`/jobs/${id}`);assert.equal(page.status,200);assert.match(await page.text(),/https:\/\/example.org\/careers/);
 assert.equal((await request(`/api/jobs/${id}`,'PATCH',{...fields,title:'Updated Smoke Engineer',featured:true},cookie)).status,200);
 assert.match(await (await request(`/jobs/${id}`)).text(),/Updated Smoke Engineer/);
 assert.equal((await request(`/api/jobs/${id}`,'DELETE',undefined,cookie)).status,200);assert.equal((await request(`/jobs/${id}`)).status,404);id=null;
 assert.equal((await request('/api/admin','DELETE',undefined,cookie)).status,200);
 assert.equal((await request('/api/jobs/missing','PATCH',{status:'approved'},cookie)).status,403,'logged-out token is revoked');
 console.log('PASS: routes, Mongolian page, validation, pending privacy, auth, approve, edit, application link, logout');
}finally{if(id&&cookie){assert.equal((await request(`/api/jobs/${id}`,'DELETE',undefined,cookie)).status,200);assert.equal((await request(`/jobs/${id}`)).status,404);console.log('PASS: removal and test-data cleanup');}}
