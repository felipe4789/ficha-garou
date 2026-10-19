// Actual drawings cropped from row 2 of the user-approved comparison board.
const files={'Hominídeo':'hominideo','Glabro':'glabro','Crinos':'crinos','Hispo':'hispo','Lupino':'lupino'};
export function formIcon(name){const file=files[name];return file?`<span class="form-art" aria-hidden="true"><img src="forms/${file}.png" alt="" draggable="false"></span>`:'';}
