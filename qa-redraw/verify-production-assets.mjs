import { request } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const base=process.argv[2];
const context=await request.newContext();
const manifest=await (await context.get(`${base}/art/manifest.json?review=${Date.now()}`)).json();
const local=JSON.parse(readFileSync('public/art/manifest.json','utf8'));
if(JSON.stringify(manifest)!==JSON.stringify(local)) throw new Error('Production manifest differs from reviewed manifest');
const jobs=[];
for(const [who,actions] of Object.entries(local.approved))
 for(const [action,count] of Object.entries(actions))
  for(let i=0;i<count;i++) jobs.push(`art/frames/${who}/${action}/${String(i).padStart(2,'0')}.webp`);
const results=[];
await Promise.all(Array.from({length:8},async()=>{
 while(jobs.length) {
  const path=jobs.shift();const response=await context.get(`${base}/${path}`);
  if(!response.ok())throw new Error(`${response.status()}: ${path}`);
  const digest=b=>createHash('sha256').update(b).digest('hex');
  if(digest(await response.body())!==digest(readFileSync(`public/${path}`)))throw new Error(`Hash mismatch: ${path}`);
  results.push(path);
 }
}));
writeFileSync('qa-redraw/production-asset-verification.json',JSON.stringify({url:base,checkedAt:new Date().toISOString(),matched:results.length,manifest,files:results.sort()},null,2));
console.log(`PASS: ${results.length} production frame files match reviewed repository bytes`);
await context.dispose();
