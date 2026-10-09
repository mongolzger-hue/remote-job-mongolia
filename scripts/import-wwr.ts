import {existsSync} from 'node:fs';
if(existsSync('.env.local'))process.loadEnvFile('.env.local');
async function main(){const {importWwr}=await import('../lib/import-wwr');const {getJobs}=await import('../lib/store');const {publicJobs}=await import('../lib/jobs');console.log(await importWwr());console.log('Public eligible jobs:',publicJobs(await getJobs()).length);}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
