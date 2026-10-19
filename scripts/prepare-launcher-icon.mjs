// Asset packaging only: trim presentation margins and export Android density sizes.
import {createRequire} from 'node:module';
import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
const require=createRequire('C:/Users/Felipe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/package.json');
const sharp=require('sharp');
const source=process.argv[2];if(!source)throw Error('Informe o PNG aprovado.');
mkdirSync('assets',{recursive:true});copyFileSync(source,'assets/app-icon-selected.png');
const {data,info}=await sharp(source).removeAlpha().raw().toBuffer({resolveWithObject:true});
let top=info.height,bottom=0,left=info.width,right=0;
for(let y=0;y<info.height;y++){let count=0,min=info.width,max=0;for(let x=0;x<info.width;x++){const n=(y*info.width+x)*3;if(Math.max(data[n],data[n+1],data[n+2])<110){count++;min=Math.min(min,x);max=Math.max(max,x);}}if(count>info.width*.15){top=Math.min(top,y);bottom=Math.max(bottom,y);left=Math.min(left,min);right=Math.max(right,max);}}
const cornerMask=Buffer.from('<svg width="512" height="512"><rect width="512" height="512" rx="90" fill="white"/></svg>');
const trimmed=await sharp(source).extract({left,top,width:right-left+1,height:bottom-top+1}).resize(512,512,{fit:'contain',background:'#232528'}).composite([{input:cornerMask,blend:'dest-in'}]).png().toBuffer();
await sharp(trimmed).toFile('assets/app-icon.png');
await sharp(trimmed).resize(64,64).toFile('web/app-icon.png');
for(const [density,size]of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){const path=`android/app/src/main/res/mipmap-${density}`;mkdirSync(path,{recursive:true});await sharp(trimmed).resize(size,size).toFile(path+'/ic_launcher.png');}
// The adaptive icon uses generous system-mask safe area.
const drawable='android/app/src/main/res/drawable';
const foreground=await sharp(trimmed).resize(696,696).toBuffer();
await sharp({create:{width:1080,height:1080,channels:4,background:'#232528'}}).composite([{input:foreground,left:192,top:192}]).png().toFile(drawable+'/ic_launcher_foreground.png');
mkdirSync('android/app/src/main/res/mipmap-anydpi-v26',{recursive:true});
writeFileSync('android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml','<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/launcher_background"/><foreground android:drawable="@drawable/ic_launcher_foreground"/></adaptive-icon>\n');
writeFileSync('android/app/src/main/res/values/colors.xml','<resources><color name="launcher_background">#232528</color></resources>\n');
console.log('Ícone aprovado preparado para Android. Recorte da margem:',{left,top,right,bottom});
