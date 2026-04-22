/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Kantoo',
  description: 'Comment Kantoo collecte, utilise et protège vos données personnelles.',
}

const UPDATED = '22 avril 2026'

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-10 text-lg font-bold text-gray-900 first:mt-0">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-gray-600">{children}</p>
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="mb-1.5 flex items-start gap-2 text-gray-600">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
      <span>{children}</span>
    </li>
  )
}

function Table({ rows }: { rows: [string, string, string][] }) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Donnée</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Finalité</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Base légale</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([data, purpose, basis], i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="px-4 py-3 font-medium text-gray-800">{data}</td>
              <td className="px-4 py-3 text-gray-600">{purpose}</td>
              <td className="px-4 py-3 text-gray-500">{basis}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <Logo size="sm" variant="full" />
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
            ← Retour
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-orange-500">
          RGPD
        </p>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Politique de confidentialité
        </h1>
        <p className="mb-10 text-sm text-gray-400">
          Dernière mise à jour : {UPDATED}
        </p>

        {/* ── 1 ── */}
        <H2>1. Responsable du traitement</H2>
        <P>
          Le responsable du traitement des données personnelles collectées via
          Kantoo est <strong>Kantoo SAS</strong>, joignable à l&apos;adresse{' '}
          <a href="mailto:hello@kantoo.fr" className="text-orange-500 hover:underline">
            hello@kantoo.fr
          </a>.
        </P>

        {/* ── 2 ── */}
        <H2>2. Données collectées et finalités</H2>
        <P>
          Kantoo collecte uniquement les données strictement nécessaires au
          fonctionnement du service (principe de minimisation — art. 5 RGPD).
        </P>

        <Table
          rows={[
            ['Email, mot de passe (hashé)', 'Création et accès au compte', 'Exécution du contrat'],
            ['Nom, prénom, téléphone', 'Personnalisation du profil', 'Exécution du contrat'],
            ['SIRET, statut juridique, N° TVA', 'Génération de documents conformes', 'Obligation légale'],
            ['IBAN', 'Affichage sur les factures', 'Consentement'],
            ['Données clients (nom, email, adresse)', 'Gestion du carnet de clients', 'Exécution du contrat'],
            ['Devis et factures générés', 'Archivage, consultation, export', 'Obligation légale (10 ans)'],
            ['Données de connexion (IP, horodatage)', 'Sécurité, lutte contre la fraude', 'Intérêt légitime'],
            ['Données de paiement (Stripe)', 'Traitement des abonnements', 'Exécution du contrat'],
          ]}
        />

        {/* ── 3 ── */}
        <H2>3. Hébergement et transferts</H2>
        <P>
          Toutes les données sont hébergées en <strong>Europe</strong> (région EU-West) :
        </P>
        <ul className="mb-4 list-none">
          <Li><strong>Supabase</strong> (base de données, stockage fichiers) — serveurs AWS eu-west-1, Irlande.</Li>
          <Li><strong>Vercel</strong> (hébergement de l&apos;application) — edge network Europe.</Li>
          <Li><strong>Stripe</strong> (paiements) — conforme PCI-DSS, données financières traitées en UE.</Li>
        </ul>
        <P>
          Aucun transfert de données hors de l&apos;Espace Économique Européen (EEE)
          n&apos;est effectué sans garanties appropriées (clauses contractuelles types
          de la Commission européenne).
        </P>

        {/* ── 4 ── */}
        <H2>4. Durée de conservation</H2>
        <ul className="mb-4 list-none">
          <Li><strong>Données de compte</strong> : conservées pendant toute la durée de l&apos;abonnement, puis 3 ans après résiliation.</Li>
          <Li><strong>Devis et factures</strong> : 10 ans conformément aux obligations comptables et fiscales françaises (art. L.123-22 du Code de commerce).</Li>
          <Li><strong>Logs de connexion</strong> : 12 mois maximum.</Li>
          <Li><strong>Données de paiement</strong> : conservées par Stripe selon ses propres politiques (5 ans).</Li>
        </ul>

        {/* ── 5 ── */}
        <H2>5. Vos droits (RGPD)</H2>
        <P>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD — UE 2016/679), vous disposez des droits suivants :
        </P>
        <ul className="mb-4 list-none">
          <Li><strong>Droit d&apos;accès</strong> — obtenir une copie de vos données.</Li>
          <Li><strong>Droit de rectification</strong> — corriger des données inexactes.</Li>
          <Li><strong>Droit à l&apos;effacement</strong> — demander la suppression, dans les limites des obligations légales de conservation.</Li>
          <Li><strong>Droit à la portabilité</strong> — recevoir vos données dans un format structuré (export CSV disponible directement dans l&apos;application).</Li>
          <Li><strong>Droit d&apos;opposition</strong> — vous opposer au traitement fondé sur l&apos;intérêt légitime.</Li>
          <Li><strong>Droit à la limitation</strong> — demander la suspension du traitement.</Li>
        </ul>
        <P>
          Pour exercer vos droits :{' '}
          <a href="mailto:hello@kantoo.fr" className="text-orange-500 hover:underline">
            hello@kantoo.fr
          </a>. Réponse sous 30 jours.
        </P>
        <P>
          En cas de litige non résolu, vous pouvez saisir la{' '}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-500 hover:underline"
          >
            CNIL
          </a>
          .
        </P>

        {/* ── 6 ── */}
        <H2>6. Cookies</H2>
        <P>
          Kantoo utilise uniquement des cookies <strong>strictement nécessaires</strong>
          au fonctionnement de l&apos;application (session d&apos;authentification Supabase).
          Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé.
        </P>

        {/* ── 7 ── */}
        <H2>7. Sécurité</H2>
        <P>
          Kantoo met en œuvre les mesures techniques et organisationnelles
          suivantes pour protéger vos données :
        </P>
        <ul className="mb-4 list-none">
          <Li>Chiffrement des données en transit (TLS 1.3) et au repos (AES-256).</Li>
          <Li>Authentification par mot de passe haché (bcrypt via Supabase Auth).</Li>
          <Li>Isolation des données par utilisateur via Row-Level Security (RLS) Supabase.</Li>
          <Li>Hash SHA-256 des factures à la création pour garantir leur inaltérabilité (loi anti-fraude TVA).</Li>
          <Li>Accès aux données de production restreint aux seuls administrateurs système.</Li>
        </ul>

        {/* ── 8 ── */}
        <H2>8. Sous-traitants</H2>
        <Table
          rows={[
            ['Supabase Inc.', 'Base de données, authentification, stockage', 'Irlande (AWS EU)'],
            ['Vercel Inc.', 'Hébergement de l\'application', 'Europe (edge)'],
            ['Stripe Inc.', 'Traitement des paiements', 'UE — PCI-DSS'],
            ['Resend Inc.', 'Envoi d\'emails transactionnels', 'EU'],
          ]}
        />

        {/* ── 9 ── */}
        <H2>9. Modification de la politique</H2>
        <P>
          Cette politique peut être mise à jour. Toute modification
          substantielle sera notifiée par email. La date de mise à jour
          est indiquée en haut de cette page.
        </P>

        {/* Footer interne */}
        <div className="mt-12 border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
            Kantoo SAS · <a href="mailto:hello@kantoo.fr" className="hover:text-gray-600">hello@kantoo.fr</a>
            {' '}·{' '}
            <Link href="/cgv" className="hover:text-gray-600">CGV</Link>
            {' '}·{' '}
            <Link href="/mentions-legales" className="hover:text-gray-600">Mentions légales</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
