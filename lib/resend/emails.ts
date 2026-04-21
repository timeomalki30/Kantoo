import { resend } from './client'

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@artisants.fr'
const APP_NAME = 'Artisants'

export async function sendWelcomeEmail({
  to,
  name,
}: {
  to: string
  name: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Bienvenue sur ${APP_NAME} !`,
    html: `
      <h1>Bienvenue ${name} !</h1>
      <p>Votre compte ${APP_NAME} a été créé avec succès.</p>
      <p>Vous pouvez dès maintenant accéder à votre espace depuis <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">votre tableau de bord</a>.</p>
      <p>L'équipe ${APP_NAME}</p>
    `,
  })
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
}: {
  to: string
  resetLink: string
}) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p><a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
      <p>L'équipe ${APP_NAME}</p>
    `,
  })
}

export async function sendPaymentConfirmationEmail({
  to,
  name,
  amount,
  currency = 'EUR',
}: {
  to: string
  name: string
  amount: number
  currency?: string
}) {
  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount / 100)

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Confirmation de paiement',
    html: `
      <h1>Paiement confirmé</h1>
      <p>Bonjour ${name},</p>
      <p>Votre paiement de <strong>${formatted}</strong> a bien été reçu.</p>
      <p>Merci de votre confiance !</p>
      <p>L'équipe ${APP_NAME}</p>
    `,
  })
}
