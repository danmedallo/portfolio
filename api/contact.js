// Vercel serverless function: POST /api/contact
// Sends the contact form to your inbox through Resend.
//
// Environment variables (set in Vercel → Project → Settings → Environment Variables):
//   RESEND_API_KEY      required — your Resend API key (re_...)
//   CONTACT_TO_EMAIL    required — where messages are delivered
//   CONTACT_FROM_EMAIL  optional — defaults to Resend's test sender, which can only
//                       deliver to the email address your Resend account uses.
//                       After verifying a domain, use e.g. "Portfolio <contact@yourdomain.com>".

const LIMITS = { name: 100, email: 200, subject: 150, message: 5000 };

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL || 'Portfolio Contact <onboarding@resend.dev>';
    if (!apiKey || !to) {
        console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL');
        return res.status(500).json({ error: 'Email is not configured on the server.' });
    }

    const body = typeof req.body === 'string' ? safeParse(req.body) : (req.body || {});

    // Honeypot: real visitors never see or fill this field. Pretend success for bots.
    if (body.website) {
        return res.status(200).json({ ok: true });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim();
    const subject = String(body.subject || '').trim();
    const message = String(body.message || '').trim();

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (name.length > LIMITS.name || email.length > LIMITS.email ||
        subject.length > LIMITS.subject || message.length > LIMITS.message) {
        return res.status(400).json({ error: 'One of the fields is too long.' });
    }

    const html = `
        <h2 style="margin:0 0 12px">New message from your portfolio</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject || '(none)')}</p>
        <hr />
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;
    const text = `Name: ${name}\nEmail: ${email}\nSubject: ${subject || '(none)'}\n\n${message}`;

    try {
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from,
                to: [to],
                reply_to: email,
                subject: `Portfolio: ${subject || 'New message'} — ${name}`.slice(0, 200),
                html,
                text,
            }),
        });

        if (!resendRes.ok) {
            const detail = await resendRes.text();
            console.error('Resend error', resendRes.status, detail);
            return res.status(502).json({ error: 'Could not send your message. Please try again later.' });
        }

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error('Resend request failed', err);
        return res.status(502).json({ error: 'Could not send your message. Please try again later.' });
    }
};

function safeParse(str) {
    try { return JSON.parse(str); } catch (e) { return {}; }
}
