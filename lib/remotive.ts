import {Job,JobImport} from './jobs';
export type RemoteListing={id:number;url:string;title:string;company_name:string;category:string;job_type:string;publication_date:string;candidate_required_location:string;salary:string;description:string};
// Imported HTML is converted to text and rendered by React, never injected into the DOM.
export function plainText(html:string){return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<br\s*\/?\s*>|<\/(?:p|div|h[1-6]|ul|ol)>/gi,'\n\n').replace(/<li\b[^>]*>/gi,'\n• ').replace(/<[^>]*>/g,'').replace(/&#(x[\da-f]+|\d+);/gi,(_,n:string)=>{const code=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';}).replace(/&(amp|lt|gt|quot|apos|nbsp|rsquo|lsquo|rdquo|ldquo|ndash|mdash);/gi,(_,n:string)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',ndash:'–',mdash:'—'}[n.toLowerCase()]||'')).replace(/[ \t]+/g,' ').replace(/\n[ \t]+/g,'\n').replace(/\n{3,}/g,'\n\n').trim();}
export function assessEligibility(location:string,description:string):{eligibility:JobImport['eligibility'];reason:string}|null{
 const normalized=location.trim().toLowerCase();
 const mongolia=/\bmongolia\b/.test(normalized);
 const worldwide=/^(worldwide|anywhere|global|anywhere in the world|work from anywhere)$/.test(normalized);
 const asia=/(?:\bapac\b|\basia(?:[ -]pacific)?\b)/.test(normalized);
 if(!mongolia&&!worldwide&&!asia)return null;
 const text=plainText(description);
 if(/(?:accessing|access to)[^.\n]{0,100}(?:require|requires)[^.\n]{0,30}payment/i.test(text))return null;
 if(/(?:not (?:available|open|hiring)|excluding|except|cannot (?:hire|accept))[^.\n]{0,80}\bmongolia\b/i.test(text))return null;
 // Explicit selected-country lists outrank broad Asia/APAC metadata.
 const selectedAsia=text.match(/selected countries in Asia\s*\(([^)]+)\)/i);
 if(selectedAsia&&!/\bmongolia\b/i.test(selectedAsia[1]))return null;
 const countryRestriction=/(?:selected (?:countries|locations)|(?:must|need to|have to|should) (?:be )?(?:based|located|reside|live)|(?:only (?:hiring|accepting|available|open)|(?:candidates|applicants) (?:must|only))|(?:authorized|eligible|right) to work in|(?:hiring|recruiting|accepting candidates) (?:only )?(?:in|from)|(?:based|located|resident) in (?:the )?(?:US\b|USA\b|United States|UK\b|United Kingdom|Canada|Europe|Australia|India)|(?:US|USA|UK|Europe|Canada)[ -]only|(?:US|USA|UK|Europe|Canada)[ -]based (?:only|candidates|applicants|role))/i.test(text);
 if(/(?:in[ -]person|on[ -]site) (?:support|work|attendance|visits)|(?:support|assistance|work)[^.\n]{0,90}in person/i.test(text))return {eligibility:'review',reason:'The description requires or allows in-person/on-site duties. A fully remote role from Mongolia is not confirmed; excluded from automatic publication.'};
 const timeRequirement=/(?:\b(?:EST|EDT|PST|PDT|CST|CDT|ET|PT)\b|(?:Pacific|Eastern|Central|Mountain) (?:Time|Standard|Daylight)|UTC\s*[+-]\s*\d|(?:time\s*zone|timezone|working hours|work hours|business hours|overlap|shift hours))/i.test(text);
 if(countryRestriction)return {eligibility:'review',reason:'The description includes a country or residency restriction. Confirm that Mongolia is accepted before approval.'};
 if(mongolia)return {eligibility:'mongolia',reason:'Mongolia is explicitly included in the source location requirement.'};
 if(worldwide)return {eligibility:'worldwide',reason:timeRequirement?'Source lists Worldwide with no detected country restriction. Fixed hours or time-zone conditions apply; these do not by themselves exclude Mongolia.':'Source lists Worldwide with no detected country restriction. Eligibility is based on published requirements, not a direct employer confirmation.'};
 return {eligibility:'review',reason:'Asia/APAC alone does not confirm that the employer can hire in Mongolia. Verify the accepted countries.'};
}
export function workingHours(description:string):{en:string;mn:string}|undefined{
 const text=plainText(description);
 if(/9:00 a\.m\. to 6:00 p\.m\. Pacific Time/i.test(text))return {en:'Required: Mon–Fri 09:00–18:00 Pacific Time. In Ulaanbaatar: 00:00–09:00 the next day during PDT, or 01:00–10:00 during PST. Overnight work is required.',mn:'Даваа–Баасан 09:00–18:00 Pacific Time. Улаанбаатарт PDT үед дараагийн өдрийн 00:00–09:00, PST үед 01:00–10:00. Шөнийн цагаар ажиллана.'};
 if(/10 AM\s*[-–]\s*6 PM EST/i.test(text))return {en:'Training: 10:00–18:00 EST = 23:00–07:00 the next day in Ulaanbaatar (UTC+8). If the employer means local Eastern daylight time, it is 22:00–06:00. Post-training shifts vary. Commission-based pay; the description contains conflicting training-stipend terms.',mn:'Сургалт: 10:00–18:00 EST = Улаанбаатарын 23:00–дараагийн өдрийн 07:00. Хэрэв Eastern зуны цагийг хэлсэн бол 22:00–06:00. Дараагийн ээлжийн цаг өөр. Борлуулалтын шимтгэлээр цалинжина; сургалтын төлбөрийн нөхцөл зөрүүтэй бичигдсэн.'};
 if(/(?:\b(?:EST|EDT|PST|PDT|CST|CDT|ET|PT)\b|(?:Pacific|Eastern|Central|Mountain) Time|UTC\s*[+-]\s*\d|time\s*zone|timezone|working hours|business hours|overlap|shift hours)/i.test(text))return {en:'The role specifies working hours or time-zone overlap. Read the schedule in the job description; worldwide eligibility does not imply flexible hours.',mn:'Тогтсон ажлын цаг эсвэл цагийн бүсийн давхцал шаардсан. Дэлгэрэнгүй дэх цагийн нөхцөлийг үзнэ үү; Worldwide нь уян хатан цаг гэсэн үг биш.'};
}
export function normalizeListing(raw:RemoteListing,now=new Date().toISOString()):Job|null{
 if(!raw||!Number.isSafeInteger(raw.id)||typeof raw.title!=='string'||typeof raw.company_name!=='string'||typeof raw.description!=='string'||typeof raw.candidate_required_location!=='string')return null;
 const decision=assessEligibility(raw.candidate_required_location,raw.description);if(!decision)return null;
 let url:URL;try{url=new URL(raw.url);}catch{return null;}if(url.protocol!=='https:'||url.hostname!=='remotive.com')return null;
 const date=new Date(raw.publication_date.endsWith('Z')?raw.publication_date:raw.publication_date+'Z');if(!Number.isFinite(date.getTime()))return null;
 const employment=({full_time:'Full-time',part_time:'Part-time',contract:'Contract',freelance:'Contract'} as Record<string,string>)[raw.job_type];if(!employment)return null;
 const category=({'Software Development':'Engineering',DevOps:'Engineering','Data Analysis':'Engineering','QA':'Engineering',Design:'Design',Marketing:'Marketing','Customer Service':'Customer support','Writing':'Writing',Sales:'Sales','Human Resources':'Operations','Project Management':'Operations','Business':'Operations'} as Record<string,string>)[raw.category]||'Other';
 return {id:`remotive-${raw.id}`,title:plainText(raw.title).slice(0,300),company:plainText(raw.company_name).slice(0,300),location:raw.candidate_required_location.slice(0,300),salary:raw.salary?.trim()||'Not disclosed / Цалин заагаагүй',category,remoteType:decision.eligibility==='mongolia'?'Mongolia':/^(worldwide|anywhere|global|anywhere in the world|work from anywhere)$/i.test(raw.candidate_required_location.trim())?'Worldwide':'Asia-Pacific',employment,description:plainText(raw.description).slice(0,12000),applicationUrl:url.href,featured:false,status:decision.eligibility==='review'?'pending':'approved',createdAt:date.toISOString(),importInfo:{source:'Remotive',sourceUrl:url.href,externalId:String(raw.id),locationRequirement:raw.candidate_required_location,eligibility:decision.eligibility,reason:decision.reason,importedAt:now,active:true,workingHours:workingHours(raw.description)}};
}
export function planImport(raw:RemoteListing[],existing:Job[],now=new Date().toISOString()){
 const candidates=raw.map(j=>normalizeListing(j,now)).filter((j):j is Job=>!!j),byId=new Map(existing.map(j=>[j.id,j])),seen=new Set<string>(),changes:Job[]=[];
 let published=0,review=0,duplicates=0;
 for(const job of candidates){if(seen.has(job.id))continue;seen.add(job.id);const previous=byId.get(job.id);if(previous){duplicates++;if(previous.importInfo){if(job.importInfo!.eligibility==='review')changes.push({...previous,status:'pending',importInfo:job.importInfo});else changes.push({...previous,importInfo:job.importInfo});}continue;}changes.push(job);if(job.status==='approved')published++;else review++;}
 // A full successful feed no longer containing a record takes it out of public results.
 const activeIds=new Set(candidates.map(j=>j.id));let inactive=0;
 for(const job of existing)if(job.importInfo?.source==='Remotive'&&job.importInfo.active&&!activeIds.has(job.id)){changes.push({...job,importInfo:{...job.importInfo,active:false}});inactive++;}
 return {changes,summary:{fetched:raw.length,published,review,duplicates,excluded:raw.length-candidates.length,inactive}};
}
