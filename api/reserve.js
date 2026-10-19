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
      from: 'Prophetic Kids Premiere <prophetickids@krinasset.org>', 
      to: [email],
      subject: `Your VIP Ticket: ${ticket_code} 🎟️ - Prophetic Kids Premiere`,
      html: `
        <div style="color: white; padding: 24px 12px; text-align: center;">
          <div style="max-width: 500px; margin: 0 auto; background: #0a1120; border: 1px solid #d4af37; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #d4af37, #aa8529); padding: 24px; font-family:'Outfit', 'Quicksand', system-ui, sans-serif;">
              <h1 style="color: #050b14; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Official Access Pass</h1>
            </div>

            <!-- Body -->
            <div style="padding: 20px;">
              <p style="font-family:'Nunito', system-ui, sans-serif; font-size: 16px; color: #a0aec0; margin-bottom: 5px;">Admit:</p>
              <h2 style="font-size: 24px; margin: 0 0 20px 0; color: #ffffff;">${parent_name}</h2>
              
              <div style="background: rgba(255, 255, 255, 0.05); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                <p style="font-size: 12px; text-transform: uppercase; color: #a0aec0; letter-spacing: 1px; margin: 0 0 5px 0;">Ticket ID</p>
                <p style="font-size: 32px; font-weight: bold; font-family: 'Nunito', system-ui, sans-serif; color: #ffb800; margin: 0; letter-spacing: 3px;">${ticket_code || 'VIP-GUEST'}</p>
              </div>

              <!-- Ticket Details -->
              <div style="text-align: left; background: #050b14; padding: 15px; border-radius: 8px; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                <p style="margin: 5px 0;"><strong>🗓️ Date:</strong> Saturday, Nov 28, 2026</p>
                <p style="margin: 5px 0;"><strong>⏰ Time:</strong> 9:00 AM</p>
                <p style="margin: 5px 0;"><strong>📍 Location:</strong> Root of David, Road 1, Lekky County Homes, Lekki, Lagos</p>
                <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;">
                <p style="margin: 5px 0;"><strong>🎫 Children:</strong> ${children_count} (Ages: ${children_ages})</p>
                <p style="margin: 5px 0;"><strong>📡 Format:</strong> ${attendance_mode} Attendance</p>
                <p style="margin: 5px 0;"><strong>📱 Contact:</strong> ${whatsapp_number}</p>
              </div>

              <!-- Add to Calendar Button -->
              <div style="margin-top: 25px;">
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Prophetic+Kids+Animation+Premiere&dates=20261128T080000Z/20261128T110000Z&details=Your+Official+Access+Pass+for+the+premiere.%0A%0ATicket+ID:+${ticket_code || 'GUEST'}%0AFormat:+${attendance_mode}&location=Root+of+David,+Road+1,+Lekky+County+Homes,+Lekki,+Lagos" target="_blank" style="background: #d4af37; color: #050b14; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-family: 'Outfit', system-ui, sans-serif; display: inline-block; font-size: 15px;">📅 Add to Google Calendar</a>
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