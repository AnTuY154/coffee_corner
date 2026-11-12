/**
 * Apps Script Web App. Script properties: SPREADSHEET_ID, ORDER_WEBHOOK_SECRET.
 * All duplicate/hash decisions happen under the SAME script lock.
 */
function doPost(e) {
  const out = payload => ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
  try {
    const config = PropertiesService.getScriptProperties();
    const sheetId = config.getProperty('SPREADSHEET_ID');
    const secret = config.getProperty('ORDER_WEBHOOK_SECRET');
    const payload = JSON.parse((e.postData && e.postData.contents) || '{}');
    if (!sheetId || !secret || payload.secret !== secret) return out({ok:false,error:'Unauthorised'});
    if (!/^VE-[A-Z0-9-]+$/.test(payload.orderId || '') || !Array.isArray(payload.items) || !payload.items.length || !/^[a-f0-9]{64}$/.test(payload.inputHash || '')) return out({ok:false,error:'Bad request'});
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) return out({ok:false,error:'Busy'});
    try {
      const doc = SpreadsheetApp.openById(sheetId);
      const sheet = doc.getSheetByName('Orders') || doc.insertSheet('Orders');
      const headers = ['Order ID','Created At (UTC)','Customer','Phone','Address','Payment method','Items (JSON)','Subtotal (VND)','Delivery fee','Status','Note','Input Hash'];
      if (!sheet.getLastRow()) sheet.appendRow(headers);
      else if (sheet.getLastColumn() < 12 || sheet.getRange(1,12).getValue() !== 'Input Hash') sheet.getRange(1,12).setValue('Input Hash');
      if (sheet.getLastRow() > 1) {
        const found = sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(payload.orderId).matchEntireCell(true).findNext();
        if (found) {
          const savedHash = String(sheet.getRange(found.getRow(),12).getValue() || '');
          if (!savedHash) return out({ok:false,error:'NeedsReview',orderId:payload.orderId});
          if (savedHash !== payload.inputHash) return out({ok:false,error:'Conflict',orderId:payload.orderId});
          return out({ok:true,orderId:payload.orderId,duplicate:true,subtotal:Number(sheet.getRange(found.getRow(),8).getValue())});
        }
      }
      const cell = value => {
        const valueString = String(value == null ? '' : value);
        return /^[=+\-@]/.test(valueString) ? "'" + valueString : valueString;
      };
      sheet.appendRow([
        cell(payload.orderId),cell(payload.createdAt),cell(payload.customerName),cell(payload.phone),
        cell(payload.address),cell(payload.paymentMethod),cell(JSON.stringify(payload.items)),
        Number(payload.subtotal), '', 'NEW_UNCONFIRMED',cell(payload.note),cell(payload.inputHash)
      ]);
      SpreadsheetApp.flush();
      return out({ok:true,orderId:payload.orderId,duplicate:false,subtotal:Number(payload.subtotal)});
    } finally {lock.releaseLock();}
  } catch { return out({ok:false,error:'Internal error'}); }
}
