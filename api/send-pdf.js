export default async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { pdfBase64, filename, userId } = req.body;
    const BOT_TOKEN = process.env.BOT_TOKEN;

    if (!pdfBase64 || !userId || !BOT_TOKEN) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Send PDF to Telegram user via Bot API
    const formData = new FormData();
    formData.append('chat_id', userId);
    formData.append('document', new Blob([pdfBuffer], { type: 'application/pdf' }), filename || 'report.pdf');
    formData.append('caption', '📋 Отчёт о приёмке яхты');

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!result.ok) {
      return res.status(500).json({ error: result.description });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
