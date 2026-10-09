import {createHash} from 'node:crypto';
import {memberClient,memberUser,signupEnabled} from '@/lib/member';
import {body,sameOrigin,HttpError,errorResponse} from '@/lib/http';
import {consumeLimit} from '@/lib/security-store';
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:'Forbidden'},{status:403});
 try{
  const data=await body(request),action=data.action;
  if(!['login','signup','forgot','password','profile','logout'].includes(String(action)))throw new HttpError(400,'Invalid action');
  if(!await consumeLimit('member-auth',100,60000))throw new HttpError(429,'Try again later');
  const client=await memberClient();
  if(action==='logout'){const {error}=await client.auth.signOut({scope:'local'});if(error)throw new HttpError(503,'Unable to sign out');return Response.json({ok:true});}
  if(action==='profile'){if(!await memberUser())throw new HttpError(401,'Sign in required');if(typeof data.name!=='string'||data.name.trim().length<1||data.name.length>80)throw new HttpError(400,'Invalid name');const {error}=await client.auth.updateUser({data:{display_name:data.name.trim()}});if(error)throw new HttpError(400,'Unable to update profile');return Response.json({ok:true});}
  if(action==='password'){if(!await memberUser())throw new HttpError(401,'Sign in required');if(typeof data.password!=='string'||data.password.length<12||data.password.length>128)throw new HttpError(400,'Use a password of 12–128 characters');const {error}=await client.auth.updateUser({password:data.password});if(error)throw new HttpError(400,'Unable to update password');return Response.json({ok:true});}
  if(typeof data.email!=='string'||data.email.length>254||!/^\S+@\S+\.\S+$/.test(data.email))throw new HttpError(400,'Invalid email');
  const email=data.email.trim().toLowerCase();const emailBucket=createHash('sha256').update(email).digest('hex');
  if(!await consumeLimit(`member-auth:${emailBucket}`,action==='login'?10:3,action==='login'?60000:3600000))throw new HttpError(429,'Try again later');
  const origin=process.env.SITE_URL||new URL(request.url).origin;
  if(action==='forgot'){if(!signupEnabled())throw new HttpError(503,'Email delivery is not configured');const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:origin+'/auth/callback?next=/account?reset=1'});if(error)throw new HttpError(503,'Unable to send email');return Response.json({ok:true,message:'If this account exists, a reset email will be sent.'});}
  if(typeof data.password!=='string'||data.password.length<12||data.password.length>128)throw new HttpError(400,'Use a password of 12–128 characters');
  if(action==='signup'){
   if(!signupEnabled())throw new HttpError(503,'Registration will open after email delivery is configured');
   if(data.acceptTerms!==true)throw new HttpError(400,'Accept the terms and privacy notice');
   const {error}=await client.auth.signUp({email,password:data.password,options:{emailRedirectTo:origin+'/auth/callback',data:{terms_version:'2026-10-09'}}});
   if(error)throw new HttpError(400,'Unable to register; check your details or sign in');
   return Response.json({ok:true,message:'Check your email to confirm your account.'});
  }
  const {data:login,error}=await client.auth.signInWithPassword({email,password:data.password});
  if(error||!login.user?.email_confirmed_at)throw new HttpError(401,'Invalid credentials or email not confirmed');
  return Response.json({ok:true});
 }catch(e){return errorResponse(e,'Account service unavailable');}
}
