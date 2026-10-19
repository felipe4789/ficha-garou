// Consultation table transcribed from the character sheet supplied by the user.
export const BRAWL_MOVES = [
 {name:'Morder',test:'Destreza + Briga',difficulty:5,damage:'Força + 1',aggravated:true},
 {name:'Encontrão',test:'Destreza + Briga',difficulty:6,damage:'Especial',aggravated:false},
 {name:'Garra',test:'Destreza + Briga',difficulty:7,damage:'Força + 2',aggravated:true},
 {name:'Engalfinhar',test:'Destreza + Briga',difficulty:8,damage:'Força',aggravated:false},
 {name:'Chutar',test:'Destreza + Briga',difficulty:9,damage:'Força + 1',aggravated:false},
 {name:'Socar',test:'Destreza + Briga',difficulty:9,damage:'Força',aggravated:false}
];
export function brawlReference(){return `<section class="card combat-reference" aria-labelledby="brawl-title"><h3 id="brawl-title">Tabela de Briga</h3><table class="brawl-table"><thead><tr><th scope="col">Manobra</th><th scope="col">Teste</th><th scope="col"><abbr title="Dificuldade">Dif.</abbr></th><th scope="col">Dano</th></tr></thead><tbody>${BRAWL_MOVES.map(move=>`<tr><th scope="row">${move.name}</th><td>${move.test}</td><td>${move.difficulty}</td><td>${move.damage}${move.aggravated?'<sup aria-label="Dano agravado">†</sup>':''}</td></tr>`).join('')}</tbody></table><p class="help" id="brawl-footnote">† Morder e Garra provocam dano agravado.</p></section>`;}
