import { readFileSync,existsSync } from 'node:fs';
import { resolve } from 'node:path';
const dir=resolve(import.meta.dirname,'..');
const src=readFileSync(resolve(dir,'data/catalog.ts'),'utf8');
const entries=[...src.matchAll(/recipe\("([a-z0-9-]+)","[^\"]+","[^\"]+","(spring|summer|autumn|winter)",\[([^\]]+)\]/g)];
const counts={spring:0,summer:0,autumn:0,winter:0};
const slugs=new Set();
for(const [,slug,season,months] of entries){if(slugs.has(slug))throw Error('Duplicate slug: '+slug);slugs.add(slug);counts[season]++;if(!existsSync(resolve(dir,`public/products/${slug}.svg`)))throw Error('Missing image: '+slug);const seasonMonths={spring:[1,2,3],summer:[4,5,6],autumn:[7,8,9],winter:[10,11,12]}[season];for(const m of months.split(',').map(Number))if(!seasonMonths.includes(m))throw Error(`Wrong season month ${m} for ${slug}`);}
if(entries.length!==24)throw Error(`Expected 24 products; found ${entries.length}`);
for(const [season,n] of Object.entries(counts))if(n<5)throw Error(`${season} only ${n} products`);
for(let month=1;month<=12;month++){if(!src.includes(`  ${month}:[`))throw Error('Missing fruit month '+month)}
console.log('PASS: 24 distinct recipes, 24 local images, 12 months and >=5 recipes per season.',counts);
