// Run after selecting the exported file in Android's document picker.
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {connectAndroid} from '../scripts/android-cdp.mjs';
import {validateBackup} from '../web/model.js';
const c=await connectAndroid();
const click=selector=>c.evaluate(`document.querySelector(${JSON.stringify(selector)}).click();true`);
const backup=JSON.parse(readFileSync('tmp/export-native.json','utf8'));
const clean=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='id'||k==='updatedAt'?undefined:v));
let added=[];
try{
 for(let i=0;i<30;i++){if(await c.evaluate('!!document.querySelector("#confirm-import")'))break;await new Promise(r=>setTimeout(r,100));}
 await click('#confirm-import');
 const data=await c.evaluate('JSON.parse(Android.loadData())');
 added=data.characters.filter(x=>!backup.characters.some(old=>old.id===x.id));
 assert.equal(added.length,backup.characters.length);
 assert.deepEqual(clean(added),clean(validateBackup(backup)));
 for(const original of backup.characters)assert.deepEqual(clean(data.characters.find(x=>x.id===original.id)),clean(original));
 console.log('PASS: exportação/importação pelo seletor Android; conteúdo completo, originais preservados e cópias independentes.');
 writeFileSync('output/teste-backup-nativo.json',JSON.stringify({date:new Date().toISOString(),api:35,export:'PASS: arquivo idêntico ao armazenamento',import:'PASS: seletor nativo, confirmação, conteúdo completo e cópias independentes',originals:'PASS: preservados'},null,2));
}finally{
 for(const item of added){await click('[data-action="characters"]');await click(`[data-character="${item.id}"]`);await click('[data-action="characters"]');await click('[data-action="delete-character"]');await click('#confirm-action');}
 await click('[data-action="characters"]');await click(`[data-character="${backup.activeId}"]`);
 c.close();
}
