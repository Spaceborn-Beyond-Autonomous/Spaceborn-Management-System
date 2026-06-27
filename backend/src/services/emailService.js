const nodemailer = require('nodemailer');

const getTransporter = () => {
  if (!process.env.SMTP_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });
};

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log('[email skipped] SMTP is not configured.');
    console.log(`[email skipped] To: ${to}`);
    console.log(`[email skipped] Subject: ${subject}`);
    console.log(text);
    return { sent: false, skipped: true, reason: 'SMTP is not configured' };
  }

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@spaceborn.local',
    to,
    subject,
    text,
    html
  });

  return { sent: true, messageId: info.messageId };
};

const sendPasswordResetEmail = async ({ to, name, employeeId, temporaryPassword, comments }) => {
  const subject = 'Your Spaceborn CMS password has been reset';
  const text = [
    `Hi ${name},`,
    '',
    'Your Spaceborn CMS password reset request has been approved.',
    `Employee ID: ${employeeId}`,
    `Temporary password: ${temporaryPassword}`,
    '',
    'Please sign in with this temporary password and change it immediately.',
    comments ? `Manager note: ${comments}` : '',
    '',
    'Spaceborn CMS'
  ].filter(Boolean).join('\n');

  const html = `
    <p>Hi ${name},</p>
    <p>Your Spaceborn CMS password reset request has been approved.</p>
    <p><strong>Employee ID:</strong> ${employeeId}<br />
    <strong>Temporary password:</strong> ${temporaryPassword}</p>
    <p>Please sign in with this temporary password and change it immediately.</p>
    ${comments ? `<p><strong>Manager note:</strong> ${comments}</p>` : ''}
    <p>Spaceborn CMS</p>
  `;

  return sendEmail({ to, subject, text, html });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail
};
