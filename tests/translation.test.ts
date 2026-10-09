import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mongolianTranslationUrl} from '../lib/translation';
test('Mongolian translation opens the full public job page, preserving the source URL',()=>{
 const source='https://remote-job-mongolia-1gys.vercel.app/jobs/job-123?lang=en';
 const target=new URL(mongolianTranslationUrl(source));
 assert.equal(target.origin,'https://translate.google.com');
 assert.equal(target.pathname,'/translate');
 assert.equal(target.searchParams.get('tl'),'mn');
 assert.equal(target.searchParams.get('sl'),'auto');
 assert.equal(target.searchParams.get('u'),source);
 assert.throws(()=>mongolianTranslationUrl('javascript:alert(1)'));
 assert.throws(()=>mongolianTranslationUrl('https://user:secret@example.com/jobs/123'));
});
