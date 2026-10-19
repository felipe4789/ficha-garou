import assert from 'node:assert/strict';
import { connectAndroid } from '../scripts/android-cdp.mjs';
const cdp=await connectAndroid();
for(let i=0;i<50;i++){if(await cdp.evaluate('!!document.querySelector(".category-nav")'))break;await new Promise(r=>setTimeout(r,100));}
const before=await cdp.evaluate('Android.loadPreferences()');
const order=()=>cdp.evaluate('[...document.querySelectorAll(".category-nav [data-page]")].map(b=>b.dataset.page)');
try{
 const original=await order();
 const centers=await cdp.evaluate('[...document.querySelectorAll(".category-nav [data-page]")].map(b=>{const r=b.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[centers[0]]});
 await new Promise(r=>setTimeout(r,550));
 assert.equal(await cdp.evaluate('document.documentElement.classList.contains("reordering-nav")'),true,'Toque prolongado ativa o arraste');
 await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[centers[4]]});
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 assert.deepEqual(await order(),[...original.slice(1),original[0]]);
 assert.deepEqual(JSON.parse(await cdp.evaluate('Android.loadPreferences()')).navigationOrder,await order());
 assert.equal(await cdp.evaluate('document.querySelector("#character-title")!==null'),true,'Arrastar não navega por engano');
 await cdp.evaluate('location.reload();true');
 for(let i=0;i<50;i++){if(await cdp.evaluate('!!document.querySelector(".category-nav")'))break;await new Promise(r=>setTimeout(r,100));}
 assert.deepEqual(await order(),[...original.slice(1),original[0]]);
 console.log('PASS: segurar, arrastar, salvar ordem e restaurar ao reabrir no Android.');
}finally{await cdp.evaluate(`Android.savePreferences(${JSON.stringify(before)});location.reload();true`);cdp.close();}
