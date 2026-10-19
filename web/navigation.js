export const DEFAULT_NAVIGATION = ['overview','traits','gifts','combat','notes'];
export function normalizeNavigation(order) {
 return Array.isArray(order) && order.length===DEFAULT_NAVIGATION.length && new Set(order).size===order.length && order.every(key=>DEFAULT_NAVIGATION.includes(key)) ? order.slice() : DEFAULT_NAVIGATION.slice();
}
export function moveNavigation(order,from,to) {
 const result=normalizeNavigation(order),index=result.indexOf(from),target=result.indexOf(to);
 if(index<0||target<0||index===target)return result;
 result.splice(target,0,result.splice(index,1)[0]);return result;
}
export function installNavigationDrag({getOrder,onChange,onCommit,announce}) {
 let gesture=null,suppressClickUntil=0;
 const selector='.category-nav button[data-page], .sidebar .nav button[data-page]';
 const sync=order=>document.querySelectorAll('.category-nav,.sidebar .nav').forEach(nav=>order.forEach(key=>{const button=nav.querySelector(`[data-page="${key}"]`);if(button)nav.appendChild(button);}));
 function finish(cancel=false){
  if(!gesture)return;
  const g=gesture;clearTimeout(g.timer);gesture=null;
  document.documentElement.classList.remove('reordering-nav');g.button.classList.remove('dragging');
  if(g.active){suppressClickUntil=Date.now()+600;if(cancel){onChange(g.original);sync(g.original);}else{onCommit();announce(g.moved?'Ordem dos botões salva':'Segure e arraste um botão para mudar a ordem');}}
 }
 document.addEventListener('pointerdown',event=>{
  const button=event.target.closest(selector);if(!button||event.button!==0)return;
  finish(true);
  const g={button,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,original:getOrder().slice(),active:false,moved:false};
  gesture=g;
  g.timer=setTimeout(()=>{if(gesture!==g)return;g.active=true;button.classList.add('dragging');document.documentElement.classList.add('reordering-nav');try{button.setPointerCapture(g.pointerId);}catch{}announce('Arraste para reorganizar');},420);
 });
 document.addEventListener('pointermove',event=>{
  const g=gesture;if(!g||g.pointerId!==event.pointerId)return;
  if(!g.active){if(Math.hypot(event.clientX-g.startX,event.clientY-g.startY)>10)finish(true);return;}
  event.preventDefault();
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest(selector);
  if(!target||target===g.button||target.parentElement!==g.button.parentElement)return;
  const order=moveNavigation(getOrder(),g.button.dataset.page,target.dataset.page);
  g.moved=true;onChange(order);sync(order);try{g.button.setPointerCapture(g.pointerId);}catch{}
 },{passive:false});
 document.addEventListener('pointerup',event=>{if(gesture?.pointerId===event.pointerId)finish();});
 document.addEventListener('pointercancel',()=>finish(true));
 window.addEventListener('blur',()=>finish(true));
 document.addEventListener('click',event=>{if(Date.now()<suppressClickUntil&&event.target.closest(selector)){event.preventDefault();event.stopImmediatePropagation();}},true);
 document.addEventListener('contextmenu',event=>{if(event.target.closest(selector))event.preventDefault();});
 document.addEventListener('keydown',event=>{
  const button=event.target.closest(selector);if(!button||!event.altKey||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  const order=getOrder(),index=order.indexOf(button.dataset.page),offset=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1,target=order[index+offset];
  if(!target)return;event.preventDefault();const next=moveNavigation(order,button.dataset.page,target);onChange(next);sync(next);button.focus();onCommit();announce('Ordem dos botões salva');
 });
}
