import { connectAndroid } from './android-cdp.mjs';
const cdp=await connectAndroid();
console.log(await cdp.evaluate('JSON.stringify({title:document.title,viewport:[innerWidth,innerHeight],version:navigator.userAgent,body:document.body.innerText.slice(0,1800)},null,2)'));
cdp.close();
