import type {Job} from './jobs';
import {assessEligibility,plainText,workingHours} from './remotive';
function field(item:string,name:string){const value=item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`,'i'))?.[1]||'';return value.startsWith('<![CDATA[')?value.slice(9,-3):plainText(value);}
export function parseWwr(xml:string,now=new Date().toISOString()){
 const items=xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi)||[];
 if(!items.length||!xml.includes('</rss>'))throw new Error('Incomplete or empty WWR feed');
 const jobs:Job[]=[];let excluded=0;
 for(const item of items){
  const region=field(item,'region'),description=plainText(field(item,'description')),title=field(item,'title'),link=field(item,'link'),date=new Date(field(item,'pubDate'));
  let url:URL;try{url=new URL(link);}catch{excluded++;continue;}
  const decision=assessEligibility(region,description);
  if(!decision||url.protocol!=='https:'||url.hostname!=='weworkremotely.com'||!url.pathname.startsWith('/remote-jobs/')||!Number.isFinite(date.getTime())){excluded++;continue;}
  // Worldwide RSS labels can conflict with domestic payroll, residency or office requirements.
  const conflict=/(?:\b(?:US|U\.S\.|USA|United States|Canada|UK|Europe)[ -](?:based|only)|(?:remote|reside|located|location|hiring|work authorization)[^.\n]{0,70}(?:United States|U\.S\.|Canada|US\b)|(?:in-person|onsite|on-site|on site)|eligible states|eligible countries|security clearance|citizenship|must be legally authorized|location:\s*remote.first\s*\([^)]*\)|position across all [a-z]+ locations)/i.test(description+ '\n'+title);
  if(conflict){decision.eligibility='review';decision.reason='Worldwide feed label conflicts with country, payroll, citizenship or in-person conditions; Mongolia eligibility needs confirmation.';}
  else if(!/work from anywhere|anywhere in the world|(?:worldwide|globally)[^.\n]{0,50}(?:remote|hiring|candidates)|(?:remote|hiring|candidates)[^.\n]{0,50}(?:worldwide|globally)/i.test(description)){decision.eligibility='review';decision.reason='WWR RSS uses broad Worldwide labels for some country-specific jobs. The description does not independently confirm worldwide hiring; hidden pending evidence.';}
  if(/general application|future opportunities|talent pool/i.test(positionTitle(title))){excluded++;continue;}
  const categoryText=field(item,'category'),category=/programming|devops|sysadmin/i.test(categoryText)?'Engineering':/design/i.test(categoryText)?'Design':/support/i.test(categoryText)?'Customer support':/sales|marketing/i.test(categoryText)?'Marketing':/management|finance/i.test(categoryText)?'Operations':'Other';
  const split=title.indexOf(': '),company=split>0?title.slice(0,split):'Company not specified',position=split>0?title.slice(split+2):title;
  const type=field(item,'type'),employment=/contract/i.test(type)?'Contract':/part.time/i.test(type)?'Part-time':/full.time/i.test(type)?'Full-time':null;
  if(!employment||!position){excluded++;continue;}
  const id='wwr-'+url.pathname.split('/').filter(Boolean).at(-1);
  jobs.push({id,title:position.slice(0,300),company:company.slice(0,300),location:region,salary:'Not disclosed / Цалин заагаагүй',category,remoteType:decision.eligibility==='mongolia'?'Mongolia':/anywhere|worldwide/i.test(region)?'Worldwide':'Asia-Pacific',employment,description:description.slice(0,12000),applicationUrl:url.href,featured:false,status:decision.eligibility==='review'?'pending':'approved',createdAt:date.toISOString(),importInfo:{source:'We Work Remotely',sourceUrl:url.href,externalId:id,locationRequirement:region,eligibility:decision.eligibility,reason:decision.reason,importedAt:now,active:true,workingHours:workingHours(description)}});
 }
 return {jobs,fetched:items.length,excluded};
}
function positionTitle(title:string){return title.slice(title.indexOf(':')+1);}
export function planWwr(xml:string,existing:Job[]){const parsed=parseWwr(xml),seen=new Set<string>(),changes:Job[]=[];let published=0,review=0,duplicates=0,inactive=0;
 for(const job of parsed.jobs){if(seen.has(job.id))continue;seen.add(job.id);const previous=existing.find(j=>j.id===job.id||j.company.toLowerCase()===job.company.toLowerCase()&&j.title.toLowerCase()===job.title.toLowerCase());if(previous){duplicates++;if(previous.id===job.id)changes.push({...previous,status:job.status==='pending'?'pending':previous.status,importInfo:job.importInfo});continue;}changes.push(job);if(job.status==='approved')published++;else review++;}
 for(const job of existing)if(job.importInfo?.source==='We Work Remotely'&&job.importInfo.active&&!seen.has(job.id)){changes.push({...job,importInfo:{...job.importInfo,active:false}});inactive++;}
 return {changes,summary:{fetched:parsed.fetched,published,review,duplicates,excluded:parsed.excluded,inactive}};
}
