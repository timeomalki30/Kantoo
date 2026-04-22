'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  FileText, PenLine, CreditCard, LayoutDashboard,
  X, Check, ChevronDown, ArrowRight, Star,
  Clock, MessageSquare, FileX, Smartphone,
  CheckCircle2, Send, Zap, Shield, Users2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/ui/Logo'

// ─── Scroll hook ──────────────────────────────────────────────────────────────

function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}

// ─── FadeIn wrapper ───────────────────────────────────────────────────────────

function FadeIn({
  children,
  className,
  delay = 0,
  direction = 'up',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'left' | 'right' | 'none'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const initial =
    direction === 'up'    ? 'opacity-0 translate-y-8' :
    direction === 'left'  ? 'opacity-0 -translate-x-8' :
    direction === 'right' ? 'opacity-0 translate-x-8' :
                            'opacity-0'

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-700', visible ? 'opacity-100 translate-x-0 translate-y-0' : initial, className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const scrolled = useScrolled()
  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-shadow duration-300',
        scrolled ? 'bg-white/95 shadow-sm backdrop-blur-md' : 'bg-white'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo size="sm" variant="full" />
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 sm:block"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-orange-600 active:scale-[0.98]"
          >
            Commencer gratuitement
          </Link>
        </nav>
      </div>
    </header>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const AVATARS = [
  { initials: 'MD', bg: 'bg-orange-100', text: 'text-orange-700' },
  { initials: 'SR', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  { initials: 'TB', bg: 'bg-green-100',  text: 'text-green-700'  },
  { initials: 'AL', bg: 'bg-violet-100', text: 'text-violet-700' },
  { initials: 'JP', bg: 'bg-amber-100',  text: 'text-amber-700'  },
]

function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-32">
      {/* Background gradient blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{ background: 'radial-gradient(circle, #FED7AA 0%, #FEF3C7 50%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-600">
          <span className="text-orange-400">✦</span>
          L&apos;outil des artisans nouvelle génération
        </div>

        {/* H1 */}
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-kantoo-text sm:text-5xl lg:text-6xl">
          Tes devis en{' '}
          <span className="relative inline-block">
            <span className="relative z-10 text-orange-500">2 minutes.</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 -z-10 h-3 rounded-full bg-orange-100"
            />
          </span>
          <br />
          Tes clients impressionnés.
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
          Envoie des devis professionnels depuis ton téléphone, fais-les signer en un clic,
          et encaisse directement. Fini les papiers.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98] sm:w-auto"
          >
            Commencer gratuitement
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="#features"
            className="flex w-full items-center justify-center rounded-2xl border border-gray-200 bg-white px-8 py-4 text-base font-bold text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            Voir une démo
          </Link>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <div className="flex -space-x-2">
            {AVATARS.map(({ initials, bg, text }) => (
              <div
                key={initials}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-xs font-bold',
                  bg, text
                )}
              >
                {initials}
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Déjà utilisé par{' '}
              <span className="font-bold text-kantoo-text">500+ artisans</span>{' '}
              dans toute la France
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Problem / Solution ───────────────────────────────────────────────────────

const BEFORE = [
  { icon: Clock,        text: 'Devis sur Excel... 3 heures de boulot'         },
  { icon: FileX,        text: 'PDF perdu dans la boîte mail du client'         },
  { icon: MessageSquare,text: 'Relances par SMS à la main, encore et encore'  },
  { icon: FileText,     text: 'Signature sur papier, retour par courrier'      },
]

const AFTER = [
  { icon: Zap,          text: 'Devis professionnel créé en 2 minutes chrono'  },
  { icon: Send,         text: 'Lien envoyé par SMS, ouvert en quelques secondes' },
  { icon: CheckCircle2, text: 'Relances automatiques — tu n\'y penses plus'   },
  { icon: PenLine,      text: 'Signature électronique légale en un clic'      },
]

function ProblemSolution() {
  return (
    <section className="bg-kantoo-dark py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Tu mérites mieux que ça
          </h2>
          <p className="mt-3 text-gray-400">Avant et après Kantoo.</p>
        </FadeIn>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto_1fr]">
          {/* Before */}
          <FadeIn direction="left" className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-red-400">
              Avant Kantoo
            </p>
            <ul className="space-y-4">
              {BEFORE.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                    <X className="h-4 w-4 text-red-400" />
                  </span>
                  <span className="text-sm text-gray-300">{text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>

          {/* Arrow */}
          <div className="flex items-center justify-center py-4 lg:py-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 shadow-lg shadow-orange-500/30">
              <ArrowRight className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* After */}
          <FadeIn direction="right" className="rounded-2xl bg-orange-500/10 p-6 ring-1 ring-orange-500/20">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-orange-400">
              Avec Kantoo
            </p>
            <ul className="space-y-4">
              {AFTER.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-green-500/20">
                    <Check className="h-4 w-4 text-green-400" strokeWidth={2.5} />
                  </span>
                  <span className="text-sm text-gray-200">{text}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

// ─── Mockups ──────────────────────────────────────────────────────────────────

function MockupDevis() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400">DEV-2026-012</span>
        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-bold text-green-700">Envoyé ✓</span>
      </div>
      <div className="space-y-2">
        <div className="h-2.5 w-3/4 rounded-full bg-gray-100" />
        <div className="h-2.5 w-1/2 rounded-full bg-gray-100" />
      </div>
      <div className="mt-4 rounded-xl bg-gray-50 p-3">
        <div className="mb-2 grid grid-cols-4 text-[10px] font-bold uppercase tracking-wide text-gray-400">
          {['Prestation', 'Qté', 'PU HT', 'Total'].map((h) => <span key={h}>{h}</span>)}
        </div>
        {[['Peinture murs', '45 m²', '12 €', '540 €'], ["Main d'œuvre", '8 h', '45 €', '360 €']].map((r) => (
          <div key={r[0]} className="grid grid-cols-4 py-1 text-[11px] text-gray-600">
            {r.map((c) => <span key={c}>{c}</span>)}
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-end border-t border-gray-100 pt-3">
        <div className="text-right">
          <p className="text-[11px] text-gray-400">Total TTC</p>
          <p className="text-xl font-bold text-orange-500">1 078,80 €</p>
        </div>
      </div>
      <div className="mt-3 h-9 rounded-xl bg-orange-500" />
    </div>
  )
}

function MockupSignature() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
      <div className="mb-4 text-center">
        <p className="text-xs font-bold text-gray-400">DEV-2026-012 — Jean Dupont</p>
        <p className="mt-1 text-sm font-semibold text-kantoo-text">Rénovation cuisine · 3 795,00 €</p>
      </div>
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-gray-400">Zone de signature</p>
        <div className="flex h-16 items-end">
          <svg viewBox="0 0 160 40" className="w-40 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M10 30 C20 10, 30 35, 45 25 C55 18, 60 32, 75 28 C85 25, 90 15, 105 20 C115 24, 120 12, 140 18" />
          </svg>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-orange-500" />
        <p className="text-xs text-gray-500">J&apos;accepte les conditions générales</p>
      </div>
      <div className="mt-3 h-9 rounded-xl bg-green-500" />
      <p className="mt-2 text-center text-[10px] text-gray-400">Signé légalement — conforme eIDAS</p>
    </div>
  )
}

function MockupPaiement() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-7 w-7 text-green-600" />
        </div>
      </div>
      <p className="text-center text-base font-bold text-kantoo-text">Paiement reçu !</p>
      <p className="mt-1 text-center text-2xl font-extrabold text-green-600">+ 3 795,00 €</p>
      <p className="mt-1 text-center text-xs text-gray-400">Jean Dupont · Rénovation cuisine</p>
      <div className="mt-5 space-y-2 rounded-xl bg-gray-50 p-3">
        {[['Virement reçu', '✓'], ['Facture générée', '✓'], ['Email envoyé', '✓']].map(([label, status]) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-gray-500">{label}</span>
            <span className="font-bold text-green-600">{status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MockupDashboard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-2xl">
      <p className="mb-4 text-xs font-bold text-gray-400">Avril 2026</p>
      <div className="mb-4 grid grid-cols-2 gap-3">
        {[
          { label: 'Encaissé', value: '12 800 €', color: 'text-green-600' },
          { label: "Taux d'accept.", value: '73 %', color: 'text-orange-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-gray-50 p-3">
            <p className="text-[10px] text-gray-400">{label}</p>
            <p className={cn('text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>
      {/* Mini bar chart */}
      <div className="flex items-end gap-1.5">
        {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md bg-orange-500"
            style={{ height: `${h * 0.5}px`, opacity: i === 5 ? 1 : 0.3 + i * 0.1 }}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[9px] text-gray-300">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d) => <span key={d}>{d}</span>)}
      </div>
    </div>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    tag:     'Rapidité',
    icon:    Zap,
    title:   'Devis en 2 minutes chrono',
    body:    "Prestations, TVA, remises — tout se calcule automatiquement. Envoie le lien au client par SMS ou email sans quitter l'appli.",
    mockup:  <MockupDevis />,
    color:   'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    tag:     'Légal',
    icon:    PenLine,
    title:   'Signature électronique légale',
    body:    "Le client signe depuis son téléphone en 30 secondes. La signature est horodatée, certifiée et conforme au règlement eIDAS.",
    mockup:  <MockupSignature />,
    color:   'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    tag:     'Paiement',
    icon:    CreditCard,
    title:   'Paiement en ligne intégré',
    body:    "Ton client paie directement depuis le devis signé. Virement SEPA ou carte bancaire. L'argent arrive sur ton compte en 2 jours.",
    mockup:  <MockupPaiement />,
    color:   'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    tag:     'Vision',
    icon:    LayoutDashboard,
    title:   'Tableau de bord de tes chantiers',
    body:    "Devis envoyés, signés, payés, relances en attente — tout est visible en un coup d'œil depuis ton dashboard.",
    mockup:  <MockupDashboard />,
    color:   'text-violet-500',
    bgColor: 'bg-violet-50',
  },
] as const

function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold text-kantoo-text sm:text-4xl">
            Tout ce dont tu as besoin
          </h2>
          <p className="mt-3 text-gray-500">Un outil complet, pensé pour le terrain.</p>
        </FadeIn>

        <div className="space-y-24">
          {FEATURES.map(({ tag, icon: Icon, title, body, mockup, color, bgColor }, i) => {
            const isEven = i % 2 === 1
            return (
              <div
                key={title}
                className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2"
              >
                {/* Text */}
                <FadeIn
                  direction={isEven ? 'right' : 'left'}
                  className={cn(isEven && 'lg:order-2')}
                >
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold', bgColor, color)}>
                    <Icon className="h-3.5 w-3.5" />
                    {tag}
                  </span>
                  <h3 className="mt-4 text-2xl font-extrabold text-kantoo-text sm:text-3xl">{title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-gray-500">{body}</p>
                </FadeIn>

                {/* Mockup */}
                <FadeIn
                  direction={isEven ? 'left' : 'right'}
                  delay={100}
                  className={cn('mx-auto w-full max-w-sm', isEven && 'lg:order-1')}
                >
                  {mockup}
                </FadeIn>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PRICING_FEATURES = [
  'Devis illimités',
  'Signature électronique',
  'Envoi par lien',
  'Tableau de bord',
]

function Pricing() {
  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-kantoo-text sm:text-4xl">
            Tarifs en cours de définition
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-500">
            On est en phase de lancement. Rejoins les premiers artisans et teste
            gratuitement pendant 3 mois.
          </p>
        </FadeIn>

        <FadeIn className="mx-auto max-w-md">
          <div className="relative rounded-2xl border-2 border-orange-500 bg-white p-8 shadow-xl shadow-orange-100 text-center">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-orange-500 px-4 py-1 text-xs font-bold text-white shadow-sm">
                Offre de lancement
              </span>
            </div>

            {/* Title */}
            <p className="mt-2 text-lg font-extrabold text-kantoo-text">
              Accès complet gratuit pendant 3 mois
            </p>

            {/* Features */}
            <ul className="mt-6 space-y-3 text-left">
              {PRICING_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                  <Check className="h-4 w-4 shrink-0 text-green-500" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href="/register"
              className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:bg-orange-600 active:scale-[0.98]"
            >
              Demander mon accès gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-xs text-gray-400">
              Sans carte bancaire · Accès immédiat
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Kantoo est-il gratuit ?',
    a: "Oui ! Le plan gratuit inclut 3 devis par mois, sans carte bancaire requise. Pour des devis illimités, la signature électronique et le paiement en ligne, passe au plan Pro à 49 €/mois.",
  },
  {
    q: 'Puis-je utiliser Kantoo sur mon téléphone ?',
    a: "Absolument. Kantoo est 100 % pensé pour le mobile. Tu peux créer et envoyer un devis depuis ton van, en plein chantier, en moins de 2 minutes.",
  },
  {
    q: 'La signature électronique est-elle légalement valide ?',
    a: "Oui, les signatures réalisées via Kantoo sont conformes au règlement eIDAS de l'Union Européenne. Elles ont la même valeur légale qu'une signature manuscrite.",
  },
  {
    q: 'Comment fonctionne le paiement en ligne ?',
    a: "Nous utilisons Stripe, la référence mondiale du paiement en ligne. Ton client peut payer par virement SEPA ou carte bancaire directement depuis le devis. Les fonds arrivent sur ton compte en 2 jours ouvrés.",
  },
  {
    q: 'Puis-je annuler mon abonnement à tout moment ?',
    a: "Oui, sans engagement. Tu peux annuler depuis ton compte en un clic, à tout moment. Il n'y a aucun frais de résiliation.",
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <FadeIn className="mb-12 text-center">
          <h2 className="text-3xl font-extrabold text-kantoo-text sm:text-4xl">
            Questions fréquentes
          </h2>
        </FadeIn>

        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <FadeIn key={q} delay={i * 60}>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-kantoo-text">{q}</span>
                  <span className="shrink-0 text-gray-400">
                    {open === i
                      ? <ChevronDown className="h-5 w-5 rotate-180 transition-transform duration-200" />
                      : <ChevronDown className="h-5 w-5 transition-transform duration-200" />}
                  </span>
                </button>
                {open === i && (
                  <div className="border-t border-gray-100 px-6 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-gray-500">{a}</p>
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="bg-orange-500 py-20">
      <FadeIn className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
          Prêt à passer à la vitesse supérieure ?
        </h2>
        <p className="mt-4 text-base text-orange-100">
          Rejoins 500+ artisans qui gagnent du temps chaque jour avec Kantoo.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-orange-600 shadow-lg transition-all hover:bg-orange-50 active:scale-[0.98]"
        >
          Créer mon compte gratuit
          <ArrowRight className="h-5 w-5" />
        </Link>
        <p className="mt-4 text-xs text-orange-200">Aucune carte bancaire requise · Annulable à tout moment</p>
      </FadeIn>
    </section>
  )
}

// ─── Conformité légale ────────────────────────────────────────────────────────

const BADGES = [
  {
    label: 'Conforme loi anti-fraude TVA',
    sub:   'Décret n° 2021-1089',
  },
  {
    label: 'Données hébergées en Europe',
    sub:   'RGPD · Supabase EU',
  },
  {
    label: 'Facturation électronique 2027',
    sub:   'Prêt pour la réforme',
  },
]

function ConformiteLegale() {
  return (
    <section className="border-t border-gray-100 bg-gray-50/60 py-14">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
            Conformité légale
          </p>
          <h2 className="mt-2 text-2xl font-bold text-kantoo-text sm:text-3xl">
            Une solution qui respecte la loi
          </h2>
          <p className="mt-3 text-sm text-gray-500">
            Kantoo est conçu pour être conforme aux obligations légales françaises en matière de facturation.
          </p>
        </FadeIn>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {BADGES.map((b, i) => (
            <FadeIn key={b.label} delay={i * 0.08}>
              <div className="flex items-start gap-3 rounded-2xl border border-green-100 bg-white px-5 py-4 shadow-sm">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-3.5 w-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-kantoo-text">{b.label}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{b.sub}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size="sm" variant="full" />
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              { label: 'Mentions légales',              href: '/mentions-legales'           },
              { label: 'CGV',                           href: '/cgv'                        },
              { label: 'Confidentialité',               href: '/confidentialite'            },
              { label: 'Attestation de conformité',     href: '/attestation-conformite.pdf' },
              { label: 'Contact',                       href: 'mailto:hello@kantoo.fr'      },
            ].map(({ label, href }) => (
              <Link key={label} href={href} className="text-xs text-gray-400 hover:text-gray-700"
                {...(href.endsWith('.pdf') || href.startsWith('mailto')
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-gray-300">© Kantoo 2026</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <Features />
        <Pricing />
        <FAQ />
        <CTABanner />
        <ConformiteLegale />
      </main>
      <Footer />
    </>
  )
}
