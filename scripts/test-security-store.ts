import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
async function main(){
const previous=process.cwd(),directory=await mkdtemp(path.join(tmpdir(),'rjm-security-'));process.chdir(directory);
try{const {consumeLimit,session}=await import('../lib/security-store');assert.equal(await consumeLimit('test',1,60000),true);assert.equal(await consumeLimit('test',1,60000),false);assert.equal(await consumeLimit('different',1,60000),true);await session('create','test-token',Date.now()+60000);assert.equal(await session('check','test-token'),true);await session('delete','test-token');assert.equal(await session('check','test-token'),false);assert.equal(await session('check','forged-token'),false);console.log('PASS: durable rate limit, session check, revocation and forged-session rejection');}finally{process.chdir(previous);await rm(directory,{recursive:true,force:true});}

}
main().catch(e=>{console.error(e);process.exitCode=1;});
