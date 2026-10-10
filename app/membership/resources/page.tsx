import Link from 'next/link';
import {language} from '@/lib/i18n';
import {memberUser,membershipFor} from '@/lib/member';
import {supportApplicationKit} from '@/lib/member-resources';
import ApplicationBuilder from '@/components/application-builder';

export const dynamic='force-dynamic';
export const metadata={title:'Career resources — Ajilgo',robots:{index:false,follow:false}};

export default async function Resources({searchParams}:{searchParams:Promise<{lang?:string}>}) {
  const lang=language((await searchParams).lang),mn=lang==='mn';
  const user=await memberUser();
  const membership=user?await membershipFor(user.id):null;
  return <main className="shell account-page">
    <div className="page-heading"><span className="eyebrow">MEMBERSHIP RESOURCES</span><h1>{mn?'Өргөдлөө бэлдэх багц':'Application preparation kit'}</h1><p>{mn?'Англи CV, cover letter загвар, customer support дадлага болон apply шалгах хуудас. Ажилд орох баталгаа биш.':'English CV and cover letter templates, customer support practice and an application checklist. Employment is not guaranteed.'}</p></div>
    {membership?.active?<><ApplicationBuilder mn={mn}/><section className="panel"><p className="notice success">{mn?'Өөрийн бодит мэдээллээр бөглөөрэй.':'Use your real information. The guidance is in Mongolian; the templates are in English.'}</p><div style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',lineHeight:1.8}}>{supportApplicationKit}</div></section></>:<section className="panel"><h2>{mn?'Membership эрх шаардлагатай':'Active membership required'}</h2><p>{mn?'Идэвхтэй эрхтэй account-аар нэвтэрч материалыг нээнэ.':'Sign in with an account that has an active membership to access these resources.'}</p><Link className="button" href={user?`/membership?lang=${lang}`:`/account?lang=${lang}&next=${encodeURIComponent('/membership/resources?lang='+lang)}`}>{mn?(user?'Membership мэдээлэл':'Нэвтрэх'):(user?'Membership details':'Sign in')}</Link></section>}
    <Link href={`/membership?lang=${lang}`}>{mn?'Membership рүү буцах':'Back to membership'}</Link>
  </main>;
}
