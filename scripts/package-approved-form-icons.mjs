// Crop the actual approved option-2 artwork. No redraw or generated replacement.
import {createRequire} from 'node:module';
import {mkdirSync,copyFileSync,writeFileSync} from 'node:fs';
const require=createRequire('C:/Users/Felipe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/package.json');
const sharp=require('sharp');
const source='output/opcoes-icones-formas.png';
mkdirSync('assets/forms',{recursive:true});mkdirSync('web/forms',{recursive:true});
copyFileSync(source,'assets/forms/approved-option2-source.png');
const regions={
 hominideo:{left:220,top:285,width:90,height:203},
 glabro:{left:375,top:295,width:162,height:193},
 crinos:{left:587,top:277,width:151,height:211},
 hispo:{left:766,top:300,width:256,height:188},
 lupino:{left:1029,top:338,width:181,height:150}
};
const manifest={source:'assets/forms/approved-option2-source.png',option:2,method:'Exact source-pixel crops; original outlines retained. CSS blends the dark presentation background.',icons:{}};
for(const [name,region]of Object.entries(regions)){
 const {data,info}=await sharp(source).extract(region).raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=0,bottom=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*info.channels;if(Math.min(data[i],data[i+1],data[i+2])>155){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
 if(left>right)throw Error('Empty approved icon: '+name);
 const crop={left:Math.max(region.left,region.left+left-3),top:Math.max(region.top,region.top+top-3),width:0,height:0};
 crop.width=Math.min(region.left+region.width,region.left+right+4)-crop.left;
 crop.height=Math.min(region.top+region.height,region.top+bottom+4)-crop.top;
 await sharp(source).extract(crop).png().toFile(`web/forms/${name}.png`);
 copyFileSync(`web/forms/${name}.png`,`assets/forms/${name}.png`);
 manifest.icons[name]=crop;
}
writeFileSync('assets/forms/source-crops.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Five exact option-2 drawings exported.');
