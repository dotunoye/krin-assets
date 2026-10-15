const { Resend } = require('resend');

const resend = new Resend(process.env.Resend_Api_Key);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the new ticket_code from the frontend payload
    const { parent_name, email, whatsapp_number, children_count, children_ages, attendance_mode, ticket_code } = req.body;

    const data = await resend.emails.send({
      from: 'Prophetic Kids Premiere <support@krinasset.org>', 
      to: [email],
      subject: `Your VIP Ticket: ${ticket_code} 🎟️ - Prophetic Kids Premiere`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #050b14; color: #ffffff; padding: 40px 20px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: #0a1120; border: 1px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d4af37, #aa8529); padding: 20px;">
              <h1 style="color: #050b14; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Official Access Pass</h1>
            </div>

            <!-- Body -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #a0aec0; margin-bottom: 5px;">Admit:</p>
              <h2 style="font-size: 28px; margin: 0 0 20px 0; color: #ffffff;">${parent_name}</h2>
              
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="font-size: 12px; text-transform: uppercase; color: #a0aec0; letter-spacing: 1px; margin: 0 0 5px 0;">Ticket ID</p>
                <p style="font-size: 32px; font-weight: bold; font-family: monospace; color: #d4af37; margin: 0; letter-spacing: 3px;">${ticket_code || 'VIP-GUEST'}</p>
              </div>

              <div style="text-align: left; background: #050b14; padding: 15px; border-radius: 8px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                <p style="margin: 5px 0;"><strong>🎫 Children:</strong> ${children_count} (Ages: ${children_ages})</p>
                <p style="margin: 5px 0;"><strong>📍 Format:</strong> ${attendance_mode} Attendance</p>
                <p style="margin: 5px 0;"><strong>📱 Contact:</strong> ${whatsapp_number}</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="border-top: 1px solid rgba(212, 175, 55, 0.2); padding: 20px;">
              <p style="font-size: 13px; color: #a0aec0; margin: 0;">Please present this code at the entrance on D-Day.</p>
            </div>
          </div>
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