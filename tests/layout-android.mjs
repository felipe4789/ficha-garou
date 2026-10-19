// Regression checks for the two actual clipping issues reported by the user.
import assert from 'node:assert/strict';
import {connectAndroid} from '../scripts/android-cdp.mjs';
const c=await connectAndroid();
for(let i=0;i<40;i++){if(await c.evaluate('!!document.querySelector(".resource-line")'))break;await new Promise(r=>setTimeout(r,100));}
await c.evaluate('document.querySelector(".category-nav [data-page=overview]").click();true');
try{
 for(const width of [320,360,393,600,720,800,1024,1280]){
  await c.send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:2.75,mobile:true});
  const result=await c.evaluate(`(()=>{
   const out=[];
   for(const b of document.querySelectorAll('.resource-line .dot')){const r=b.getBoundingClientRect(),card=b.closest('.card').getBoundingClientRect();if(r.left<card.left+10||r.right>card.right-10)out.push({marker:b.getAttribute('aria-label'),left:r.left,right:r.right,card:card.right});}
   const b=document.querySelector('.character-select'),t=b.querySelector('span'),r=b.getBoundingClientRect(),h=b.closest('.topbar').getBoundingClientRect();
   return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,out,label:t.textContent,clipped:t.scrollWidth>t.clientWidth+1,buttonFits:r.right<=h.right+1};
  })()`);
  assert.equal(result.width,width);assert.equal(result.scrollWidth,width);assert.deepEqual(result.out,[],JSON.stringify(result));assert.equal(result.label,'Meus personagens');assert.equal(result.clipped,false);assert.equal(result.buttonFits,true);
  console.log('PASS: marcadores e texto completos em '+width+' px.');
 }
}finally{await c.send('Emulation.clearDeviceMetricsOverride');c.close();}
