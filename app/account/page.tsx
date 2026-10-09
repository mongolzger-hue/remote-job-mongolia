import Link from 'next/link';
import Account from '@/components/account';
import SavedJobs from '@/components/saved-jobs';
import {memberUser,memberDb,membershipFor,signupEnabled} from '@/lib/member';
import {getJobs} from '@/lib/store';
import {publicJobs} from '@/lib/jobs';
import {language} from '@/lib/i18n';
export const dynamic='force-dynamic';
export const metadata={title:'Account | Remote Job Mongolia',robots:{index:false,follow:false}};
export default async function AccountPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){const p=await searchParams,lang=language(p.lang),mn=lang==='mn',user=await memberUser(),membership=user?await membershipFor(user.id):null;const records=user?await memberDb().from('member_saved_jobs').select('job_id,status').eq('user_id',user.id):null;if(records?.error)throw new Error('Saved jobs unavailable');return <main className="shell account-page"><div className="page-heading"><span className="eyebrow">REMOTE JOB MONGOLIA</span><h1>{mn?'Миний account':'My account'}</h1><p>{mn?'Бүртгэл үнэгүй. Membership эрхийг тусад нь авна.':'Registration is free. Membership is a separate purchase.'}</p></div><Account lang={lang} email={user?.email} name={typeof user?.user_metadata.display_name==='string'?user.user_metadata.display_name:undefined} signupOpen={signupEnabled()} reset={p.reset==='1'} next={p.next} authError={p.authError==='1'}/>{user&&<><section className="panel"><h2>Membership</h2><p>{membership?.active?(mn?'Идэвхтэй — дуусах хугацаа: ':'Active — expires: ')+(new Date(membership.expiresAt).toLocaleDateString(mn?'mn-MN':'en-US',{timeZone:'Asia/Ulaanbaatar'})):(mn?'Идэвхтэй membership алга.':'No active membership.')}</p><Link className="button" href={`/membership?lang=${lang}`}>{mn?'Membership үзэх':'View membership'}</Link></section><SavedJobs jobs={publicJobs(await getJobs()).map(({id,title,company})=>({id,title,company}))} records={records?.data||[]} lang={lang}/></>}</main>;}
