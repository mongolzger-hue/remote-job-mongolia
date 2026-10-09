import {NextRequest,NextResponse} from 'next/server';
import {createServerClient,type CookieOptions} from '@supabase/ssr';
export async function proxy(request:NextRequest){
 const nonce=Buffer.from(crypto.randomUUID()).toString('base64'),dev=process.env.NODE_ENV==='development';
 const csp=`default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev?" 'unsafe-eval'":''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'${dev?' ws: wss:':''}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'${dev?'':'; upgrade-insecure-requests'}`;
 const refreshed:{name:string;value:string;options:CookieOptions}[]=[];
 if(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY&&request.cookies.getAll().some(c=>c.name.startsWith('sb-'))){
  const client=createServerClient(process.env.SUPABASE_URL,process.env.SUPABASE_PUBLISHABLE_KEY,{cookieOptions:{httpOnly:true,secure:!dev,sameSite:'lax',path:'/'},cookies:{getAll:()=>request.cookies.getAll(),setAll:values=>{values.forEach(item=>{request.cookies.set(item.name,item.value);refreshed.push(item);});}}});
  await client.auth.getUser();
 }
 const headers=new Headers(request.headers);headers.set('x-rjm-lang',request.nextUrl.searchParams.get('lang')==='mn'?'mn':'en');headers.set('x-nonce',nonce);headers.set('Content-Security-Policy',csp);
 const response=NextResponse.next({request:{headers}});refreshed.forEach(({name,value,options})=>response.cookies.set(name,value,options));
 response.headers.set('Content-Security-Policy',csp);response.headers.set('X-Content-Type-Options','nosniff');response.headers.set('X-Frame-Options','DENY');response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(), payment=()');if(!dev)response.headers.set('Strict-Transport-Security','max-age=31536000; includeSubDomains');
 if(request.cookies.getAll().some(c=>c.name.startsWith('sb-'))||/^\/(admin|api|account|auth|membership|apply)(\/|$)/.test(request.nextUrl.pathname))response.headers.set('Cache-Control','private, no-store');
 if(/^\/(admin|api|account|auth|apply)(\/|$)/.test(request.nextUrl.pathname))response.headers.set('X-Robots-Tag','noindex, nofollow');return response;
}
export const config={matcher:['/((?!_next/static|_next/image|favicon.svg).*)']};
