import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const frontendUrl = process.env.FRONTEND_URL || "https://letmedoit.app.br";

function logoUrl() {
  return `${frontendUrl}/logo.webp`;
}

function emailLayout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Inter',Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
          <tr>
            <td align="center" style="background-color:#059669;padding:32px 24px 24px;border-radius:16px 16px 0 0;">
              <img src="${logoUrl()}" alt="LetMeDoIt" width="160" style="display:block;border:0;outline:none;height:auto;">
              <h1 style="color:#ffffff;font-size:14px;font-weight:400;margin:8px 0 0;letter-spacing:0.5px;">
                CORREÇÃO DE PROVAS POR IA
              </h1>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:32px 32px 24px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;padding:0 32px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                      LetMeDoIt — Correção de provas por IA<br>
                      <a href="${frontendUrl}" style="color:#059669;text-decoration:none;font-weight:600;">${frontendUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(href: string, label: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td align="center">
      <a href="${href}" target="_blank" style="display:inline-block;background-color:#059669;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

function fallbackLink(href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:16px;">
  <tr>
    <td>
      <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;text-align:center;">
        Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
      </p>
      <p style="margin:8px 0 0;font-size:12px;color:#059669;word-break:break-all;text-align:center;">
        <a href="${href}" style="color:#059669;">${href}</a>
      </p>
    </td>
  </tr>
</table>`;
}

export class EmailService {
  async sendVerificationEmail(to: string, token: string) {
    const link = `${frontendUrl}/verify-email/${token}`;

    await resend.emails.send({
      from: `LetMeDoIt <${fromEmail}>`,
      to,
      subject: "Verifique seu email — LetMeDoIt",
      text: `Olá!\n\nBem-vindo ao LetMeDoIt! Para começar a usar sua conta, precisamos verificar seu endereço de email.\n\nClique no link abaixo para confirmar seu email:\n${link}\n\nEste link é válido por apenas 1 hora.\n\nSe você não criou uma conta no LetMeDoIt, por favor, ignore este e-mail.\n\nAtenciosamente,\nEquipe LetMeDoIt`,
      html: emailLayout(`
        <p style="margin:0 0 8px;font-size:16px;color:#334155;line-height:1.6;">
          Olá!
        </p>
        <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
          Bem-vindo ao <strong style="color:#059669;">LetMeDoIt</strong>! Para começar a usar sua conta, precisamos verificar seu endereço de email.
        </p>
        ${button(link, "Verificar Email")}
        ${fallbackLink(link)}
        <p style="margin:24px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Este link é válido por apenas <strong>1 hora</strong>.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Se você não criou uma conta no LetMeDoIt, por favor, ignore este e-mail.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Atenciosamente,<br>
          <strong style="color:#059669;">Equipe LetMeDoIt</strong>
        </p>
      `),
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${frontendUrl}/reset-password/${token}`;

    await resend.emails.send({
      from: `LetMeDoIt <${fromEmail}>`,
      to,
      subject: "Recuperação de Senha — LetMeDoIt",
      text: `Olá!\n\nRecebemos uma solicitação para redefinir a senha da sua conta no LetMeDoIt.\n\nClique no link abaixo para redefinir sua senha:\n${link}\n\nEste link é válido por apenas 1 hora.\n\nSe você não solicitou essa alteração, ignore este e-mail.\n\nAtenciosamente,\nEquipe LetMeDoIt`,
      html: emailLayout(`
        <p style="margin:0 0 8px;font-size:16px;color:#334155;line-height:1.6;">
          Olá!
        </p>
        <p style="margin:0 0 16px;font-size:16px;color:#334155;line-height:1.6;">
          Recebemos uma solicitação para redefinir a senha da sua conta no <strong style="color:#059669;">LetMeDoIt</strong>.
        </p>
        ${button(link, "Redefinir Senha")}
        ${fallbackLink(link)}
        <p style="margin:24px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Este link é válido por apenas <strong>1 hora</strong>.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Se você não solicitou essa alteração, por favor, ignore este e-mail. Sua senha permanecerá a mesma e nenhuma ação é necessária.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#64748b;line-height:1.5;">
          Atenciosamente,<br>
          <strong style="color:#059669;">Equipe LetMeDoIt</strong>
        </p>
      `),
    });
  }
}
