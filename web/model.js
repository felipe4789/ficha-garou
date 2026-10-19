export const ATTRIBUTES = { 'Físicos': ['Força', 'Destreza', 'Vigor'], 'Sociais': ['Carisma', 'Manipulação', 'Aparência'], 'Mentais': ['Percepção', 'Inteligência', 'Raciocínio'] };
export const SKILLS = { 'Talentos': ['Prontidão', 'Esportes', 'Briga', 'Esquiva', 'Empatia', 'Interpretação', 'Intimidação', 'Instinto Primitivo', 'Manha', 'Lábia'], 'Perícias': ['Empatia com Animais', 'Condução', 'Protocolo', 'Armas de Fogo', 'Armas Brancas', 'Liderança', 'Atuação', 'Consertos', 'Furtividade', 'Sobrevivência'], 'Conhecimentos': ['Computador', 'Enigmas', 'Investigação', 'Direito', 'Linguística', 'Medicina', 'Ocultismo', 'Política', 'Rituais', 'Ciência'] };
export const FORMS = {
 'Hominídeo': { difficulty: 6, mods: {}, note: 'Forma humana. Nenhuma mudança nos atributos.' },
 'Glabro': { difficulty: 6, mods: { 'Força': 2, 'Vigor': 2, 'Aparência': -1, 'Manipulação': -1 }, note: 'Forma quase humana.' },
 'Crinos': { difficulty: 6, mods: { 'Força': 4, 'Destreza': 1, 'Vigor': 3, 'Manipulação': -3 }, appearance: 0, note: 'Forma de guerra. Incita Delírio em humanos.' },
 'Hispo': { difficulty: 7, mods: { 'Força': 3, 'Destreza': 2, 'Vigor': 3, 'Manipulação': -3 }, note: '+1 de dano por mordida.' },
 'Lupino': { difficulty: 6, mods: { 'Força': 1, 'Destreza': 2, 'Vigor': 2, 'Manipulação': -3 }, note: '−2 na dificuldade em testes de Percepção.' }
};
export const HEALTH = [['Escoriado', '0'], ['Machucado', '−1'], ['Ferido', '−1'], ['Ferido gravemente', '−2'], ['Espancado', '−2'], ['Aleijado', '−5'], ['Incapacitado', '—']];
export const uid = () => globalThis.crypto?.randomUUID?.() || Date.now().toString(36) + Math.random().toString(36).slice(2);
export function newCharacter() {
 return { id: uid(), name: '', player: '', chronicle: '', breed: '', auspice: '', tribe: '', pack: '', totem: '', concept: '', rank: 1, xp: 0, spentXp: 0, form: 'Hominídeo', attributes: Object.fromEntries(Object.values(ATTRIBUTES).flat().map(k => [k, 1])), skills: Object.fromEntries(Object.values(SKILLS).flat().map(k => [k, 0])), specialties: {}, resources: { 'Fúria': { permanent: 0, current: 0 }, 'Gnose': { permanent: 0, current: 0 }, 'Força de Vontade': { permanent: 0, current: 0 } }, renown: { 'Glória': { permanent: 0, current: 0 }, 'Honra': { permanent: 0, current: 0 }, 'Sabedoria': { permanent: 0, current: 0 } }, health: [0,0,0,0,0,0,0], backgrounds: [], gifts: [], rituals: [], fetishes: [], weapons: [], otherTraits: [], armor: '', scars: '', deformity: '', history: '', appearance: '', personality: '', notes: '', generalNotes: '', updatedAt: new Date().toISOString() };
}
export function effectiveAttributes(c) { const f = FORMS[c.form] || FORMS.Hominídeo; return Object.fromEntries(Object.entries(c.attributes).map(([k,v]) => [k, k === 'Aparência' && f.appearance === 0 ? 0 : Math.max(0,v + (f.mods[k] || 0))])); }
// Fera Interior, p. 156: modifies social dice pools, never attribute ratings.
export function socialPenalty(c){return Math.max(0,c.resources['Fúria'].permanent-c.resources['Força de Vontade'].permanent);}
export function setRating(object, key, value, max = 5) { object[key] = Math.max(0, Math.min(max, Math.trunc(Number(value) || 0))); }
export function validateBackup(raw) {
 if (!raw || raw.format !== 'ficha-garou' || raw.version !== 1 || !Array.isArray(raw.characters) || !raw.characters.length || raw.characters.length > 100) throw new Error('Este arquivo não é um backup válido do Ficha Garou (versão 1).');
 return raw.characters.map(c => {
  const base = newCharacter();
  if (!c || typeof c !== 'object' || typeof c.name !== 'string') throw new Error('Personagem inválido no backup.');
  for (const k of Object.keys(base)) {
   if (['id', 'updatedAt'].includes(k)) continue;
   if(k==='generalNotes'&&c[k]===undefined)continue; // Backups created before this field remain valid.
   if (typeof base[k] === 'string') { if (typeof c[k] !== 'string' || c[k].length > 100000) throw new Error('Campo de texto inválido: ' + k); base[k] = c[k]; }
   else if (typeof base[k] === 'number') { if (!Number.isInteger(c[k]) || c[k] < 0 || c[k] > 999999) throw new Error('Valor inválido: ' + k); base[k] = c[k]; }
  }
  if (!Object.prototype.hasOwnProperty.call(FORMS,base.form)) throw new Error('Forma inválida.');
  for (const group of ['attributes', 'skills']) for (const k of Object.keys(base[group])) { const n = c[group]?.[k]; if (!Number.isInteger(n) || n < 0 || n > 5) throw new Error('Característica inválida: ' + k); base[group][k] = n; }
  for (const group of ['resources','renown']) for (const k of Object.keys(base[group])) for (const type of ['permanent','current']) { const n = c[group]?.[k]?.[type]; if (!Number.isInteger(n) || n < 0 || n > 10) throw new Error('Marcador inválido: ' + k); base[group][k][type] = n; }
  if (!Array.isArray(c.health) || c.health.length !== 7 || c.health.some(n => ![0,1,2,3].includes(n))) throw new Error('Vitalidade inválida.'); base.health = [...c.health];
  for (const list of ['backgrounds','gifts','rituals','fetishes','weapons','otherTraits']) { if (!Array.isArray(c[list]) || c[list].length > 500) throw new Error('Lista inválida: ' + list); base[list] = c[list].map(item => { if (!item || typeof item.name !== 'string' || item.name.length > 1000) throw new Error('Registro inválido.'); const cleaned = { id: uid() }; for (const [k,v] of Object.entries(item)) { if (k === 'id') continue; if(list==='rituals'&&k==='level'&&v===null){cleaned.level=null;continue;} if (!['name','level','origin','description','gnosis','dedicated','test','difficulty','damage','range','rate','clip'].includes(k)) continue; if (!['string','number','boolean'].includes(typeof v) || String(v).length > 100000) throw new Error('Registro inválido.'); cleaned[k] = v; } if ('level' in cleaned && !(list==='rituals'&&cleaned.level===null) && (!Number.isInteger(cleaned.level) || cleaned.level < 0 || cleaned.level > 5)) throw new Error('Nível inválido.'); return cleaned; }); }
  if (!c.specialties || typeof c.specialties !== 'object' || Array.isArray(c.specialties)) throw new Error('Especializações inválidas.');
  for (const [k,v] of Object.entries(c.specialties)) { if ([...Object.keys(base.attributes),...Object.keys(base.skills)].includes(k) && typeof v === 'string' && v.length <= 1000) base.specialties[k] = v; }
  if(c.creation!==undefined){
   const s=c.creation,stages=['identity','attributes','skills','advantages','bonus','complete'];
   if(!s||s.mode!=='points'||!stages.includes(s.stage))throw Error('Modo de criação inválido.');
   for(const [key,groups]of [['attributeOrder',ATTRIBUTES],['skillOrder',SKILLS]])if(!Array.isArray(s[key])||s[key].length!==3||new Set(s[key]).size!==3||s[key].some(n=>!Object.hasOwn(groups,n)))throw Error('Prioridades de criação inválidas.');
   if(!Number.isInteger(s.bonusSpent)||s.bonusSpent<0||s.bonusSpent>15||!Array.isArray(s.purchases)||s.purchases.length>15)throw Error('Pontos de bônus inválidos.');
   const cleaned={mode:'points',stage:s.stage,attributeOrder:[...s.attributeOrder],skillOrder:[...s.skillOrder],bonusSpent:s.bonusSpent,purchases:[]};
   for(const p of s.purchases){if(!p||!['attributes','skills','resources','backgrounds','gifts'].includes(p.group)||typeof p.key!=='string'||p.key.length>200||!Number.isInteger(p.from)||p.from<0||p.from>10||![1,2,5,7].includes(p.cost))throw Error('Compra de bônus inválida.');cleaned.purchases.push({group:p.group,key:p.key,from:p.from,cost:p.cost});}
   if(s.stage==='bonus'&&s.purchases.reduce((sum,p)=>sum+p.cost,0)!==s.bonusSpent)throw Error('Saldo de bônus inconsistente.');
   if(s.giftSlots!==undefined){if(!s.giftSlots||typeof s.giftSlots!=='object'||Array.isArray(s.giftSlots)||Object.keys(s.giftSlots).some(k=>!['Raça','Augúrio','Tribo'].includes(k)||typeof s.giftSlots[k]!=='string'||s.giftSlots[k].length>200))throw Error('Dons iniciais inválidos.');cleaned.giftSlots={...s.giftSlots};}
   base.creation=cleaned;
  }
  if(c.advancement!==undefined){if(!c.advancement||!Array.isArray(c.advancement.used)||c.advancement.used.length>1000||c.advancement.used.some(x=>typeof x!=='string'||x.length>250||! /^(attributes|skills|resources|gifts):.+$/.test(x)))throw Error('Histórico de evolução inválido.');base.advancement={used:[...c.advancement.used]};}
  return base;
 });
}
