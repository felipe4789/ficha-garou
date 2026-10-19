import {readFileSync,writeFileSync} from 'node:fs';
const source=readFileSync(new URL('./catalog-source.txt',import.meta.url),'utf8');
const gifts=new Map(),rituals=[];let group,kind;
const slug=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
for(const raw of source.split(/\r?\n/)){
 const line=raw.trim();if(!line||line.startsWith('#'))continue;
 if(line.startsWith('[')){[group,kind]=line.slice(1,-1).split('|');continue;}
 const [levelRaw,entries]=line.split('|');const level=levelRaw==='?'?null:Number(levelRaw);
 for(const entry of entries.split(';')){
  const [name,pageRaw]=entry.split('@'),pdfPage=Number(pageRaw),reference={group,kind,page:pdfPage-16,pdfPage};
  if(kind==='Ritual')rituals.push({id:'ritual-'+slug(name),name,level,category:group,references:[reference]});
  else{const id='gift-'+slug(name)+'-'+level;if(!gifts.has(id))gifts.set(id,{id,name,level,category:kind,references:[]});gifts.get(id).references.push(reference);}
 }
}
const collator=new Intl.Collator('pt-BR',{sensitivity:'base'});
const catalog={source:'Lobisomem: O Apocalipse · Livro básico · 2ª edição',gifts:[...gifts.values()].sort((a,b)=>collator.compare(a.name,b.name)||a.level-b.level),rituals:rituals.sort((a,b)=>collator.compare(a.name,b.name))};
writeFileSync(new URL('../web/catalog-data.js',import.meta.url),'// Transcrição revisada de nomes, níveis e referências; não contém descrições do livro.\nexport const CATALOG = '+JSON.stringify(catalog,null,2)+';\n');
console.log(catalog.gifts.length+' dons distintos / '+catalog.gifts.reduce((s,g)=>s+g.references.length,0)+' entradas por origem; '+rituals.length+' rituais.');
