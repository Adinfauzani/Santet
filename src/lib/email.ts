import { Resend } from "resend";
import { sendEmail as sendInfraEmail } from "@better-auth/infra";

const FROM = "Sant.Ai <noreply@santech.id>";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function otpHTML(otp: string, label: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;padding:40px 20px;background:#f4f4f4">
<div style="max-width:480px;margin:0 auto;background:#fff;border:2px solid #111;padding:32px">
<h1 style="font-size:18px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">Verify Your Sant.Ai Account</h1>
<p style="font-size:14px;color:#333;margin:0 0 24px">Your verification code is:</p>
<div style="font-size:40px;letter-spacing:8px;text-align:center;font-weight:700;margin:0 0 24px;font-family:monospace">${otp}</div>
<p style="font-size:12px;color:#666;margin:0 0 4px">This code expires in 10 minutes.</p>
<p style="font-size:12px;color:#666;margin:0 0 24px">If you did not request this code, please ignore this email.</p>
<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
<p style="font-size:11px;color:#999;margin:0">Sant.Ai — Science, Technology &amp; Artificial Intelligence</p>
</div></body></html>`;
}

function linkHTML(url: string, action: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;padding:40px 20px;background:#f4f4f4">
<div style="max-width:480px;margin:0 auto;background:#fff;border:2px solid #111;padding:32px">
<h1 style="font-size:18px;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">${action}</h1>
<p style="font-size:14px;color:#333;margin:0 0 24px">Click the button below to ${action.toLowerCase()}.</p>
<a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 32px;font-size:14px;font-weight:700;text-transform:uppercase">${action}</a>
<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">
<p style="font-size:11px;color:#999;margin:0">Sant.Ai — Science, Technology &amp; Artificial Intelligence</p>
</div></body></html>`;
}

const typeLabels: Record<string, string> = {
  "sign-in": "Sign In",
  "email-verification": "Email Verification",
  "forget-password": "Password Reset",
  "change-email": "Change Email",
};

const otpSubjects: Record<string, string> = {
  "sign-in": "Sign In Code",
  "email-verification": "Verify Your Sant.Ai Account",
  "forget-password": "Password Reset Code",
  "change-email": "Change Email Code",
};

async function tryResend(
  to: string,
  subject: string,
  html: string,
  fallback: string,
) {
  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({ from: FROM, to, subject, html });
      console.log(`[Email] Sent "${subject}" to ${to} via Resend`);
      return;
    } catch (err) {
      console.error(`[Email] Resend failed:`, err);
    }
  }
  console.log(`[Email] ${fallback}`);
}

export async function sendVerificationEmail(email: string, url: string) {
  await tryResend(email, "Verify Your Sant.Ai Account", linkHTML(url, "Verify Email"),
    `Verification link: ${url}`);
}

export async function sendPasswordResetEmail(email: string, url: string) {
  await tryResend(email, "Reset Your Password", linkHTML(url, "Reset Password"),
    `Reset password link: ${url}`);
}

export async function sendOTP(email: string, otp: string, type: string) {
  const label = typeLabels[type] || type;
  const subject = otpSubjects[type] || "Verification Code";
  await tryResend(email, subject, otpHTML(otp, label),
    `OTP (${label}): ${otp} for ${email}`);
}
