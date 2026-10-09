import Link from 'next/link';
import {memberOnly} from '@/lib/member-policy';
import {MapPin,Wallet,ArrowUpRight} from 'lucide-react';
import {Job} from '@/lib/jobs';
import {copy,Lang,option} from '@/lib/i18n';
export default function JobCard({job,lang,compact=false}:{job:Job;lang:Lang;compact?:boolean}){const t=copy[lang];return <Link href={`/jobs/${job.id}?lang=${lang}`} className={`job-card ${compact?'compact':''}`}><div className={`company-logo tone-${job.category==='Design'?1:job.category==='Marketing'?2:0}`}>{job.company.slice(0,1)}</div><div className="job-main"><div className="company-line">{job.company}{job.featured&&!compact&&<span className="featured-tag">{t.featuredLabel}</span>}</div><h3>{job.title}</h3><div className="job-meta"><span><MapPin size={14}/>{option(job.remoteType,lang)}</span><span>{option(job.employment,lang)}</span>{job.importInfo&&<span>{job.importInfo.source}</span>}<span className="member-badge">{memberOnly(job)?(lang==='mn'?'Membership':'Members only'):(lang==='mn'?'Үнэгүй apply':'Free apply')}</span></div>{compact&&<div className="card-salary">{job.salary}</div>}</div>{!compact&&<div className="job-right"><strong><Wallet size={15}/>{job.salary}</strong><span>{option(job.category,lang)}</span></div>}<ArrowUpRight className="job-arrow" size={19}/></Link>}

