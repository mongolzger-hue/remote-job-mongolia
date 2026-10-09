import 'server-only';
import {cookies} from 'next/headers';
import {randomBytes,createHmac} from 'node:crypto';
import {safeEqual,verifyPassword,verifyTotp} from './crypto';
import {consumeLimit,session} from './security-store';
export const authCookie='rjm-admin';
export const authConfigured=()=>Boolean(process.env.ADMIN_USERNAME&&process.env.ADMIN_PASSWORD_HASH&&process.env.ADMIN_TOTP_SECRET&&process.env.SESSION_SECRET);
export function password(){return process.env.ADMIN_PASSWORD||(process.env.NODE_ENV==='development'?'local-demo-admin':'');}
function signature(value:string){return createHmac('sha256',process.env.SESSION_SECRET||password()).update(value).digest('hex');}
export async function authenticate(username:string,input:string,code:string){if(authConfigured()){if(!safeEqual(username,process.env.ADMIN_USERNAME!)||!verifyPassword(input,process.env.ADMIN_PASSWORD_HASH!))return false;const step=verifyTotp(process.env.ADMIN_TOTP_SECRET!,code);return step!==null&&await consumeLimit(`totp:${process.env.ADMIN_USERNAME}:${step}`,1,90000);}return process.env.NODE_ENV==='development'&&safeEqual(input,password());}
export async function createSession(){const value=`${randomBytes(32).toString('hex')}.${Date.now()+8*60*60*1000}`;const token=`${value}.${signature(value)}`;await session('create',token,Number(value.split('.')[1]));return token;}
export async function isAdmin(){if(process.env.NODE_ENV==='production'&&!authConfigured())return false;const token=(await cookies()).get(authCookie)?.value||'';const [id,expiry,sig]=token.split('.');if(!id||!expiry||!sig||Number(expiry)<=Date.now()||!safeEqual(signature(`${id}.${expiry}`),sig))return false;return session('check',token);}
export async function revokeSession(){const token=(await cookies()).get(authCookie)?.value;if(token)await session('delete',token);(await cookies()).delete(authCookie);}
