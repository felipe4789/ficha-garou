import assert from 'node:assert/strict';
import {connectAndroid,runAdb} from '../scripts/android-cdp.mjs';
const c=await connectAndroid();
const ev=expression=>c.evaluate(expression);
const click=selector=>ev(`document.querySelector(${JSON.stringify(selector)}).click();true`);
const fill=(selector,value)=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.value=${JSON.stringify(value)};e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()`);
for(let i=0;i<50;i++){if(await ev('!!document.querySelector(".form-nav")'))break;await new Promise(r=>setTimeout(r,100));}
await click('[data-form="Hominídeo"]');const before=await ev('Android.loadData()');
const char=()=>ev('(()=>{const d=JSON.parse(Android.loadData());return d.characters.find(c=>c.id===d.activeId);})()');
try{
 await click('[data-action="characters"]');await click('[data-action="new"]');await fill('[data-field="name"]','QA · Catálogo');
 await click('.category-nav [data-page="gifts"]');await click('[data-add="gifts"]');
 assert.equal(await ev('document.querySelectorAll(".catalog-option").length'),196);
 await fill('#catalog-search','persuasao');assert.equal(await ev('document.querySelectorAll(".catalog-option").length'),1);
 await click('[data-catalog-select="gift-persuasao-1"]');assert.equal(await ev('document.querySelector("[name=level]").value'),'1');
 await ev('document.querySelector("#item-form").requestSubmit();true');assert.equal((await char()).gifts[0].name,'Persuasão');
 await click('[data-add="gifts"]');await fill('#catalog-search','persuasao');assert.equal(await ev('document.querySelector(".catalog-option").disabled'),true);
 await fill('#catalog-search','nada-inexistente');assert.equal(await ev('document.querySelectorAll(".catalog-option").length'),0);
 await click('dialog [data-action="close"]');await click('[data-spirit-tab="rituals"]');await click('[data-add="rituals"]');
 assert.equal(await ev('document.querySelectorAll(".catalog-option").length'),40);
 await fill('#catalog-search','novo despertar');await click('[data-catalog-select="ritual-ritual-do-novo-despertar"]');
 assert.equal(await ev('document.querySelector("[name=level]").value'),'');await ev('document.querySelector("#item-form").requestSubmit();true');assert.equal((await char()).rituals[0].level,null);
 await click('[data-add="rituals"]');await fill('#catalog-search','halito');await click('[data-catalog-select="ritual-halito-de-gaia"]');await ev('document.querySelector("#item-form").requestSubmit();true');assert.equal((await char()).rituals[1].origin,'Pequeno ritual');
 await click('[data-add="rituals"]');runAdb('shell','screencap','-p','/sdcard/catalogo.png');runAdb('pull','/sdcard/catalogo.png','output/android-catalogo.png');
 assert.equal(await ev('document.documentElement.scrollWidth<=innerWidth'),true);
 assert.equal(c.errors.length,0);console.log('PASS: catálogo alfabético, busca sem acentos, seleção, duplicatas, 40 rituais e nível omitido no Android.');
}finally{await ev(`Android.saveData(${JSON.stringify(before)});location.reload();true`);c.close();}
