'use client';
import Link from 'next/link';
import { usePathname,useSearchParams } from 'next/navigation';
import { Mountain,Globe2 } from 'lucide-react';
import {copy,language} from '@/lib/i18n';
export default function Header(){const pathname=usePathname(),params=useSearchParams(),lang=language(params.get('lang')),t=copy[lang];const other=new URLSearchParams(params.toString());other.set('lang',lang==='en'?'mn':'en');return <header><div className="nav shell"><Link className="brand" href={`/?lang=${lang}`}><span className="brand-icon"><Mountain size={23}/></span><span>remote job<span className="brand-sub">MONGOLIA</span></span></Link><nav aria-label="Main"><Link className={pathname==='/'?'active':''} href={`/?lang=${lang}`}>{t.jobs}</Link><Link href={`/account?lang=${lang}`}>{lang==='mn'?'Миний account':'Account'}</Link><Link href={`/membership?lang=${lang}`}>Membership</Link><Link className="admin-link" href={`/admin?lang=${lang}`}>{t.admin}</Link><a className="language" aria-label={t.language} href={`${pathname}?${other}`}><Globe2 size={16}/>{lang==='en'?'MN':'EN'}</a><Link className="button small" href={`/post?lang=${lang}`}>{t.post}<span>+</span></Link></nav></div></header>}

