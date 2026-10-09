import {test} from 'node:test';
import assert from 'node:assert/strict';
import {filterJobs,seedJobs,validateJob} from '../lib/jobs';
test('search combines category, eligibility and case-insensitive text',()=>{assert.equal(filterJobs(seedJobs,'PYTHON','Engineering','Asia-Pacific').length,1);assert.equal(filterJobs(seedJobs,'PYTHON','Design').length,0);});
test('pending jobs never appear in public results',()=>{assert.equal(filterJobs([{...seedJobs[0],status:'pending'}]).length,0);});
test('unsafe links, missing fields and unsupported categories are rejected',()=>{assert.throws(()=>validateJob({...seedJobs[0],applicationUrl:'javascript:alert(1)'}));assert.throws(()=>validateJob({...seedJobs[0],title:''}));assert.throws(()=>validateJob({...seedJobs[0],category:'Invalid category'}));assert.equal(validateJob({...seedJobs[0],title:'  Engineer  '}).title,'Engineer');});
