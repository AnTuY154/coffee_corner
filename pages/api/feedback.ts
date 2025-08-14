import type { NextApiRequest, NextApiResponse } from 'next';
import { appendFeedbackRow } from '@/lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  try {
    const { name = '', feedback = '' } = req.body || {};
    if (!feedback || typeof feedback !== 'string' || !feedback.trim()) {
      return res.status(400).json({ message: 'Feedback is required' });
    }

    const date = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    appendFeedbackRow(String(name || ''), String(feedback), date);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error('Feedback API error:', err);
    return res.status(500).json({ message: err?.message || 'Internal Server Error' });
  }
} 