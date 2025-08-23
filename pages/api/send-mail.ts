import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';
import { appendDataToSheetByDate } from '../../lib/googleSheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, drink, size, price, condensedMilk, robusta, arabica, freshMilk, ice, note } = req.body;
  if (!name || !drink || !size || !price) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  const orderText = `Khách hàng: ${name}\nTên món: ${drink}\nSize: ${size}\nGiá: ${price}\nSữa đặc: ${condensedMilk}\nRobusta: ${robusta}\nArabica: ${arabica}\nSữa tươi: ${freshMilk}\nĐá: ${ice}\nGhi chú: ${note || ''}`;

  // Cấu hình transporter với SMTP. Thay đổi thông tin này cho phù hợp với tài khoản thực tế.
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Đặt biến môi trường này
      pass: process.env.GMAIL_PASS, // Đặt biến môi trường này
    },
  });
  
  console.log('Email sent successfully');
  
  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'cornersinabag@gmail.com',
      subject: `Đơn hàng mới từ ${name}`,
      text: orderText,
    });

    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    await appendDataToSheetByDate(dateStr, {
      'Khách hàng': name,
      'Tên món': drink,
      'Size': size,
      'Giá': price.toString(),
      'Sữa đặc': condensedMilk.toString(),
      'Robusta': robusta.toString(),
      'Arabica': arabica.toString(),
      'Sữa tươi': freshMilk.toString(),
      'Đá': ice.toString(),
      'Ghi chú': note || '',
    });

    return res.status(200).json({ message: 'Email sent successfully' + process.env.GMAIL_USER });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send email', error });
  }
} 
