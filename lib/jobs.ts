export const categories = ['Engineering', 'Design', 'Marketing', 'Customer support', 'Operations', 'Writing', 'Sales', 'Other'] as const;
export const remoteTypes = ['Worldwide', 'Asia-Pacific', 'Mongolia'] as const;
export type JobImport = { source:'Remotive'|'We Work Remotely'|'Himalayas'|'Jobicy'|'Remote OK'; sourceUrl:string; externalId:string; locationRequirement:string; eligibility:'worldwide'|'mongolia'|'review'; reason:string; importedAt:string; active:boolean; expiresAt?:string; workingHours?:{en:string;mn:string} };
export type Job = { id:string; title:string; company:string; location:string; salary:string; category:string; remoteType:string; employment:string; description:string; applicationUrl:string; featured:boolean; status:'pending'|'approved'; createdAt:string; importInfo?:JobImport };
export const seedJobs: Job[] = [
  ['frontend-engineer','Senior Frontend Engineer','Orbit','Engineering','Worldwide','$70,000 – $100,000 / year','Full-time',true],
  ['product-designer','Product Designer','Forma','Design','Asia-Pacific','$45,000 – $65,000 / year','Full-time',true],
  ['growth-marketer','Growth Marketing Specialist','Nomad Labs','Marketing','Mongolia','₮4,000,000 – ₮6,000,000 / month','Full-time',true],
  ['backend-engineer','Backend Engineer · Python','Cloudline','Engineering','Asia-Pacific','$60,000 – $90,000 / year','Full-time',false],
  ['customer-success','Customer Success Associate','Kindred','Customer support','Worldwide','$30,000 – $42,000 / year','Full-time',false],
  ['brand-designer','Freelance Brand Designer','Studio North','Design','Worldwide','$35 – $55 / hour','Contract',false],
  ['operations-coordinator','Operations Coordinator','Steppe Digital','Operations','Mongolia','₮3,000,000 – ₮4,500,000 / month','Full-time',false],
].map((j,i)=>({id:j[0] as string,title:j[1] as string,company:j[2] as string,category:j[3] as string,remoteType:j[4] as string,salary:j[5] as string,employment:j[6] as string,featured:j[7] as boolean,location:j[4]==='Mongolia'?'Ulaanbaatar, Mongolia':'Remote',status:'approved',createdAt:new Date(Date.UTC(2026,9,8-i)).toISOString(),applicationUrl:'https://example.com',description:`Join a collaborative remote team and help build thoughtful products for people around the world.\n\nWhat you’ll do\n• Own meaningful projects from discovery to delivery.\n• Collaborate asynchronously with an international team.\n• Share ideas and improve the way we work.\n\nWhat you’ll bring\n• Relevant experience and a portfolio of your work.\n• Clear written communication in English.\n• Comfortable working independently across time zones.\n\nThis is a fictional example listing for the Remote Job Mongolia MVP. No applications are being accepted.`}));
export function publicJobs(jobs:Job[]){const approved=jobs.filter(j=>j.status==='approved'&&j.importInfo?.active!==false&&(!j.importInfo?.expiresAt||new Date(j.importInfo.expiresAt).getTime()>Date.now()));const hasReal=approved.some(j=>j.applicationUrl!=='https://example.com');return hasReal?approved.filter(j=>j.applicationUrl!=='https://example.com'):approved;}
export function filterJobs(jobs:Job[], q='', category='', remoteType='') { return publicJobs(jobs).filter(j=>(!category||j.category===category) && (!remoteType||j.remoteType===remoteType) && `${j.title} ${j.company} ${j.category}`.toLowerCase().includes(q.toLowerCase())); }
export function validateJob(data:Record<string,unknown>) {
 const fields=['title','company','location','salary','category','remoteType','employment','description','applicationUrl'];
 for (const field of fields) if(typeof data[field]!=='string'||!(data[field] as string).trim()||(data[field] as string).length>(field==='description'?12000:300)) throw new Error(`Invalid ${field}`);
 if(!categories.includes(data.category as typeof categories[number])||!remoteTypes.includes(data.remoteType as typeof remoteTypes[number])||!['Full-time','Part-time','Contract'].includes(data.employment as string)) throw new Error('Invalid job options');
 const url=new URL(data.applicationUrl as string); if(!['http:','https:'].includes(url.protocol)) throw new Error('Use an http or https application link');
 return Object.fromEntries(fields.map(f=>[f,(data[f] as string).trim()])) as Pick<Job,'title'|'company'|'location'|'salary'|'category'|'remoteType'|'employment'|'description'|'applicationUrl'>;
}


