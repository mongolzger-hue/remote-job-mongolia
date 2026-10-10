import type {Job} from './jobs';
export const applicationStatuses=['saved','applied','interview','offer'] as const;
export function activeMembership(expiresAt:string|null|undefined,now=Date.now()){return !!expiresAt&&Number.isFinite(Date.parse(expiresAt))&&Date.parse(expiresAt)>now;}
// Imported listings are never sold as exclusive membership listings.
export function memberOnly(job:Pick<Job,'membersOnly'|'importInfo'>){return job.membersOnly===true&&!job.importInfo;}
// Keep source links public. Only reviewed sources use our sign-in apply flow.
export function applicationRequiresAccount(job:Pick<Job,'importInfo'>){return !job.importInfo||job.importInfo.source==='Himalayas';}
export function safeNext(value:string|null){return value?.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')&&!/[\u0000-\u0020]/.test(value)?value:'/account';}
export function paymentReference(value:unknown){if(typeof value!=='string')throw new Error('Invalid payment reference');const ref=value.trim().toUpperCase();if(ref.length<4||ref.length>80||!/^[A-Z0-9А-ЯӨҮЁ._ -]+$/u.test(ref))throw new Error('Invalid payment reference');return ref;}
