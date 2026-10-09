import JobForm from '@/components/job-form';
import {copy,language} from '@/lib/i18n';
import {seo} from '@/lib/seo';
export async function generateMetadata({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang);return seo('/post',lang,lang==='mn'?'Зайны ажлын зар нийтлэх':'Post a remote job',copy[lang].postIntro);}
export default async function Post({searchParams}:{searchParams:Promise<{lang?:string}>}){const lang=language((await searchParams).lang),t=copy[lang];return <main className="shell form-page" lang={lang}><div className="page-heading"><span className="eyebrow">REMOTE JOB MONGOLIA</span><h1>{t.posting}</h1><p>{t.postIntro}</p></div><div className="panel"><JobForm lang={lang}/></div></main>}
