import {test} from 'node:test';
import assert from 'node:assert/strict';
import {minorAmount,checkoutUrl,matchesPayment} from '../lib/wire-policy';
test('MNT pricing uses 100 minor units per tugrik',()=>{assert.equal(minorAmount(10000),1000000);assert.throws(()=>minorAmount(1.5));});
test('checkout redirects accept only hosted Wire checkout',()=>{assert.equal(checkoutUrl('https://pay.wire.mn/c/token'),'https://pay.wire.mn/c/token');for(const url of ['https://evil.test/c/token','http://pay.wire.mn/c/token','https://pay.wire.mn.evil.test/c/x','https://user:pw@pay.wire.mn/c/x'])assert.throws(()=>checkoutUrl(url));});
test('payment must match amount, currency, order, intent and mode',()=>{const order={id:'order',wire_intent:'pi_1',amount:10000},pi={id:'pi_1',amount:1000000,currency:'MNT',status:'succeeded',livemode:true,metadata:{order_id:'order'}};assert.equal(matchesPayment(pi,order,true),true);for(const change of [{amount:10000},{currency:'USD'},{livemode:false},{id:'pi_2'},{metadata:{order_id:'other'}}])assert.equal(matchesPayment({...pi,...change},order,true),false);});

import {createHmac} from 'node:crypto';
import {verifyWireSignature} from '../lib/wire-signature';
test('Webhook rejects tampering, expired signatures and missing secrets',()=>{const raw=Buffer.from('{\"type\":\"payment_intent.succeeded\"}'),secret='test-secret',now=1700000000000,t=String(now/1000);const sig=createHmac('sha256',secret).update(t+'.').update(raw).digest('hex'),header='t='+t+',v1='+sig;assert.equal(verifyWireSignature(raw,header,secret,now),true);assert.equal(verifyWireSignature(Buffer.from('tampered'),header,secret,now),false);assert.equal(verifyWireSignature(raw,header,secret,now+301000),false);assert.equal(verifyWireSignature(raw,header,'',now),false);});
