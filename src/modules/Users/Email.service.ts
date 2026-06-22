import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

export class EmailService {
  async sendVerificationEmail(to: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    await resend.emails.send({
      from: `LetMeDoIt <${fromEmail}>`,
      to,
      subject: "Verifique seu email — LetMeDoIt",
      text: `Olá!

Bem-vindo ao LetMeDoIt! Para começar a usar sua conta, precisamos verificar seu endereço de email.

Clique no link abaixo (ou cole no seu navegador) para confirmar seu email:
    ${link}

Este link é válido por apenas 1 hora.

Se você não criou uma conta no LetMeDoIt, por favor, ignore este e-mail.

Atenciosamente,
Equipe LetMeDoIt`,
      html: `<p>Olá!</p>
<p>Bem-vindo ao LetMeDoIt! Para começar a usar sua conta, precisamos verificar seu endereço de email.</p>
<p>Clique no link abaixo para confirmar seu email:</p>
<p><a href="${link}">${link}</a></p>
<p>Este link é válido por apenas <strong>1 hora</strong>.</p>
<p>Se você não criou uma conta no LetMeDoIt, por favor, ignore este e-mail.</p>
<p>Atenciosamente,<br>Equipe LetMeDoIt</p>`,
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    await resend.emails.send({
      from: `LetMeDoIt <${fromEmail}>`,
      to,
      subject: "Recuperação de Senha — LetMeDoIt",
      text: `Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no LetMeDoIt.

Para prosseguir com a alteração, clique no link abaixo (ou cole no seu navegador):
    ${link}

Este link é válido por apenas 1 hora.

Se você não solicitou essa alteração, por favor, ignore este e-mail. Sua senha permanecerá a mesma e nenhuma ação é necessária.

Atenciosamente,
Equipe LetMeDoIt`,
      html: `<p>Olá!</p>
<p>Recebemos uma solicitação para redefinir a senha da sua conta no LetMeDoIt.</p>
<p>Para prosseguir com a alteração, clique no link abaixo:</p>
<p><a href="${link}">${link}</a></p>
<p>Este link é válido por apenas <strong>1 hora</strong>.</p>
<p>Se você não solicitou essa alteração, por favor, ignore este e-mail. Sua senha permanecerá a mesma e nenhuma ação é necessária.</p>
<p>Atenciosamente,<br>Equipe LetMeDoIt</p>`,
    });
  }
}
