import {createHash} from 'node:crypto';
import type {Job,JobImport} from './jobs';
import {assessEligibility,plainText,workingHours} from './remotive';
export type AdditionalSource='himalayas'|'jobicy'|'remoteok';
type Raw=Record<string,unknown>;
const names={himalayas:'Himalayas',jobicy:'Jobicy',remoteok:'Remote OK'} as const;
function timestamp(value:unknown){if(typeof value==='number')return new Date(value<1e12?value*1000:value);return new Date(String(value));}
function list(value:unknown):unknown[]{return Array.isArray(value)?value:[];}
export function normalizeAdditional(source:AdditionalSource,raw:Raw,now=new Date()):Job|null{
 let location='',url='',title='',company='',description='',type='',published:unknown,expiry:unknown,categoryText='',salary='Not disclosed / Цалин заагаагүй',timezone=false;
 if(source==='himalayas'){
  if(!Array.isArray(raw.locationRestrictions)||!Array.isArray(raw.timezoneRestrictions))return null;
  const countries=list(raw.locationRestrictions).map(x=>typeof x==='string'?x:typeof x==='object'&&x!==null?String((x as Raw).alpha2|| (x as Raw).name||''):'');
  if(countries.length&&!countries.some(x=>/^(MN|Mongolia)$/i.test(x)))return null;
  location=countries.length?'Mongolia':'Worldwide';timezone=list(raw.timezoneRestrictions).length>0&&!list(raw.timezoneRestrictions).some(x=>Number(String(x).replace(/^UTC/i,''))===8);
  if(timezone)return null;
  url=String(raw.applicationLink||raw.guid||'');title=String(raw.title||'');company=String(raw.companyName||'');description=String(raw.description||'');type=String(raw.employmentType||'');published=raw.pubDate;expiry=raw.expiryDate;categoryText=list(raw.parentCategories).join(' ');
  if(typeof raw.minSalary==='number'&&raw.minSalary>0&&typeof raw.currency==='string')salary=`${raw.currency} ${raw.minSalary.toLocaleString('en-US')}${typeof raw.maxSalary==='number'&&raw.maxSalary>=raw.minSalary?' – '+raw.maxSalary.toLocaleString('en-US'):''} / ${String(raw.salaryPeriod||'annual')}`;
 }else if(source==='jobicy'){
  location=String(raw.jobGeo||'');url=String(raw.url||'');title=String(raw.jobTitle||'');company=String(raw.companyName||'');description=String(raw.jobDescription||'');type=list(raw.jobType).join(' ');published=raw.pubDate;categoryText=list(raw.jobIndustry).join(' ');
  if(typeof raw.salaryMin==='number'&&raw.salaryMin>0&&typeof raw.salaryCurrency==='string')salary=`${raw.salaryCurrency} ${raw.salaryMin}${typeof raw.salaryMax==='number'?' – '+raw.salaryMax:''} / ${String(raw.salaryPeriod||'unspecified period')}`;
 }else{
  location=String(raw.location||'');url=String(raw.url||'');title=String(raw.position||'');company=String(raw.company||'');description=String(raw.description||'');published=raw.date;categoryText=list(raw.tags).join(' ');
  // The API does not reliably provide employment type; do not invent it.
  type=/\b(full.time|part.time|contract(?:or)?)\b/i.exec(plainText(description))?.[1]||'';
 }
 if(!title||!company||!description||/general application|future opportunities|talent pool|prospective employees|bewerberpool|open application|work with us!?|expression of interest|future roles|test job.*testing purposes/i.test(title))return null;
 const date=timestamp(published);if(!Number.isFinite(date.getTime())||date>now)return null;
 let expiresAt:string|undefined;if(expiry!==undefined&&expiry!==null){const d=timestamp(expiry);if(!Number.isFinite(d.getTime())||d<=now)return null;expiresAt=d.toISOString();}
 // For feeds without explicit expiry, old listings must not accumulate indefinitely.
 if(!expiresAt&&now.getTime()-date.getTime()>60*86400000)return null;
 if(!expiresAt)expiresAt=new Date(date.getTime()+60*86400000).toISOString();
 const employment=/part.time/i.test(type)?'Part-time':/contract|freelance/i.test(type)?'Contract':/full.time/i.test(type)?'Full-time':null;if(!employment)return null;
 let parsed:URL;try{parsed=new URL(url);}catch{return null;}const host={himalayas:'himalayas.app',jobicy:'jobicy.com',remoteok:'remoteok.com'}[source];if(parsed.protocol!=='https:'||parsed.hostname.toLowerCase()!==host)return null;
 const decision=assessEligibility(location,description);if(!decision)return null;
 if(/\bEurope or LATAM\b/i.test(title)){decision.eligibility='review';decision.reason='The title restricts hiring to regions outside Mongolia.';}
 const text=plainText(description);
 if(/(?:in.person|on.site|onsite)|location:\s*remote.first\s*\([^)]*\)|(?:must|required)[^.\n]{0,70}(?:citizen|residen|work authoriz)|(?:remote|hiring|position)[^.\n]{0,30}(?:US.only|United States only)/i.test(text)){decision.eligibility='review';decision.reason='Country, work authorization or in-person requirements need Mongolia confirmation.';}
 const category=/engineer|software|develop|devops|data/i.test(categoryText)?'Engineering':/design|creative/i.test(categoryText)?'Design':/market/i.test(categoryText)?'Marketing':/sales/i.test(categoryText)?'Sales':/support|customer/i.test(categoryText)?'Customer support':/writ|content/i.test(categoryText)?'Writing':/operation|management|finance/i.test(categoryText)?'Operations':'Other';
 const id=source+'-'+createHash('sha256').update(parsed.href).digest('hex').slice(0,24);
 return {id,title:plainText(title).slice(0,300),company:plainText(company).slice(0,300),location:location.slice(0,300),salary,category,remoteType:decision.eligibility==='mongolia'?'Mongolia':/worldwide|anywhere|global/i.test(location)?'Worldwide':'Asia-Pacific',employment,description:text.slice(0,12000),applicationUrl:parsed.href,featured:false,status:decision.eligibility==='review'?'pending':'approved',createdAt:date.toISOString(),importInfo:{source:names[source] as JobImport['source'],sourceUrl:parsed.href,externalId:String(raw.id||raw.guid||id),locationRequirement:location,eligibility:decision.eligibility,reason:decision.reason,importedAt:now.toISOString(),active:true,expiresAt,workingHours:workingHours(text)}};
}
export function planAdditional(source:AdditionalSource,raw:Raw[],existing:Job[],now=new Date()){
 const changes:Job[]=[],seen=new Set<string>();let published=0,review=0,duplicates=0,excluded=0;
 for(const item of raw){const job=normalizeAdditional(source,item,now);if(!job){excluded++;continue;}if(seen.has(job.id)){duplicates++;continue;}seen.add(job.id);
 const previous=existing.find(j=>j.id===job.id||j.company.toLowerCase()===job.company.toLowerCase()&&j.title.toLowerCase()===job.title.toLowerCase());if(previous){duplicates++;if(previous.id===job.id)changes.push({...previous,status:job.status==='pending'?'pending':previous.status,importInfo:job.importInfo});continue;}changes.push(job);if(job.status==='approved')published++;else review++;}
 // These imports may be bounded pages; absence is never evidence of deletion.
 return {changes,summary:{fetched:raw.length,published,review,duplicates,excluded,inactive:0}};
}
