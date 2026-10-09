import Admin from '@/components/admin';
import {isAdmin,authConfigured} from '@/lib/auth';
import {getJobs} from '@/lib/store';
import {language} from '@/lib/i18n';
export const dynamic='force-dynamic';
export const metadata={title:'Admin',robots:{index:false,follow:false}};
export default async function AdminPage({searchParams}:{searchParams:Promise<{lang?:string}>}){const authenticated=await isAdmin();return <main className="shell admin-page"><Admin twoFactor={authConfigured()} lang={language((await searchParams).lang)} authenticated={authenticated} jobs={authenticated?await getJobs():[]}/></main>}
