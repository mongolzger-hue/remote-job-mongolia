import {NextResponse} from 'next/server';
import {memberClient} from '@/lib/member';
import {safeNext} from '@/lib/member-policy';
export async function GET(request:Request){const url=new URL(request.url),code=url.searchParams.get('code'),origin=process.env.SITE_URL||url.origin;
 if(code){try{const client=await memberClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeNext(url.searchParams.get('next')),origin));}catch{}}
 return NextResponse.redirect(new URL('/account?authError=1',origin));
}
