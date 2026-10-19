import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
export const adb = fileURLToPath(new URL('../.tools/sdk/platform-tools/adb.exe', import.meta.url));
export const runAdb = (...args) => execFileSync(adb, args, {encoding:'utf8'}).trim();
export async function connectAndroid() {
 let target;
 for(let attempt=0;attempt<50;attempt++){
  try{
   const pid=runAdb('shell','pidof','br.com.fichagarou');
   runAdb('forward','tcp:9222','localabstract:webview_devtools_remote_'+pid);
   const targets=await (await fetch('http://127.0.0.1:9222/json')).json();
   target=targets.find(t=>t.url.includes('appassets.androidplatform.net'));
   if(target)break;
  }catch{}
  await new Promise(r=>setTimeout(r,250));
 }
 if(!target)throw Error('WebView da ficha não encontrado');
 const ws=new WebSocket(target.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let id=0;const pending=new Map();const errors=[];
 ws.onmessage=e=>{const msg=JSON.parse(e.data);if(msg.id){const handler=pending.get(msg.id);if(handler){pending.delete(msg.id);msg.error?handler.reject(Error(msg.error.message)):handler.resolve(msg.result);}}else if(msg.method==='Runtime.exceptionThrown')errors.push(msg.params.exceptionDetails);};
 const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});
 await send('Runtime.enable');
 return {send,errors,close:()=>ws.close(),async evaluate(expression){const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;}};
}
