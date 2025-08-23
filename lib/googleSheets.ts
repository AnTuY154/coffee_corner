import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const SPREADSHEET_ID = '1cdL3udQqesNljLpqISTq5S7iVNLx4i9Z4ICY7C4zHuc'; // Sheet của bạn

export function getAuth() {
  if (!process.env.GOOGLE_CREDENTIALS) {
    throw new Error('GOOGLE_CREDENTIALS env not set');
  }
  
  try {
    // Parse JSON từ biến môi trường
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    // Kiểm tra các field bắt buộc
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('GOOGLE_CREDENTIALS thiếu client_email hoặc private_key');
    }
    
    // Nếu private_key bị escape \\n, chuyển lại thành \n
    if (credentials.private_key) {
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }
    
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
    });
    
    return client;
  } catch (error) {
    console.error('Lỗi khi khởi tạo Google Auth:', error);
    if (error instanceof Error) {
      throw new Error(`Lỗi Google Auth: ${error.message}`);
    }
    throw new Error('Lỗi không xác định khi khởi tạo Google Auth');
  }
}

// Function để test authentication trên Vercel
export async function testGoogleSheetsConnection() {
  try {
    console.log('🔍 Bắt đầu test Google Sheets connection...');
    
    // Kiểm tra environment variables
    console.log('📋 Kiểm tra GOOGLE_CREDENTIALS:', {
      exists: !!process.env.GOOGLE_CREDENTIALS,
      length: process.env.GOOGLE_CREDENTIALS?.length || 0,
      preview: process.env.GOOGLE_CREDENTIALS?.substring(0, 100) + '...'
    });
    
    // Test authentication
    const auth = getAuth();
    console.log('✅ Auth object created successfully');
    
    // Test Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API initialized');
    
    // Test basic API call
    const testResponse = await sheets.spreadsheets.get({ 
      spreadsheetId: SPREADSHEET_ID,
      ranges: ['A1'], // Chỉ lấy 1 cell để test
      fields: 'sheets.properties.title'
    });
    
    console.log('✅ Google Sheets API call successful:', {
      spreadsheetId: SPREADSHEET_ID,
      sheetsCount: testResponse.data.sheets?.length || 0,
      sheetTitles: testResponse.data.sheets?.map(s => s.properties?.title) || []
    });
    
    return { success: true, message: 'Kết nối Google Sheets thành công' };
    
  } catch (error) {
    console.error('❌ Lỗi test Google Sheets connection:', error);
    
    const errorInfo = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name || 'Unknown'
    };
    
    console.error('📊 Chi tiết lỗi:', errorInfo);
    
    return { 
      success: false, 
      error: errorInfo,
      message: 'Kết nối Google Sheets thất bại'
    };
  }
}

