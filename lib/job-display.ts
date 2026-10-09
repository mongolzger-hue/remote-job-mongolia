import type {Lang} from './i18n';
export function jobDate(value:string,lang:Lang){const date=new Date(value);return Number.isFinite(date.getTime())?new Intl.DateTimeFormat(lang==='mn'?'mn-MN':'en-GB',{year:'numeric',month:'short',day:'numeric',timeZone:'Asia/Ulaanbaatar'}).format(date):null;}
export function applicationHost(value:string){try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.hostname.replace(/^www\./,''):null;}catch{return null;}}
