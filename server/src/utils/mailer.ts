import nodemailer from 'nodemailer'
import { env } from '../config/env'

/**
 * Satu transporter dipakai bersama di seluruh aplikasi (dibuat sekali saat
 * modul ini pertama kali di-import), sama seperti pool koneksi MySQL di
 * src/db/pool.ts — nodemailer sendiri menangani pooling koneksi SMTP internal.
 */
const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
})

interface SendMailInput {
  to: string
  subject: string
  html: string
}

/**
 * Mengirim email. Kegagalan pengiriman DILEMPAR ke pemanggil (bukan ditelan
 * diam-diam) supaya endpoint yang memanggilnya (mis. approve verifikasi
 * admin) bisa memberi tahu admin bahwa email gagal terkirim, alih-alih
 * pura-pura sukses padahal user tidak akan pernah menerima kodenya.
 */
export async function sendMail({ to, subject, html }: SendMailInput): Promise<void> {
  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
  })
}

function emailShell(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1e293b;">
    <h2 style="margin: 0 0 16px; color: #0f172a;">${title}</h2>
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">
      Email ini dikirim otomatis oleh sistem PPDB SMA Bina Taruna. Mohon tidak membalas email ini.
    </p>
  </div>`
}

export function buildVerificationCodeEmail(name: string, code: string): { subject: string; html: string } {
  return {
    subject: 'Kode Verifikasi Akun — PPDB SMA Bina Taruna',
    html: emailShell(
      'Kode Verifikasi Akun Anda',
      `<p>Halo ${escapeHtml(name)},</p>
       <p>Pendaftaran akun Anda telah disetujui oleh admin. Gunakan kode berikut untuk memverifikasi akun Anda sebelum melakukan pendaftaran PPDB:</p>
       <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; background: #f1f5f9; padding: 16px; border-radius: 8px; color: #0f172a;">${code}</p>
       <p>Kode ini berlaku selama <strong>30 menit</strong>. Jika Anda tidak merasa mendaftar, abaikan email ini.</p>`,
    ),
  }
}

export function buildPpdbStatusEmail(
  name: string,
  registrationNumber: string,
  statusLabel: string,
  note: string | null,
): { subject: string; html: string } {
  return {
    subject: `Status Pendaftaran PPDB Diperbarui — ${registrationNumber}`,
    html: emailShell(
      'Status Pendaftaran PPDB Diperbarui',
      `<p>Halo ${escapeHtml(name)},</p>
       <p>Status pendaftaran PPDB Anda dengan nomor <strong>${escapeHtml(registrationNumber)}</strong> telah diperbarui menjadi:</p>
       <p style="font-size: 18px; font-weight: bold; text-align: center; background: #f1f5f9; padding: 12px; border-radius: 8px; color: #0f172a;">${escapeHtml(statusLabel)}</p>
       ${note ? `<p><strong>Catatan dari admin:</strong><br />${escapeHtml(note)}</p>` : ''}
       <p>Silakan login ke akun Anda untuk melihat detail lebih lanjut.</p>`,
    ),
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
