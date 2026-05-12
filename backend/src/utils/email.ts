import nodemailer from 'nodemailer'

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  if (!user || !pass) throw new Error('GMAIL_USER y GMAIL_APP_PASSWORD son requeridos')
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const from = process.env.GMAIL_USER
  await getTransporter().sendMail({
    from: `"CyberSec Labs" <${from}>`,
    to,
    subject: 'Restablece tu contraseña — CyberSec Labs',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#0A1545">Restablecer contraseña</h2>
        <p style="color:#374151;line-height:1.6">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta en CyberSec Labs.
          Haz clic en el botón para continuar. El enlace expira en 1 hora.
        </p>
        <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2596be;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Restablecer contraseña
        </a>
        <p style="color:#6b7280;font-size:13px">
          Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
        </p>
        <p style="color:#9ca3af;font-size:12px;margin-top:32px">
          O copia este enlace en tu navegador:<br/>
          <span style="color:#2596be">${resetLink}</span>
        </p>
      </div>
    `,
  })
}
