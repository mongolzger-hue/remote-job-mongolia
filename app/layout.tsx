import type {Metadata} from 'next';
import Link from 'next/link';
import {Suspense} from 'react';
import {headers} from 'next/headers';
import Header from '@/components/header';
import SiteAnalytics from '@/components/site-analytics';
import './globals.css';
export const metadata:Metadata={metadataBase:new URL(process.env.SITE_URL||'http://localhost:3000'),title:{default:'Remote Job Mongolia · Work beyond borders',template:'%s | Remote Job Mongolia'},description:'Discover remote jobs open to professionals in Mongolia. Browse engineering, design, marketing and more.',icons:{icon:'/favicon.svg'},verification:{google:process.env.GOOGLE_SITE_VERIFICATION||undefined}};
export default async function Layout({children}:{children:React.ReactNode}){const lang=(await headers()).get('x-rjm-lang')==='mn'?'mn':'en';return <html lang={lang}><body><Suspense><Header/></Suspense>{children}<footer><div className="shell footer"><span className="footer-brand">remote job <b>MONGOLIA</b></span><span><a href={`/privacy?lang=${lang}`}>{lang==='mn'?'Нууцлал':'Privacy'}</a> · <a href={`/terms?lang=${lang}`}>{lang==='mn'?'Үйлчилгээний нөхцөл':'Terms'}</a></span><span><Link href={`/about?lang=${lang}`}>{lang==='mn'?'Бидний тухай':'About'}</Link> · <Link href={`/about?lang=${lang}#contact`}>{lang==='mn'?'Холбоо барих':'Contact'}</Link></span><span>© {new Date().getFullYear()} Remote Job Mongolia</span></div></footer><SiteAnalytics/></body></html>}
