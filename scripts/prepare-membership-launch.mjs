// Explicit owner-authorized plan settings. Does not enable public Wire payments.
import {readFile} from 'node:fs/promises';
import {createClient} from '@supabase/supabase-js';
for(const line of (await readFile('.env.local','utf8')).split(/\r?\n/)){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,'');}
const db=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
const refund='10,000₮ / 30 хоногийн membership. Англи CV, cover letter загвар бэлдэх хэрэгсэл, customer support дадлага болон өргөдлийн шалгах хуудас ашиглана. Нэг удаагийн төлбөр; автоматаар сунгахгүй. Эрх төлбөр баталгаажсан өдрөөс 30 хоног үргэлжилнэ. Төлбөр буцаалтгүй. Ажилд орох баталгаа биш. Импортын зарын apply холбоос үнэгүй хэвээр. Тусламж: mongolzger@gmail.com.';
const result=await db.from('membership_settings').update({amount:10000,duration_days:30,refund_policy:refund}).eq('id',1).select('amount,duration_days,refund_policy').single();
if(result.error)throw new Error('Membership settings update failed');
console.log(JSON.stringify(result.data));
