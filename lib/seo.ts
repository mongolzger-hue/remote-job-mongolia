import type {Metadata} from 'next';
import {Lang} from './i18n';
export const origin=()=>new URL(process.env.SITE_URL||'http://localhost:3000').origin;
export function pageUrl(path:string,lang:Lang){return `${origin()}${path}${lang==='mn'?'?lang=mn':''}`;}
export function seo(path:string,lang:Lang,title:string,description:string,index=true):Metadata{const url=pageUrl(path,lang);return {title,description,alternates:{canonical:url,languages:{en:pageUrl(path,'en'),mn:pageUrl(path,'mn'),'x-default':pageUrl(path,'en')}},robots:{index,follow:true},openGraph:{type:'website',siteName:'Remote Job Mongolia',title,description,url,locale:lang==='mn'?'mn_MN':'en_US',alternateLocale:lang==='mn'?'en_US':'mn_MN'},twitter:{card:'summary',title,description}};}
