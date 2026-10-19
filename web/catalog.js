import {CATALOG} from './catalog-data.js';
export const normalizeSearch=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('pt-BR').trim();
export function searchCatalog(list,query=''){
 const normalized=normalizeSearch(query),levelMatch=normalized.match(/\bnivel\s*([0-5])\b/);
 const words=normalized.replace(/\bnivel\s*[0-5]\b/,'').split(/\s+/).filter(Boolean);
 return (CATALOG[list]||[]).filter(item=>{if(levelMatch&&item.level!==Number(levelMatch[1]))return false;const text=normalizeSearch([item.name,item.category,item.level===null?'nível não informado':item.level===0?'pequeno ritual':'nível '+item.level,...item.references.map(r=>[r.group,r.kind,'página '+r.page].join(' '))].join(' '));return words.every(w=>text.includes(w));});
}
export function catalogLevel(item){return item.category==='Pequeno ritual'?'Pequeno ritual':item.level===null?'Nível não informado no livro':'Nível '+item.level;}
export function catalogReferences(item){return item.references.map(r=>`${r.kind==='Ritual'?r.group:r.kind+' · '+r.group} · p. ${r.page}`).join('; ');}
export function catalogDefaults(item){return {name:item.name,level:item.level,origin:item.category==='Pequeno ritual'?'Pequeno ritual':item.references[0].kind==='Ritual'?item.category:item.references[0].kind,description:`Livro base · 2ª edição. ${catalogLevel(item)}.\n${catalogReferences(item)}.\n${item.level===null?'O nível não está indicado nesta entrada do livro.\n':''}`};}
export {CATALOG};
