/**
 * Apps Script Web App - deploy 'Execute as: Me' and 'Who has access: Anyone'.
 * Never expose the script secret or spreadsheet ID in client-side JavaScript.
 * Configure Script properties: SPREADSHEET_ID, ORDER_WEBHOOK_SECRET.
 */
function doPost(e) {
  const out = (payload) => ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  try {
    const cfg = PropertiesService.getScriptProperties();
    const sheetId = cfg.getProperty('SPREADSHEET_ID');
    const secret = cfg.getProperty('ORDER_WEBHOOK_SECRET');
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (!sheetId || !secret || payload.secret !== secret) return out({ok:false,error:'Unauthorised'});
    if (!/^VE-[A-Z0-9-]+$/.test(payload.orderId || '') || !Array.isArray(payload.items) || payload.items.length === 0) return out({ok:false,error:'Bad request'});
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return out({ok:false,error:'Busy'});
    try {
      const doc = SpreadsheetApp.openById(sheetId);
      const sheet = doc.getSheetByName('Orders') || doc.insertSheet('Orders');
      if (sheet.getLastRow() === 0) sheet.appendRow(['Order ID','Created At (UTC)','Customer','Phone','Address','Payment method','Items (JSON)','Subtotal (VND)','Delivery fee','Status','Note']);
      // Do not append the same order ID twice if an HTTP response is retried.
      if(sheet.getLastRow()>1){
        const found=sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(payload.orderId).matchEntireCell(true).findNext();
        if(found)return out({ok:true,orderId:payload.orderId,duplicate:true});
      }
      // Protect spreadsheet cells from formula injection.
      const cell = value => {const s=String(value == null ? '' : value);return /^[=+\-@]/.test(s) ? "'"+s : s;};
      sheet.appendRow([
        cell(payload.orderId),cell(payload.createdAt),cell(payload.customerName),cell(payload.phone),
        cell(payload.address),cell(payload.paymentMethod),cell(JSON.stringify(payload.items)),
        Number(payload.subtotal), '', 'NEW_UNCONFIRMED',cell(payload.note)
      ]);
      SpreadsheetApp.flush();
      return out({ok:true,orderId:payload.orderId});
    } finally {lock.releaseLock();}
  } catch(err){return out({ok:false,error:'Internal error'});}
}
