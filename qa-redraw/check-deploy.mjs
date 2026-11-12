import { chromium } from '@playwright/test';
const browser=await chromium.launch();
const page=await browser.newPage({viewport:{width:1366,height:768}});
for(const url of process.argv.slice(2)) {
 try {
  const response=await page.goto(url,{timeout:45000,waitUntil:'domcontentloaded'});
  console.log(JSON.stringify({url,status:response?.status(),landed:page.url(),title:await page.title(),scene:await page.locator('.ve2d-stage').count()}));
  const manifest=await page.request.get(new URL('art/manifest.json',url).href);
  console.log(JSON.stringify({manifest:manifest.status(),body:(await manifest.text()).slice(0,600)}));
 } catch(e){ console.log(JSON.stringify({url,error:String(e)})); }
}
await browser.close();
