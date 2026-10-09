import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const files=[...new Set(execFileSync('git',['ls-files','--cached','--others','--exclude-standard'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean))];
let secrets=[];try{secrets=readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>/^(ADMIN_PASSWORD|ADMIN_PASSWORD_HASH|ADMIN_TOTP_SECRET|SESSION_SECRET|BACKUP_KEY|SUPABASE_SERVICE_ROLE_KEY|WIRE_API_KEY|WIRE_WEBHOOK_SECRET)=/.test(l)).map(l=>l.slice(l.indexOf('=')+1).trim()).filter(s=>s.length>=12);}catch{}
const bad=[];for(const file of files){if(/^\.env(?!\.example$)|^\.data\/|^\.backups\/|^\.vercel\//.test(file))bad.push(file);const content=readFileSync(file);if(secrets.some(s=>content.includes(Buffer.from(s))))bad.push(file);}
if(bad.length){console.error('Release blocked: private data detected in '+[...new Set(bad)].join(', '));process.exit(1);}
console.log(`PASS: ${files.length} source files checked; private env/data/backup files excluded and configured secret values absent.`);
