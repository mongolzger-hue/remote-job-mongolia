import 'server-only';
import {cookies} from 'next/headers';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {activeMembership} from './member-policy';
export const memberConfigured=()=>!!(process.env.SUPABASE_URL&&process.env.SUPABASE_PUBLISHABLE_KEY);
export const signupEnabled=()=>memberConfigured()&&process.env.MEMBER_SIGNUP_ENABLED==='true';
export async function memberClient(){if(!memberConfigured())throw new Error('Member authentication is not configured');const jar=await cookies();return createServerClient(process.env.SUPABASE_URL!,process.env.SUPABASE_PUBLISHABLE_KEY!,{cookieOptions:{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'},cookies:{getAll:()=>jar.getAll(),setAll:values=>{try{values.forEach(({name,value,options})=>jar.set(name,value,options));}catch{/* Proxy refreshes cookies before server components render. */}}}});}
export function memberDb(){if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Database unavailable');return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});}
export async function memberUser(){if(!memberConfigured())return null;const client=await memberClient();const {data,error}=await client.auth.getUser();return error||!data.user?.email_confirmed_at?null:data.user;}
export async function membershipFor(userId:string){const {data,error}=await memberDb().from('memberships').select('expires_at').eq('user_id',userId).maybeSingle();if(error)throw new Error('Membership lookup failed');return {expiresAt:data?.expires_at??null,active:activeMembership(data?.expires_at)};}
export async function membershipPlan(){const {data,error}=await memberDb().from('membership_settings').select('amount,duration_days,bank_name,account_number,account_name,refund_policy,enabled').eq('id',1).single();if(error)throw new Error('Membership plan unavailable');return data as {amount:number;duration_days:number;bank_name:string;account_number:string;account_name:string;refund_policy:string;enabled:boolean};}
