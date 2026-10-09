import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL||'http://localhost:3000';
const page=await fetch(base+'/?lang=mn'),html=await page.text();
assert.match(html,/<html lang="mn"/);assert.match(html,/rel="canonical"/);assert.match(html,/hreflang="en"/i);assert.match(page.headers.get('content-security-policy'),/frame-ancestors 'none'/);assert.equal(page.headers.get('x-frame-options'),'DENY');assert.equal(page.headers.get('x-content-type-options'),'nosniff');assert.equal(page.headers.get('x-powered-by'),null);
if(process.env.EXPECT_PRODUCTION==='true'){assert.doesNotMatch(page.headers.get('content-security-policy'),/unsafe-eval/);assert.match(html,/<script[^>]+nonce=/);assert.match(page.headers.get('strict-transport-security'),/max-age=31536000/);}
const forbidden=await fetch(base+'/api/jobs',{method:'POST',headers:{origin:'https://evil.example','content-type':'application/json'},body:'{}'});assert.equal(forbidden.status,403);
const admin=await fetch(base+'/admin');assert.match(admin.headers.get('x-robots-tag'),/noindex/);assert.match(admin.headers.get('cache-control'),/no-store/);
const sitemap=await(await fetch(base+'/sitemap.xml')).text();assert.match(sitemap,/xhtml:link/);assert.doesNotMatch(sitemap,/\/admin/);
let limited=false;for(let i=0;i<7;i++){const r=await fetch(base+'/api/jobs',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({website:'spam',startedAt:Date.now()-5000})});assert.ok([400,429].includes(r.status));if(r.status===429){limited=true;break;}}assert.ok(limited,'submission rate limit must activate');
console.log('PASS: SEO, CSP, security headers, cross-origin rejection, private admin cache policy, bilingual sitemap, honeypot and rate limiting');

