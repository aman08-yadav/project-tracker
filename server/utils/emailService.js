const nodemailer = require('nodemailer');

// Create transporter - configured via environment variables
// Supported: Gmail (SMTP), SendGrid, Mailgun, or any SMTP provider
const createTransporter = () => {
  // Option 1: Gmail SMTP (set these env vars)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Option 2: Gmail direct (set GMAIL_USER + GMAIL_PASS)
  if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  // Option 3: SendGrid (set SENDGRID_API_KEY)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }

  // Fallback: no email config - log instead of sending
  return null;
};

const transporter = createTransporter();

const FROM_ADDRESS = process.env.EMAIL_FROM || process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@projecthub.com';
const APP_NAME = 'ProjectHub';

// ── Email Templates ────────────────────────────────────────────
const templates = {
  task_assigned: (senderName, taskTitle, projectName) => ({
    subject: `📋 New Task Assigned: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0d0d2b;border-radius:16px;color:#f1f5f9;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#7c3aed,#06b6d4);border-radius:12px;text-align:center;line-height:48px;font-size:1.5rem;">📋</div>
        </div>
        <h2 style="text-align:center;margin-bottom:16px;font-size:1.3rem;">New Task Assigned</h2>
        <p style="text-align:center;color:#94a3b8;margin-bottom:24px;">
          <strong style="color:#a78bfa;">${senderName}</strong> has assigned you a new task.
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:0.8rem;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Task</div>
          <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;">${taskTitle}</div>
          ${projectName ? `<div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">📁 ${projectName}</div>` : ''}
        </div>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/html/tasks.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;border-radius:10px;text-decoration:none;font-weight:600;">View Tasks →</a>
        </div>
      </div>
    `,
  }),

  task_completed: (senderName, taskTitle) => ({
    subject: `✅ Task Completed: ${taskTitle}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0d0d2b;border-radius:16px;color:#f1f5f9;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;text-align:center;line-height:48px;font-size:1.5rem;">✅</div>
        </div>
        <h2 style="text-align:center;margin-bottom:16px;font-size:1.3rem;">Task Completed</h2>
        <p style="text-align:center;color:#94a3b8;margin-bottom:24px;">
          <strong style="color:#a78bfa;">${senderName}</strong> has completed the task.
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:0.8rem;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">Task</div>
          <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;">${taskTitle}</div>
        </div>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/html/dashboard.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;border-radius:10px;text-decoration:none;font-weight:600;">View Dashboard →</a>
        </div>
      </div>
    `,
  }),

  file_approved: (senderName, fileName) => ({
    subject: `✅ File Approved: ${fileName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0d0d2b;border-radius:16px;color:#f1f5f9;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;text-align:center;line-height:48px;font-size:1.5rem;">✅</div>
        </div>
        <h2 style="text-align:center;margin-bottom:16px;font-size:1.3rem;">File Approved</h2>
        <p style="text-align:center;color:#94a3b8;margin-bottom:24px;">
          <strong style="color:#a78bfa;">${senderName}</strong> has approved your file upload.
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:0.8rem;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">File</div>
          <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;">📄 ${fileName}</div>
        </div>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/html/upload.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;border-radius:10px;text-decoration:none;font-weight:600;">View Files →</a>
        </div>
      </div>
    `,
  }),

  file_rejected: (senderName, fileName, reviewNote) => ({
    subject: `❌ File Rejected: ${fileName}`,
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#0d0d2b;border-radius:16px;color:#f1f5f9;">
        <div style="text-align:center;margin-bottom:24px;">
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#f43f5e,#e11d48);border-radius:12px;text-align:center;line-height:48px;font-size:1.5rem;">❌</div>
        </div>
        <h2 style="text-align:center;margin-bottom:16px;font-size:1.3rem;">File Rejected</h2>
        <p style="text-align:center;color:#94a3b8;margin-bottom:24px;">
          <strong style="color:#a78bfa;">${senderName}</strong> has rejected your file upload.
        </p>
        <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
          <div style="font-size:0.8rem;color:#475569;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">File</div>
          <div style="font-size:1.05rem;font-weight:600;color:#f1f5f9;">📄 ${fileName}</div>
          ${reviewNote ? `<div style="margin-top:12px;padding:12px;background:rgba(244,63,94,0.1);border:1px solid rgba(244,63,94,0.3);border-radius:8px;font-size:0.85rem;color:#fb7185;"><strong>Reason:</strong> ${reviewNote}</div>` : ''}
        </div>
        <div style="text-align:center;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5001'}/html/upload.html" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:white;border-radius:10px;text-decoration:none;font-weight:600;">Upload New File →</a>
        </div>
      </div>
    `,
  }),
};

// ── Send Email ─────────────────────────────────────────────────
const sendEmail = async (to, templateKey, data) => {
  if (!transporter) {
    console.log(`[Email] No transporter configured. Would send "${templateKey}" to ${to}`);
    return false;
  }

  const template = templates[templateKey];
  if (!template) {
    console.error(`[Email] Unknown template: ${templateKey}`);
    return false;
  }

  const { subject, html } = template(data.senderName, data.taskTitle || data.fileName, data.projectName, data.reviewNote);

  try {
    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent "${subject}" to ${to}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error.message);
    return false;
  }
};

module.exports = { sendEmail };
