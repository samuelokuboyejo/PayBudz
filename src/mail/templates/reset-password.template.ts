import { MailTemplate } from './types';

export interface ResetPasswordTemplateData {
  resetLink: string;
}

export const ResetPasswordTemplate: MailTemplate<ResetPasswordTemplateData> = {
  subject: '🔐 Password Reset Request',
  render: ({ resetLink }) => `
  <!DOCTYPE html>
  <html lang="en" dir="ltr">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Password Reset</title>
    </head>
    <body style="background-color:#f3f4f6;font-family:Arial, sans-serif;padding:40px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <table width="600" style="background:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);" cellpadding="0" cellspacing="0">
              
              <!-- Header -->
              <tr>
                <td style="background:#3498db;color:#ffffff;text-align:center;padding:32px 24px;border-radius:8px 8px 0 0;">
                  <h1 style="font-size:28px;font-weight:bold;margin:0;line-height:1.2;">
                    🔐 Password Reset Request
                  </h1>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding:32px 24px;">
                  <h2 style="font-size:18px;color:#2c3e50;margin:0 0 16px 0;">Reset Your Password</h2>
                  <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px 0;">
                    We received a request to reset the password for your account. If you made this request, click the button below to create a new password.
                  </p>

                  <!-- Reset Button -->
                  <div style="text-align:center;margin-bottom:32px;">
                    <a href="${resetLink}" style="background:#3498db;color:#ffffff;padding:16px 32px;border-radius:8px;font-size:16px;font-weight:bold;text-decoration:none;display:inline-block;">
                      Reset My Password
                    </a>
                  </div>

                  <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px 0;">
                    This password reset link will expire in 24 hours for security reasons. If you need to reset your password after this time, you'll need to submit a new request.
                  </p>

                  <!-- Instructions -->
                  <div style="background:#f8f9fa;border:1px solid #ddd;border-radius:8px;padding:24px;margin-bottom:24px;">
                    <h3 style="font-size:18px;color:#2c3e50;margin:0 0 16px 0;">How to Reset Your Password:</h3>
                    <ol style="font-size:14px;color:#555;line-height:1.6;margin:0;padding-left:20px;">
                      <li style="margin-bottom:8px;">Click the "Reset My Password" button above</li>
                      <li style="margin-bottom:8px;">You'll be taken to a secure page to create your new password</li>
                      <li style="margin-bottom:8px;">Enter a strong password that you haven't used before</li>
                      <li>Confirm your new password and save the changes</li>
                    </ol>
                  </div>

                  <p style="font-size:16px;color:#555;line-height:1.6;margin:0 0 24px 0;">
                    If the button above doesn't work, copy and paste this link into your browser:
                  </p>

                  <p style="font-size:12px;color:#666;background:#f8f9fa;padding:12px;border-radius:4px;border:1px solid #ddd;font-family:monospace;word-break:break-all;margin:0 0 24px 0;">
                    ${resetLink}
                  </p>

                  <!-- Security Notice -->
                  <div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;padding:16px;margin-bottom:24px;">
                    <p style="font-size:14px;color:#856404;margin:0;line-height:1.5;">
                      <strong>⚠️ Important Security Notice:</strong> If you did not request a password reset, please ignore this email. Your password will remain unchanged, and your account is still secure. Consider changing your password if you suspect unauthorized access.
                    </p>
                  </div>

                  <p style="font-size:16px;color:#555;line-height:1.6;margin:0;">
                    If you're having trouble resetting your password or have any security concerns, please contact our support team immediately. We're here to help.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding:24px;text-align:center;border-top:1px solid #ddd;">
                  <p style="font-size:12px;color:#888;line-height:1.5;margin:0;">
                    This password reset link will expire in 24 hours for your security.
                    <br />If you need assistance, please contact our support team.
                  </p>
                  <p style="font-size:12px;color:#888;margin-top:16px;">
                    © ${new Date().getFullYear()} Your Company Name. All rights reserved.<br />
                    123 Business Street, City, State 12345
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `,
};
