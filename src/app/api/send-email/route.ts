import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  // If no API key is set, we simulate a success for demonstration purposes
  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not set. Simulating email send.");
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
    return NextResponse.json({ success: true, message: "Simulated email sent (API key missing)" });
  }

  const resend = new Resend(resendApiKey);

  try {
    const { firstName, lastName, email, type, date, duration } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'M&A Now <onboarding@resend.dev>', // Use resend.dev for testing, or your verified domain
      to: [email], // In test mode, this must be your account email usually
      subject: 'M&A Now - Booking Confirmation',
      html: `
        <h1>Booking Confirmation</h1>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Thank you for booking a negotiation session with M&A Now.</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
          <li><strong>Duration:</strong> ${duration} Days</li>
          <li><strong>Negotiation Type:</strong> ${type}</li>
        </ul>

        <p>We have received your signed NDA.</p>
        
        <p>Best regards,<br>The M&A Now Team</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
