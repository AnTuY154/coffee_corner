import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const rows=[['Order ID','Created At (UTC)','Customer','Phone','Address','Payment method','Items (JSON)','Subtotal (VND)','Delivery fee','Status','Note']];
const sheet={getLastRow:()=>rows.length,appendRow:r=>rows.push(r),getRange:(row,col,length,width)=>({createTextFinder:search=>({matchEntireCell:()=>({findNext:()=>rows.slice(row-1,row-1+length).some(r=>r[0]===search)?{}:null})})})};
const sandbox={
 PropertiesService:{getScriptProperties:()=>({getProperty:key=>({SPREADSHEET_ID:'test-spreadsheet',ORDER_WEBHOOK_SECRET:'strong-test-secret'}[key])})},
 SpreadsheetApp:{openById:id=>{assert.equal(id,'test-spreadsheet');return {getSheetByName:n=>n==='Orders'?sheet:null,insertSheet:()=>{throw Error('No need')}}},flush:()=>{}},
 LockService:{getScriptLock:()=>({tryLock:()=>true,releaseLock:()=>{}})},
 ContentService:{MimeType:{JSON:'JSON'},createTextOutput:body=>({setMimeType:()=>({body})})}
};
vm.createContext(sandbox);
vm.runInContext(readFileSync(new URL('./google-apps-script.gs', import.meta.url),'utf8'),sandbox);
const order={secret:'strong-test-secret',orderId:'VE-00112233-4455-4677-8899-AABBCCDDEEFF',createdAt:'2026-10-23T07:00:00.000Z',customerName:'=IMPORTXML("https://bad.example", "//a")',phone:'0901234567',address:'01 Example Street, Ha Noi',note:'=1+1',items:[{id:'nang-xuan',name:'Nắng Xuân',quantity:1,unitPrice:39000,lineTotal:39000}],subtotal:39000,paymentMethod:'cod'};
const submit=(obj)=>JSON.parse(sandbox.doPost({postData:{contents:JSON.stringify(obj)}}).body);
assert.equal(submit({...order,secret:'wrong'}).ok,false);
assert.equal(rows.length,1);
assert.equal(submit(order).ok,true);
assert.equal(rows.length,2);
assert.ok(rows[1][2].startsWith("'=IMPORTXML"));
assert.equal(rows[1][10],"'=1+1");
assert.equal(submit(order).duplicate,true);
assert.equal(rows.length,2);
assert.equal(submit({...order,orderId:'INVALID'}).ok,false);
console.log('PASS: Apps Script secret enforcement, order append, duplicate handling, and spreadsheet formula escaping.');
