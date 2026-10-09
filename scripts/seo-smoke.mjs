import assert from 'node:assert/strict';
const base=process.env.SMOKE_BASE_URL||'http://localhost:3000';
async function page(path){const response=await fetch(base+path);assert.equal(response.status,200,`${path}: HTTP 200 required`);return response.text();}
function attribute(tag,key){return tag.match(new RegExp(`\\b${key}="([^"]*)"`,'i'))?.[1];}
function metadata(html,path,indexed=true){
 assert.equal((html.match(/<h1(?:\s|>)/gi)||[]).length,1,`${path}: one primary H1`);
 assert.ok(/<title>[^<]+<\/title>/i.test(html),`${path}: title missing`);
 const tags=html.match(/<meta\b[^>]*>/gi)||[];
 const description=tags.find(tag=>attribute(tag,'name')==='description');assert.ok(description&&attribute(description,'content')?.trim(),`${path}: description missing`);
 const robots=tags.find(tag=>attribute(tag,'name')==='robots');assert.ok(robots,`${path}: robots metadata missing`);
 assert.equal(/\bnoindex\b/i.test(attribute(robots,'content')||''),!indexed,`${path}: unexpected index policy`);
 const links=html.match(/<link\b[^>]*>/gi)||[],canonical=links.find(tag=>attribute(tag,'rel')==='canonical');assert.ok(canonical,`${path}: canonical missing`);
 assert.ok(links.some(tag=>attribute(tag,'hreflang')==='mn')&&links.some(tag=>attribute(tag,'hreflang')==='en'),`${path}: bilingual alternates missing`);
 return attribute(canonical,'href');
}
const sitemap=await page('/sitemap.xml');assert.ok(sitemap.includes('<urlset'));assert.ok(!sitemap.includes('/admin')&&!sitemap.includes('/api/'));
let checked=0;
for(const path of ['/','/post','/privacy','/terms'])for(const lang of ['en','mn']){const url=path+(lang==='mn'?'?lang=mn':'');const html=await page(url);const canonical=metadata(html,url);assert.ok(sitemap.includes(canonical.replace(/&/g,'&amp;')),`${url}: canonical absent from sitemap`);checked++;}
const home=await page('/?lang=mn');const detail=home.match(/href="(\/jobs\/[^"?]+)\?lang=mn"/)?.[1];
if(detail)for(const lang of ['en','mn']){const url=detail+(lang==='mn'?'?lang=mn':'');metadata(await page(url),url);checked++;}
metadata(await page('/?q=example'),'/filtered search',false);
const admin=await page('/admin');assert.ok(/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i.test(admin),'admin must remain noindex');
const robots=await page('/robots.txt');assert.ok(/Allow: \//.test(robots));assert.ok(!/^Disallow:\s*\/\s*$/m.test(robots),'public crawl blocked');assert.ok(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/.test(robots));
console.log(`PASS: ${checked} bilingual public pages checked for title, description, one H1, canonical, hreflang and indexability; sitemap, robots and intentional noindex verified.`);
