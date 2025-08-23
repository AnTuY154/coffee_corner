import { NextApiRequest, NextApiResponse } from 'next';
import { testGoogleSheetsConnection } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const result = await testGoogleSheetsConnection();
    res.status(result.success ? 200 : 500).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 