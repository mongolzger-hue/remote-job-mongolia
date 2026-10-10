'use client';

import {Analytics} from '@vercel/analytics/next';

export default function SiteAnalytics(){
 return <Analytics debug={false} beforeSend={event=>{
  const url=new URL(event.url);
  if(/^\/(admin|api|account|auth|membership|apply)(\/|$)/.test(url.pathname))return null;
  const allowed=new Set(['lang','utm_source','utm_medium','utm_campaign']);
  for(const key of Array.from(url.searchParams.keys()))if(!allowed.has(key))url.searchParams.delete(key);
  url.hash='';
  return {...event,url:url.toString()};
 }}/>;
}
