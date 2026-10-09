import {notFound} from 'next/navigation';
import Link from 'next/link';
import {getJobs} from '@/lib/store';
import {publicJobs} from '@/lib/jobs';
import ImportInfo from '@/components/import-info';
import {seo} from '@/lib/seo';
import {copy,language,option} from '@/lib/i18n';
export const dynamic='force-dynamic';
export async function generateMetadata({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}){const {id}=await params,lang=language((await searchParams).lang),job=publicJobs(await getJobs()).find(j=>j.id===id);return job?seo(`/jobs/${id}`,lang,`${job.title} · ${job.company}`,`${option(job.remoteType,lang)} · ${job.salary}. ${job.description.slice(0,130)}`):{title:'Job not found',robots:{index:false}};}
export default async function Detail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{lang?:string}>}){const {id}=await params,lang=language((await searchParams).lang),t=copy[lang],job=publicJobs(await getJobs()).find(j=>j.id===id);if(!job)notFound();const sample=job.applicationUrl==='https://example.com';return <main lang={lang} className="shell detail-page"><Link className="back" href={`/?lang=${lang}`}>‹ {t.back}</Link><div className="detail-title"><div className="company-logo">{job.company[0]}</div><div><p>{job.company}</p><h1>{job.title}</h1><span>{option(job.remoteType,lang)} · {option(job.employment,lang)}</span></div></div><div className="detail-grid"><article className="panel"><h2>{t.about}</h2>{job.importInfo&&<ImportInfo job={job} lang={lang}/>}<div className="description">{job.description}</div></article><aside className="panel overview"><h2>{t.details}</h2>{(['salary','location','remoteType','category','employment'] as const).map(k=><div className="detail-item" key={k}><span>{k==='remoteType'?t.remote:t[k]}</span><strong>{option(job[k],lang)}</strong></div>)}{sample?<p className="notice">{t.sample}</p>:<a className="button" href={job.applicationUrl} target="_blank" rel="noopener noreferrer">{job.importInfo?(lang==='mn'?job.importInfo.source+' дээр үзэж, хүсэлт илгээх':'View and apply on '+job.importInfo.source):t.apply}</a>}</aside></div></main>}

