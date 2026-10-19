import {ATTRIBUTES,SKILLS,uid} from './model.js';
import {CATALOG,catalogDefaults} from './catalog.js';
export const TRIBES=['Andarilhos do Asfalto','Cria de Fenris','Fianna','Filhos de Gaia','Fúrias Negras','Garras Vermelhas','Portadores da Luz','Peregrinos Silenciosos','Presas de Prata','Roedores de Ossos','Senhores das Sombras','Uktena','Wendigo'];
export const AUSPICES=['Ragabash','Theurge','Philodox','Galliard','Ahroun'];
export const BACKGROUNDS=['Aliados','Contatos','Fetiche','Parente','Mentor','Vida Passada','Raça Pura','Recursos','Rituais','Totem'];
const forbidden={ 'Roedores de Ossos':['Vida Passada','Raça Pura','Recursos'],'Cria de Fenris':['Contatos','Mentor'],'Andarilhos do Asfalto':['Mentor','Vida Passada','Raça Pura'],'Garras Vermelhas':['Aliados','Contatos','Recursos'],'Senhores das Sombras':['Aliados','Mentor'],'Peregrinos Silenciosos':['Vida Passada','Recursos'],'Portadores da Luz':['Aliados','Fetiche','Recursos'],'Wendigo':['Contatos','Recursos'] };
const wolfRestricted=['Condução','Protocolo','Armas de Fogo','Computador','Direito','Linguística','Medicina','Política','Ciência'];
const clone=c=>JSON.parse(JSON.stringify(c));
const fail=m=>{throw Error(m);};
const alias=s=>s==='Philodox'?'Filodox':s;
export const guided=c=>c.creation?.mode==='points';
export const creating=c=>guided(c)&&c.creation.stage!=='complete';
export function beginCreation(c){c.creation={mode:'points',stage:'identity',attributeOrder:Object.keys(ATTRIBUTES),skillOrder:Object.keys(SKILLS),bonusSpent:0,purchases:[]};return c;}
export function allowedBackground(c,name){return BACKGROUNDS.includes(name)&&!(forbidden[c.tribe]||[]).includes(name);}
export function originGifts(c,kind){const group=alias(({Raça:c.breed,Augúrio:c.auspice,Tribo:c.tribe})[kind]);return CATALOG.gifts.filter(g=>g.level===1&&g.references.some(r=>r.kind===kind&&r.group===group));}
export function creationRemaining(c,group){const groups=group==='attributes'?ATTRIBUTES:SKILLS,order=c.creation[group==='attributes'?'attributeOrder':'skillOrder'],budgets=group==='attributes'?[7,5,3]:[13,9,5];return order.map((name,i)=>({name,remaining:budgets[i]-groups[name].reduce((sum,key)=>sum+c[group][key]-(group==='attributes'?1:0),0)}));}
export function setCreationRating(c,group,key,value){
 if(!creating(c))fail('A criação já foi concluída.');
 const next=clone(c),stage=c.creation.stage;
 if(stage===group&&['attributes','skills'].includes(group)){
  const min=group==='attributes'?1:0,max=group==='attributes'?5:3;
  if(!Object.hasOwn(c[group],key)||!Number.isInteger(value)||value<min||value>max)fail(`Nesta etapa, o limite é ${min} a ${max}.`);
  if(group==='skills'&&c.breed==='Lupino'&&wolfRestricted.includes(key)&&value)fail('Lupinos só podem adquirir esta habilidade com pontos de bônus ou XP (p. 87).');
  next[group][key]=value;if(creationRemaining(next,group).some(g=>g.remaining<0))fail('Não há pontos suficientes nesta categoria.');
 }else if(stage==='advantages'&&group==='backgrounds'){
  if(!allowedBackground(c,key))fail('Antecedente indisponível para esta tribo.');
  if(!Number.isInteger(value)||value<0||value>5)fail('Nível inválido.');
  next.backgrounds=next.backgrounds.filter(x=>x.name!==key);if(value)next.backgrounds.push({id:uid(),name:key,level:value});
  if(next.backgrounds.reduce((s,x)=>s+x.level,0)>5)fail('São cinco pontos de antecedentes.');
 }else fail('Use a etapa correspondente da criação.');return next;
}
export function advanceCreation(c){const next=clone(c),s=next.creation;
 if(s.stage==='identity'){
  if(!['Hominídeo','Impuro','Lupino'].includes(c.breed)||!AUSPICES.includes(c.auspice)||!TRIBES.includes(c.tribe)||!c.concept.trim())fail('Preencha conceito, raça, augúrio e tribo.');
  if(c.tribe==='Garras Vermelhas'&&c.breed!=='Lupino')fail('Garras Vermelhas são de raça Lupina (p. 97).');
  s.stage='attributes';
 }else if(s.stage==='attributes'||s.stage==='skills'){
  if(creationRemaining(c,s.stage).some(g=>g.remaining!==0))fail('Distribua todos os pontos desta etapa antes de continuar.');
  s.stage=s.stage==='attributes'?'skills':'advantages';
 }else if(s.stage==='advantages'){
  if(c.backgrounds.reduce((sum,x)=>sum+x.level,0)!==5)fail('Distribua os cinco pontos de antecedentes.');
  if(c.tribe==='Presas de Prata'&&(c.backgrounds.find(x=>x.name==='Raça Pura')?.level||0)<3)fail('Presas de Prata exigem pelo menos três pontos em Raça Pura.');
  if(!s.giftSlots||Object.keys(s.giftSlots).length!==3)fail('Escolha um dom de raça, um de augúrio e um de tribo.');
  if(c.auspice==='Ragabash'&&Object.values(c.renown).reduce((sum,r)=>sum+r.permanent,0)!==3)fail('Distribua três pontos de renome.');
  const rage=AUSPICES.indexOf(c.auspice)+1,gnosis=({Hominídeo:1,Impuro:3,Lupino:5})[c.breed],will=({'Roedores de Ossos':4,'Filhos de Gaia':4,'Portadores da Luz':5,Wendigo:4})[c.tribe]||3;
  for(const [key,value]of Object.entries({'Fúria':rage,'Gnose':gnosis,'Força de Vontade':will}))next.resources[key]={permanent:value,current:value};
  if(c.auspice!=='Ragabash'){const initial=({Theurge:[0,0,3],Philodox:[0,3,0],Galliard:[2,0,1],Ahroun:[2,1,0]})[c.auspice];Object.values(next.renown).forEach((r,i)=>{r.permanent=initial[i];r.current=0;});}
  next.rank=1;s.stage='bonus';
 }else if(s.stage==='bonus'){
  if(s.bonusSpent!==15)fail('Gaste os 15 pontos de bônus antes de concluir.');
  if(c.breed==='Impuro'&&!c.deformity.trim())fail('Registre a deformidade obrigatória do Impuro.');
  const pool=(c.backgrounds.find(x=>x.name==='Rituais')?.level||0),cost=c.rituals.reduce((sum,x)=>sum+(x.level===0?.5:x.level),0);
  if(cost!==pool||c.rituals.some(r=>r.level===null||r.level>c.skills.Rituais))fail('Escolha os rituais concedidos pelo antecedente Rituais, respeitando Conhecimento Rituais.');
  for(const resource of Object.values(next.resources))resource.current=resource.permanent;
  s.stage='complete';s.purchases=[];
 }else fail('Etapa inválida.');return next;
}
export function chooseInitialGift(c,kind,id){const next=clone(c),gift=originGifts(c,kind).find(g=>g.id===id);if(c.creation.stage!=='advantages'||!gift)fail('Dom inicial inválido.');next.creation.giftSlots||={};next.creation.giftSlots[kind]=id;const choices=Object.values(next.creation.giftSlots);if(new Set(choices).size!==choices.length)fail('Escolha dons diferentes para cada origem.');next.gifts=choices.map(id=>({id:uid(),...catalogDefaults(CATALOG.gifts.find(g=>g.id===id))}));return next;}
export function quotePurchase(c,group,key,bonus=false,teacher=false){
 let from,to,cost,label=key,item;
 if(bonus?c.creation?.stage!=='bonus':creating(c))fail('Conclua a etapa de criação antes de gastar XP.');
 if(['attributes','skills'].includes(group)){
  if(!Object.hasOwn(c[group],key))fail('Característica inválida.');from=c[group][key];to=from+1;if(to>5)fail('Limite de cinco pontos atingido.');
  cost=bonus?(group==='attributes'?5:2):group==='attributes'?from*4:from===0?3:from*2;
 }else if(group==='resources'){
  if(!Object.hasOwn(c.resources,key))fail('Recurso inválido.');from=c.resources[key].permanent;to=from+1;if(to>10)fail('Limite de dez pontos atingido.');cost=(key==='Gnose'?2:1)*(bonus?1:from);
 }else if(group==='backgrounds'&&bonus){
  if(!allowedBackground(c,key))fail('Antecedente indisponível para esta tribo.');from=c.backgrounds.find(x=>x.name===key)?.level||0;to=from+1;if(to>5)fail('Limite de cinco pontos atingido.');cost=1;
 }else if(group==='gifts'){
  item=CATALOG.gifts.find(g=>g.id===key);if(!item)fail('Dom inválido.');if(c.gifts.some(g=>g.name===item.name&&g.level===item.level))fail('Este dom já está na ficha.');
  if(item.level>(bonus?1:c.rank))fail(bonus?'Na criação, apenas dons de nível um.':'Seu posto não permite este dom.');
  if(!bonus&&(!c.breed||!c.auspice||!c.tribe))fail('Preencha raça, augúrio e tribo para calcular o custo do dom.');
  const own=item.references.some(r=>[alias(c.breed),alias(c.auspice),c.tribe].includes(r.group));cost=bonus?7:item.level*(own?3:5)+(teacher?1:0);label=item.name;from=0;to=item.level;
 }else fail('Compra indisponível.');
 if(!Number.isInteger(cost)||cost<1)fail('Defina o valor inicial antes de comprar com XP.');
 if(!bonus&&(c.advancement?.used||[]).includes(`${group}:${key}`))fail('Esta característica já subiu nesta história. Inicie outra história quando ela terminar.');
 const available=bonus?15-c.creation.bonusSpent:c.xp;
 return {group,key,label,from,to,cost,available,remaining:available-cost,bonus,item};
}
export function purchase(c,group,key,bonus=false,teacher=false){const q=quotePurchase(c,group,key,bonus,teacher);if(q.remaining<0)fail('Pontos insuficientes.');if(!bonus&&c.spentXp+q.cost>999999)fail('Limite do contador de XP atingido.');const next=clone(c);
 if(group==='resources')next.resources[key].permanent=q.to;
 else if(group==='backgrounds'){const item=next.backgrounds.find(x=>x.name===key);if(item)item.level=q.to;else next.backgrounds.push({id:uid(),name:key,level:q.to});}
 else if(group==='gifts')next.gifts.push({id:uid(),...catalogDefaults(q.item)});
 else next[group][key]=q.to;
 if(bonus){next.creation.bonusSpent+=q.cost;next.creation.purchases.push({group,key,from:q.from,cost:q.cost});}
 else{next.xp-=q.cost;next.spentXp+=q.cost;next.advancement||={used:[]};next.advancement.used.push(`${group}:${key}`);}
 return next;
}
export function undoBonus(c){const next=clone(c),p=next.creation.purchases.pop();if(!p)fail('Nenhuma compra para desfazer.');if(p.group==='gifts')next.gifts=next.gifts.filter(x=>x.name!==CATALOG.gifts.find(g=>g.id===p.key).name);else if(p.group==='backgrounds'){next.backgrounds=next.backgrounds.filter(x=>x.name!==p.key);if(p.from)next.backgrounds.push({id:uid(),name:p.key,level:p.from});}else if(p.group==='resources')next.resources[p.key].permanent=p.from;else next[p.group][p.key]=p.from;next.creation.bonusSpent-=p.cost;return next;}
