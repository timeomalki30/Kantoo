/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — Kantoo',
  description: 'CGV de Kantoo, logiciel de facturation pour artisans.',
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

export default function CGVPage() {
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
          Mentions légales
        </p>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Conditions Générales de Vente
        </h1>
        <p className="mb-10 text-sm text-gray-400">
          Dernière mise à jour : {UPDATED}
        </p>

        {/* ── 1 ── */}
        <H2>1. Éditeur du service</H2>
        <P>
          Kantoo est un logiciel de facturation en ligne édité par Kantoo SAS,
          accessible à l'adresse <strong>kantoo.fr</strong>.
          Pour toute question : <a href="mailto:hello@kantoo.fr" className="text-orange-500 hover:underline">hello@kantoo.fr</a>.
        </P>

        {/* ── 2 ── */}
        <H2>2. Objet</H2>
        <P>
          Les présentes Conditions Générales de Vente (CGV) régissent l'accès et
          l'utilisation du service Kantoo (ci-après « le Service »), logiciel de
          gestion de devis et factures à destination des artisans, auto-entrepreneurs
          et petites entreprises françaises.
        </P>
        <P>
          Tout abonnement au Service implique l'acceptation sans réserve des
          présentes CGV.
        </P>

        {/* ── 3 ── */}
        <H2>3. Description du service</H2>
        <P>
          Kantoo permet notamment de :
        </P>
        <ul className="mb-4 list-none space-y-0">
          <Li>Créer, envoyer et suivre des devis et factures conformes à la législation française.</Li>
          <Li>Gérer un carnet de clients.</Li>
          <Li>Suivre les encaissements et l'état des paiements.</Li>
          <Li>Télécharger et archiver les documents générés.</Li>
          <Li>Respecter les obligations issues de la loi anti-fraude TVA (décret n° 2021-1089).</Li>
        </ul>
        <P>
          Le Service est fourni « en l'état ». Kantoo se réserve le droit de faire
          évoluer ses fonctionnalités à tout moment.
        </P>

        {/* ── 4 ── */}
        <H2>4. Abonnement et tarifs</H2>
        <P>
          Le Service est proposé selon les formules tarifaires affichées sur la page
          de tarification de kantoo.fr, susceptibles d'être modifiées avec un
          préavis de 30 jours communiqué par email.
        </P>
        <ul className="mb-4 list-none">
          <Li><strong>Facturation mensuelle ou annuelle</strong> par prélèvement automatique via Stripe.</Li>
          <Li><strong>Période d'essai gratuite</strong> telle qu'indiquée lors de l'inscription, sans engagement.</Li>
          <Li>Les prix sont indiqués <strong>TTC</strong> pour les particuliers et <strong>HT</strong> pour les professionnels assujettis à la TVA.</Li>
        </ul>

        {/* ── 5 ── */}
        <H2>5. Conditions de paiement</H2>
        <P>
          Le paiement s'effectue par carte bancaire via la plateforme sécurisée
          Stripe. Les données bancaires ne sont jamais stockées sur les serveurs
          de Kantoo.
        </P>
        <P>
          En cas d'échec de paiement, l'accès au Service peut être suspendu après
          un délai de 7 jours et une relance email.
        </P>

        {/* ── 6 ── */}
        <H2>6. Droit de rétractation</H2>
        <P>
          Conformément à l'article L.221-28 du Code de la consommation, le droit
          de rétractation ne s'applique pas aux services numériques pleinement
          exécutés avant la fin du délai de rétractation, avec l'accord préalable
          exprès du consommateur.
        </P>
        <P>
          Pour un abonnement mensuel, vous pouvez résilier à tout moment depuis
          votre espace compte. La résiliation prend effet à la fin de la période
          en cours, sans remboursement au prorata.
        </P>

        {/* ── 7 ── */}
        <H2>7. Durée et résiliation</H2>
        <P>
          L'abonnement est conclu pour une durée indéterminée, renouvelable
          automatiquement chaque mois ou chaque année selon la formule choisie.
        </P>
        <P>
          Vous pouvez résilier à tout moment depuis la section « Mon compte »
          ou en contactant <a href="mailto:hello@kantoo.fr" className="text-orange-500 hover:underline">hello@kantoo.fr</a>.
          Kantoo peut résilier l'accès en cas de non-paiement ou d'utilisation
          contraire aux présentes CGV.
        </P>

        {/* ── 8 ── */}
        <H2>8. Propriété intellectuelle</H2>
        <P>
          L'ensemble des éléments du Service (interface, code, base de données,
          logo, marque Kantoo) est la propriété exclusive de Kantoo SAS et est
          protégé par le droit de la propriété intellectuelle.
        </P>
        <P>
          Les données saisies par l'utilisateur (clients, devis, factures)
          restent sa propriété. Kantoo ne revendique aucun droit sur ces données.
        </P>

        {/* ── 9 ── */}
        <H2>9. Responsabilité</H2>
        <P>
          Kantoo s'engage à mettre tout en œuvre pour assurer la disponibilité
          et la sécurité du Service (objectif de disponibilité : 99,5 % mensuel).
          En cas d'interruption planifiée, l'utilisateur est informé à l'avance.
        </P>
        <P>
          Kantoo ne peut être tenu responsable des dommages indirects liés à
          l'utilisation du Service, ni des erreurs dans les documents générés
          dues à des données incorrectes saisies par l'utilisateur.
        </P>
        <P>
          L'utilisateur est seul responsable de la conformité fiscale et légale
          des documents émis via Kantoo au regard de sa propre situation.
        </P>

        {/* ── 10 ── */}
        <H2>10. Données personnelles</H2>
        <P>
          Le traitement des données personnelles est décrit dans notre{' '}
          <Link href="/confidentialite" className="text-orange-500 hover:underline">
            Politique de confidentialité
          </Link>.
        </P>

        {/* ── 11 ── */}
        <H2>11. Modification des CGV</H2>
        <P>
          Kantoo se réserve le droit de modifier les présentes CGV. Toute
          modification substantielle sera notifiée par email avec un préavis
          de 30 jours. La poursuite de l'utilisation du Service après ce délai
          vaut acceptation des nouvelles CGV.
        </P>

        {/* ── 12 ── */}
        <H2>12. Droit applicable et juridiction</H2>
        <P>
          Les présentes CGV sont soumises au droit français. En cas de litige,
          et après tentative de résolution amiable, les tribunaux compétents
          de Paris seront seuls compétents.
        </P>
        <P>
          Conformément à l'article L.612-1 du Code de la consommation, tout
          consommateur a le droit de recourir gratuitement à un médiateur de
          la consommation.
        </P>

        {/* Footer interne */}
        <div className="mt-12 border-t border-gray-100 pt-8 text-center">
          <p className="text-xs text-gray-400">
            Kantoo SAS · <a href="mailto:hello@kantoo.fr" className="hover:text-gray-600">hello@kantoo.fr</a>
            {' '}·{' '}
            <Link href="/confidentialite" className="hover:text-gray-600">Politique de confidentialité</Link>
            {' '}·{' '}
            <Link href="/mentions-legales" className="hover:text-gray-600">Mentions légales</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
