import {existsSync} from 'node:fs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
async function main(){const {importAdditional}=await import('../lib/import-additional');const source=process.argv[2];if(!['himalayas','jobicy','remoteok'].includes(source))throw new Error('Select himalayas, jobicy or remoteok');console.log(await importAdditional(source as 'himalayas'|'jobicy'|'remoteok'));const {getJobs}=await import('../lib/store');const {publicJobs}=await import('../lib/jobs');console.log('Public jobs:',publicJobs(await getJobs()).length);}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
