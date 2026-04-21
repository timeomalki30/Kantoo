import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Kantoo — Devis en 2 minutes pour artisans',
    template: '%s | Kantoo',
  },
  description: "Créez des devis professionnels en 2 minutes, faites-les signer en ligne et encaissez directement. L'outil des artisans nouvelle génération.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