export async function appendDataToSheetByDate(date: string, data: Record<string, string>) {
  try {
    console.log('🚀 Bắt đầu appendDataToSheetByDate với:', { date, dataKeys: Object.keys(data) });
    
    const auth = getAuth();
    console.log('✅ Auth thành công');
    
    const sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API khởi tạo thành công');

    // Kiểm tra sheets API có được khởi tạo đúng không
    if (!sheets || !sheets.spreadsheets || typeof sheets.spreadsheets.get !== 'function') {
      console.error('❌ Google Sheets API không được khởi tạo đúng cách');
      console.error('sheets object:', sheets);
      console.error('sheets.spreadsheets:', sheets?.spreadsheets);
      console.error('sheets.spreadsheets.get type:', typeof sheets?.spreadsheets?.get);
      throw new Error('Google Sheets API không được khởi tạo đúng cách');
    }

    console.log('🔍 Gọi sheets.spreadsheets.get...');
    console.log('🔍 sheets object:', {
      hasSheets: !!sheets.spreadsheets,
      sheetsType: typeof sheets.spreadsheets,
      hasGetMethod: typeof sheets.spreadsheets?.get === 'function',
      getMethodType: typeof sheets.spreadsheets?.get
    });
    
    const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    console.log('✅ Lấy thông tin spreadsheet thành công');
    
    // Kiểm tra response từ Google Sheets API
    if (!sheetInfo || !sheetInfo.data || !sheetInfo.data.sheets) {
      throw new Error('Không thể lấy thông tin spreadsheet từ Google Sheets API');
    }
    
    console.log('📊 Sheet info:', {
      spreadsheetId: SPREADSHEET_ID,
      sheetsCount: sheetInfo.data.sheets.length,
      sheetTitles: sheetInfo.data.sheets.map((s: any) => s.properties?.title)
    });
    
    const sheetTitles = sheetInfo.data.sheets?.map((s: any) => s.properties?.title) || [];
    console.log('5', sheetTitles)
    // Tìm hoặc tạo sheet theo ngày
    let sheetTitle = date;
    console.log('6', sheetTitle)
    let headers = [...Object.keys(data), 'status', 'payment'];
    console.log('7', headers)
    const statusColumnIndex = headers.length - 2;
    console.log('8', statusColumnIndex)
    const paymentColumnIndex = headers.length - 1;
    console.log('9', paymentColumnIndex)
    let sheetId: number | undefined = undefined;
    console.log('sheetTitles', sheetTitles, 'sheetTitle', sheetTitle, '!sheetTitles.includes(sheetTitle)', !sheetTitles.includes(sheetTitle))
    // Nếu sheet đã tồn tại, lấy sheetId của nó
    if (sheetTitles.includes(sheetTitle)) {
      const existedSheet = sheetInfo.data.sheets?.find((s: any) => s.properties?.title === sheetTitle);
      const rawExistingId = existedSheet?.properties?.sheetId;
      sheetId = typeof rawExistingId === 'number' ? rawExistingId : undefined;
    }
    if (!sheetTitles.includes(sheetTitle)) {
      // Tạo sheet mới
      const addSheetRes = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetTitle },
              },
            },
          ],
        },
      });
      // Lấy sheetId vừa tạo, ép kiểu về number | undefined
      const rawSheetId = addSheetRes.data.replies?.[0]?.addSheet?.properties?.sheetId;
      sheetId = typeof rawSheetId === 'number' ? rawSheetId : undefined;

      // Ghi header vào dòng 1
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetTitle}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });

      // Thêm data validation cho cột status và payment
      if (sheetId !== undefined) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SPREADSHEET_ID,
          requestBody: {
            requests: [
              {
                setDataValidation: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 1, // Bắt đầu từ dòng 2 (dòng 1 là header)
                    endRowIndex: 1000, // Số dòng tối đa, có thể tăng nếu cần
                    startColumnIndex: statusColumnIndex, // Cột status
                    endColumnIndex: statusColumnIndex + 1,
                  },
                  rule: {
                    condition: {
                      type: 'ONE_OF_LIST',
                      values: [
                        { userEnteredValue: 'pending' },
                        { userEnteredValue: 'done' },
                      ],
                    },
                    showCustomUi: true,
                    strict: true,
                    inputMessage: 'Chỉ chọn pending hoặc done',
                  },
                },
              },
              {
                setDataValidation: {
                  range: {
                    sheetId: sheetId,
                    startRowIndex: 1,
                    endRowIndex: 1000,
                    startColumnIndex: paymentColumnIndex, // Cột payment
                    endColumnIndex: paymentColumnIndex + 1,
                  },
                  rule: {
                    condition: {
                      type: 'ONE_OF_LIST',
                      values: [
                        { userEnteredValue: 'yes' },
                        { userEnteredValue: 'no' },
                      ],
                    },
                    showCustomUi: true,
                    strict: true,
                    inputMessage: 'Chỉ chọn yes hoặc no',
                  },
                },
              },
            ],
          },
        });
      }
    }

    // Đảm bảo header và data validation tồn tại ngay cả khi sheet đã tồn tại trước đó
    const headerCheck = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
    });
    console.log('headerCheck', headerCheck);

    const headerRow = headerCheck.data.values?.[0] || [];
    const isHeaderMismatched =
      headerRow.length !== headers.length || headers.some((h, i) => headerRow[i] !== h);

    if (isHeaderMismatched) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${sheetTitle}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [headers] },
      });
    }

    // Đặt/đặt lại data validation cho status và payment
    if (sheetId !== undefined) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          requests: [
            {
              setDataValidation: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: statusColumnIndex,
                  endColumnIndex: statusColumnIndex + 1,
                },
                rule: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: [
                      { userEnteredValue: 'pending' },
                      { userEnteredValue: 'done' },
                    ],
                  },
                  showCustomUi: true,
                  strict: true,
                  inputMessage: 'Chỉ chọn pending hoặc done',
                },
              },
            },
            {
              setDataValidation: {
                range: {
                  sheetId: sheetId,
                  startRowIndex: 1,
                  endRowIndex: 1000,
                  startColumnIndex: paymentColumnIndex,
                  endColumnIndex: paymentColumnIndex + 1,
                },
                rule: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: [
                      { userEnteredValue: 'yes' },
                      { userEnteredValue: 'no' },
                    ],
                  },
                  showCustomUi: true,
                  strict: true,
                  inputMessage: 'Chỉ chọn yes hoặc no',
                },
              },
            },
          ],
        },
      });
    }

    // Ghi dữ liệu vào dòng tiếp theo
    const values = [...Object.values(data), 'pending', 'no'];
    // Tìm dòng trống tiếp theo
    const getRows = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A:A`,
    });
    const nextRow = (getRows.data.values?.length || 0) + 1;
    console.log('nextRow', {
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A${nextRow}`,
      valueInputOption: 'RAW',
      requestBody: { values: [values] },
    });
  } catch (error) {
    console.error('Lỗi trong appendDataToSheetByDate:', error);

    // Log chi tiết hơn cho debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // Re-throw error để caller có thể xử lý
    throw error;
  }


}

export async function appendFeedbackRow(name: string, feedback: string, date: string) {
  const auth = getAuth();
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetTitle = 'feedback';
  const headers = ['Tên', 'Feedback', 'Ngày'];

  // Lấy danh sách các sheet
  const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const sheetTitles = sheetInfo.data.sheets?.map((s: any) => s.properties?.title) || [];

  if (!sheetTitles.includes(sheetTitle)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: sheetTitle } } },
        ],
      },
    });
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A1:C1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }

  // Đảm bảo có header đúng ngay cả khi sheet đã tồn tại nhưng chưa có
  const headerCheck = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetTitle}!A1:C1`,
  });
  const headerRow = headerCheck.data.values?.[0] || [];
  if (headerRow[0] !== headers[0] || headerRow[1] !== headers[1] || headerRow[2] !== headers[2]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetTitle}!A1:C1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers] },
    });
  }

  // tìm dòng tiếp theo
  const getRows = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetTitle}!A:A`,
  });
  const nextRow = (getRows.data.values?.length || 0) + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetTitle}!A${nextRow}:C${nextRow}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[name || '', feedback, date]] },
  });
} 
