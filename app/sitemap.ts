import type {MetadataRoute} from 'next';
import {getJobs} from '@/lib/store';
import {publicJobs} from '@/lib/jobs';
import {origin,pageUrl} from '@/lib/seo';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const paths=['/','/post','/privacy','/terms',...publicJobs(await getJobs()).map(j=>`/jobs/${j.id}`)];return paths.flatMap(path=>(['en','mn'] as const).map(lang=>({url:pageUrl(path,lang),alternates:{languages:{en:pageUrl(path,'en'),mn:pageUrl(path,'mn'),'x-default':`${origin()}${path}`}}})));}
