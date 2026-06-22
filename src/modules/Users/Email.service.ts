import nodemailer from "nodemailer";
import dns from "dns";
import "dotenv/config";

export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      lookup: (hostname: string, opts: any, cb: any) => {
        dns.lookup(hostname, { ...opts, family: 4 }, cb);
      },
    } as any);
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const mailOptions = {
      from: '"Suporte LetMeDoIt" <no-reply@letmedoit.com>',
      to,
      subject: "Recuperação de Senha",
      text: `Olá!

Recebemos uma solicitação para redefinir a senha da sua conta no LetMeDoIt.

Para prosseguir com a alteração, clique no link abaixo (ou cole no seu navegador):
    ${process.env.FRONTEND_URL}/reset-password/${token}

Este link é válido por apenas 1 hora.

Se você não solicitou essa alteração, por favor, ignore este e-mail. Sua senha permanecerá a mesma e nenhuma ação é necessária.

Atenciosamente,
Equipe LetMeDoIt`,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(to: string, token: string) {
    const mailOptions = {
      from: '"LetMeDoIt" <no-reply@letmedoit.com>',
      to,
      subject: "Verifique seu email — LetMeDoIt",
      text: `Olá!

Bem-vindo ao LetMeDoIt! Para começar a usar sua conta, precisamos verificar seu endereço de email.

Clique no link abaixo (ou cole no seu navegador) para confirmar seu email:
    ${process.env.FRONTEND_URL}/verify-email/${token}

Este link é válido por apenas 1 hora.

Se você não criou uma conta no LetMeDoIt, por favor, ignore este e-mail.

Atenciosamente,
Equipe LetMeDoIt`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
