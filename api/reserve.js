const { Resend } = require('resend');

const resend = new Resend(process.env.Resend_Api_Key);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { parent_name, email, whatsapp_number, children_count, children_ages, attendance_mode } = req.body;

    const data = await resend.emails.send({
      from: 'Prophetic Kids Premiere <support@krinasset.org>', 
      to: [email],
      subject: 'Your Spot is Reserved! 🎉 - Prophetic Kids Premiere',
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; background: #0a1120; color: #ffffff; padding: 40px 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #d4af37; text-align: center;">Spot Confirmed!</h1>
          <p>Hello <strong>${parent_name}</strong>,</p>
          <p>Thank you for reserving a spot for the Prophetic Kids Animation Premiere.</p>
          <ul>
            <li><strong>Tickets:</strong> ${children_count} Child(ren)</li>
            <li><strong>Ages:</strong> ${children_ages}</li>
            <li><strong>Format:</strong> ${attendance_mode}</li>
          </ul>
          <p>We will send updates to your WhatsApp (${whatsapp_number}).</p>
        </div>
      `
    });

    if (data.error) {
      console.error('Resend API rejected the payload:', data.error);
      return res.status(500).json({ success: false, error: data.error.message });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Server crash:', error);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};