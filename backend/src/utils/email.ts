async function getAccessToken(): Promise<string> {
  const clientId = process.env.GMAIL_CLIENT_ID
  const clientSecret = process.env.GMAIL_CLIENT_SECRET
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN
  if (!clientId || !clientSecret || !refreshToken)
    throw new Error('GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET y GMAIL_REFRESH_TOKEN son requeridos')

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = (await res.json()) as { access_token?: string; error?: string }
  if (!res.ok || !data.access_token) throw new Error(`OAuth2 error: ${data.error}`)
  return data.access_token
}

export async function sendVerificationEmail(to: string, username: string, code: string): Promise<void> {
  const from = process.env.GMAIL_USER
  if (!from) throw new Error('GMAIL_USER es requerido')

  const accessToken = await getAccessToken()

  const subject = 'Verifica tu correo — CyberSec Labs'
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
      <h2 style="margin:0 0 8px;font-size:22px;color:#0A1545">Verificación de correo</h2>
      <p style="color:#374151;line-height:1.6">
        Hola <strong>${username}</strong>, gracias por registrarte en CyberSec Labs.
        Ingresa el siguiente código en la plataforma para activar tu cuenta. Expira en <strong>15 minutos</strong>.
      </p>
      <div style="margin:28px 0;padding:20px 32px;background:#f0f4ff;border-radius:12px;text-align:center;letter-spacing:0.35em;font-size:36px;font-weight:700;font-family:monospace;color:#0A1545;border:1px solid rgba(26,63,150,0.2)">
        ${code}
      </div>
      <p style="color:#6b7280;font-size:13px">
        Si no creaste esta cuenta, puedes ignorar este correo.
      </p>
    </div>
  `

  const mime = [
    `From: "CyberSec Labs" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n')

  const encoded = Buffer.from(mime, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gmail API error ${res.status}: ${body}`)
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const from = process.env.GMAIL_USER
  if (!from) throw new Error('GMAIL_USER es requerido')

  const accessToken = await getAccessToken()

  const subject = 'Restablece tu contraseña — CyberSec Labs'
  const html = `
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
  `

  const mime = [
    `From: "CyberSec Labs" <${from}>`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n')

  const encoded = Buffer.from(mime, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gmail API error ${res.status}: ${body}`)
  }
}
