import JobArt from '@/components/job-art';
import {jobDate} from '@/lib/job-display';
import Link from 'next/link';
import {applicationRequiresAccount,memberOnly} from '@/lib/member-policy';
import {MapPin,Wallet,ArrowUpRight} from 'lucide-react';
import {Job} from '@/lib/jobs';
import {copy,Lang,option} from '@/lib/i18n';
export default function JobCard({job,lang,compact=false}:{job:Job;lang:Lang;compact?:boolean}){const t=copy[lang];return <Link href={`/jobs/${job.id}?lang=${lang}`} className={`job-card ${compact?'compact':''}`}><JobArt category={job.category}/><div className="job-main"><div className="company-line">{job.company}{job.featured&&!compact&&<span className="featured-tag">{t.featuredLabel}</span>}</div><h3>{job.title}</h3><div className="job-meta"><span><MapPin size={14}/>{option(job.remoteType,lang)}</span><span>{option(job.employment,lang)}</span><span>{lang==='mn'?'Эх сурвалж: ':'Source: '}{job.importInfo?.source||job.company}</span>{jobDate(job.createdAt,lang)&&<span>{lang==='mn'?'Нийтэлсэн: ':'Posted: '}<time dateTime={job.createdAt}>{jobDate(job.createdAt,lang)}</time></span>}<span className="member-badge">{memberOnly(job)?(lang==='mn'?'Membership':'Members only'):(applicationRequiresAccount(job)?(lang==='mn'?'Үнэгүй · Нэвтэрч apply':'Free · Sign in to apply'):(lang==='mn'?'Үнэгүй apply':'Free apply'))}</span></div>{compact&&<div className="card-salary">{job.salary}</div>}</div>{!compact&&<div className="job-right"><strong><Wallet size={15}/>{job.salary}</strong><span>{option(job.category,lang)}</span></div>}<ArrowUpRight className="job-arrow" size={19}/></Link>}

