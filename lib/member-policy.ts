import type {Job} from './jobs';
export const applicationStatuses=['saved','applied','interview','offer'] as const;
export function activeMembership(expiresAt:string|null|undefined,now=Date.now()){return !!expiresAt&&Number.isFinite(Date.parse(expiresAt))&&Date.parse(expiresAt)>now;}
// Public feed terms require source links to remain available without registration.
export function memberOnly(job:Pick<Job,'membersOnly'|'importInfo'>){return job.membersOnly===true&&!job.importInfo;}
export function safeNext(value:string|null){return value?.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\')&&!/[\u0000-\u0020]/.test(value)?value:'/account';}
export function paymentReference(value:unknown){if(typeof value!=='string')throw new Error('Invalid payment reference');const ref=value.trim().toUpperCase();if(ref.length<4||ref.length>80||!/^[A-Z0-9А-ЯӨҮЁ._ -]+$/u.test(ref))throw new Error('Invalid payment reference');return ref;}
