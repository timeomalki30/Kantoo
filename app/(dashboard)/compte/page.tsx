'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import {
  User, Building2, Palette, ShieldCheck,
  Check, Eye, EyeOff, AlertTriangle, CheckCircle2, X, Download,
} from 'lucide-react'

import { Card }                    from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button }                  from '@/components/ui/Button'
import { createClient }            from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  prenom:               string | null
  nom:                  string | null
  telephone:            string | null
  metier:               string | null
  nom_entreprise:       string | null
  siret:                string | null
  adresse:              string | null
  statut_juridique:     string | null
  tva:                  string | null
  iban:                 string | null
  couleur_principale:   string | null
  message_remerciement: string | null
  conditions_paiement:  string | null
  tva_non_applicable:   boolean | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const METIERS = [
  { value: 'plombier',    label: 'Plombier'    },
  { value: 'electricien', label: 'Électricien' },
  { value: 'peintre',     label: 'Peintre'     },
  { value: 'macon',       label: 'Maçon'       },
  { value: 'menuisier',   label: 'Menuisier'   },
  { value: 'carreleur',   label: 'Carreleur'   },
  { value: 'autre',       label: 'Autre'       },
]

const STATUTS_JURIDIQUES = [
  { value: 'auto-entrepreneur', label: 'Auto-entrepreneur'        },
  { value: 'eurl',              label: 'EURL'                     },
  { value: 'sarl',              label: 'SARL'                     },
  { value: 'sas',               label: 'SAS'                      },
  { value: 'sasu',              label: 'SASU'                     },
  { value: 'ei',                label: 'Entreprise individuelle'  },
]

const CONDITIONS_OPTIONS = [
  { value: 'comptant', label: 'Comptant à réception' },
  { value: '30j',      label: '30 jours fin de mois' },
  { value: '45j',      label: '45 jours fin de mois' },
  { value: '60j',      label: '60 jours fin de mois' },
]

const COLOR_SWATCHES = [
  { hex: '#F97316', label: 'Orange' },
  { hex: '#3B82F6', label: 'Bleu'   },
  { hex: '#22C55E', label: 'Vert'   },
  { hex: '#8B5CF6', label: 'Violet' },
  { hex: '#EC4899', label: 'Rose'   },
  { hex: '#14B8A6', label: 'Teal'   },
]

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:py-10">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-gray-100" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-56 w-full animate-pulse rounded-2xl bg-gray-100" />
      ))}
    </div>
  )
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon, title, subtitle,
}: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
        <Icon className="h-5 w-5 text-orange-500" />
      </div>
      <div>
        <h2 className="text-base font-bold text-kantoo-text">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  )
}

function SavedBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-sm font-medium text-green-600 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <CheckCircle2 className="h-4 w-4" />
      Sauvegardé
    </span>
  )
}

function useSaveState() {
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)
  const [error,  setError]  = useState('')

  async function triggerSave(fn?: () => Promise<void>) {
    setSaving(true)
    setError('')
    try {
      await fn?.()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  return { saving, saved, error, triggerSave }
}

// ─── 1. PROFIL ────────────────────────────────────────────────────────────────

interface ProfilFields {
  prenom:    string
  nom:       string
  telephone: string
  metier:    string
}

function SectionProfil({ profile, email }: { profile: ProfileData; email: string }) {
  const { saving, saved, error, triggerSave } = useSaveState()

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<ProfilFields>({
      mode: 'onTouched',
      defaultValues: {
        prenom:    profile.prenom    ?? '',
        nom:       profile.nom       ?? '',
        telephone: profile.telephone ?? '',
        metier:    profile.metier    ?? '',
      },
    })

  const prenom = watch('prenom')
  const nom    = watch('nom')
  const initiales = [prenom?.[0], nom?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  async function onSubmit(data: ProfilFields) {
    await triggerSave(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      const { error: dbError } = await supabase.from('profiles').upsert({
        id:        user.id,
        prenom:    data.prenom,
        nom:       data.nom,
        telephone: data.telephone || null,
        metier:    data.metier    || null,
      })
      if (dbError) throw new Error(dbError.message)
    })
  }

  return (
    <Card>
      <SectionHeader icon={User} title="Profil" subtitle="Vos informations personnelles" />

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-xl font-bold text-white shadow-md shadow-orange-200">
          {initiales}
        </div>
        <div>
          <p className="font-semibold text-kantoo-text">
            {[prenom, nom].filter(Boolean).join(' ') || 'Votre nom'}
          </p>
          <p className="text-sm text-gray-400">Avatar généré depuis vos initiales</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input id="prenom" label="Prénom" required error={errors.prenom?.message}
            {...register('prenom', {
              required:  'Le prénom est obligatoire',
              minLength: { value: 2, message: 'Trop court' },
            })}
          />
          <Input id="nom" label="Nom" required error={errors.nom?.message}
            {...register('nom', {
              required:  'Le nom est obligatoire',
              minLength: { value: 2, message: 'Trop court' },
            })}
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-kantoo-text">Adresse email</label>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-500 shadow-sm">
              {email || '—'}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
              <Check className="h-3 w-3" />
              Vérifié
            </span>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            L&apos;email ne peut pas être modifié ici. Contactez le support.
          </p>
        </div>

        <Input id="telephone" type="tel" label="Téléphone" inputMode="tel" autoComplete="tel"
          error={errors.telephone?.message}
          {...register('telephone', {
            pattern: { value: /^(\+33|0)[1-9](\s?\d{2}){4}$/, message: 'Numéro de téléphone invalide' },
          })}
        />

        <Select id="metier" label="Métier" options={METIERS} {...register('metier')} />

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center justify-between pt-2">
          <SavedBadge visible={saved} />
          <Button type="submit" loading={saving}>Sauvegarder</Button>
        </div>
      </form>
    </Card>
  )
}

// ─── 2. MON ENTREPRISE ────────────────────────────────────────────────────────

interface EntrepriseFields {
  entreprise:        string
  siret:             string
  adresseEntreprise: string
  statutJuridique:   string
  tva:               string
  iban:              string
}

function SectionEntreprise({ profile }: { profile: ProfileData }) {
  const { saving, saved, error, triggerSave } = useSaveState()
  const [tvaNonApplicable, setTvaNonApplicable] = useState(!!(profile.tva_non_applicable))

  const { register, handleSubmit, formState: { errors } } =
    useForm<EntrepriseFields>({
      mode: 'onTouched',
      defaultValues: {
        entreprise:        profile.nom_entreprise   ?? '',
        siret:             profile.siret            ?? '',
        adresseEntreprise: profile.adresse          ?? '',
        statutJuridique:   profile.statut_juridique ?? '',
        tva:               profile.tva              ?? '',
        iban:              profile.iban             ?? '',
      },
    })

  async function onSubmit(data: EntrepriseFields) {
    await triggerSave(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      const { error: dbError } = await supabase.from('profiles').upsert({
        id:                 user.id,
        nom_entreprise:     data.entreprise        || null,
        siret:              data.siret             || null,
        adresse:            data.adresseEntreprise || null,
        statut_juridique:   data.statutJuridique   || null,
        tva:                data.tva               || null,
        iban:               data.iban              || null,
        tva_non_applicable: tvaNonApplicable,
      })
      if (dbError) throw new Error(dbError.message)
    })
  }

  return (
    <Card>
      <SectionHeader
        icon={Building2}
        title="Mon entreprise"
        subtitle="Informations affichées sur vos devis et factures"
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input id="entreprise" label="Nom de l'entreprise" required error={errors.entreprise?.message}
          {...register('entreprise', { required: "Le nom de l'entreprise est obligatoire" })}
        />
        <Input id="siret" label="SIRET" placeholder="123 456 789 00012"
          hint="Optionnel — affiché sur vos documents officiels"
          error={errors.siret?.message}
          {...register('siret', {
            pattern: { value: /^[\d\s]{14,17}$/, message: 'Format SIRET invalide (14 chiffres)' },
          })}
        />
        <Input id="adresseEntreprise" label="Adresse de l'entreprise"
          placeholder="12 rue des Artisans, 75011 Paris"
          {...register('adresseEntreprise')}
        />
        <Select id="statutJuridique" label="Statut juridique" options={STATUTS_JURIDIQUES}
          {...register('statutJuridique')}
        />
        <Input id="tva" label="Numéro de TVA intracommunautaire" placeholder="FR 12 345678901"
          hint="Optionnel — si vous êtes assujetti à la TVA"
          {...register('tva')}
        />
        <Input id="iban" label="IBAN" placeholder="FR76 3000 6000 0112 3456 7890 189"
          hint="Optionnel — affiché sur vos factures pour faciliter le paiement"
          className="font-mono tracking-wide"
          {...register('iban')}
        />

        {/* Toggle TVA non applicable */}
        <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5">
          <div>
            <p className="text-sm font-semibold text-kantoo-text">Non assujetti à la TVA</p>
            <p className="mt-0.5 text-xs text-gray-500">
              Art. 293B du CGI — masque la TVA sur tous vos documents
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTvaNonApplicable((v) => !v)}
            aria-pressed={tvaNonApplicable}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              tvaNonApplicable ? 'bg-orange-500' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                tvaNonApplicable ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center justify-between pt-2">
          <SavedBadge visible={saved} />
          <Button type="submit" loading={saving}>Sauvegarder</Button>
        </div>
      </form>
    </Card>
  )
}

// ─── 3. PERSONNALISATION ──────────────────────────────────────────────────────

interface PersonnalisationFields {
  messageRemerciement: string
  conditionsPaiement:  string
}

function SectionPersonnalisation({ profile }: { profile: ProfileData }) {
  const { saving, saved, error, triggerSave } = useSaveState()
  const [couleur, setCouleur] = useState(profile.couleur_principale ?? '#F97316')

  const { register, handleSubmit } =
    useForm<PersonnalisationFields>({
      defaultValues: {
        messageRemerciement: profile.message_remerciement ?? '',
        conditionsPaiement:  profile.conditions_paiement  ?? '30j',
      },
    })

  async function onSubmit(data: PersonnalisationFields) {
    await triggerSave(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non connecté')
      const { error: dbError } = await supabase.from('profiles').upsert({
        id:                   user.id,
        couleur_principale:   couleur,
        message_remerciement: data.messageRemerciement || null,
        conditions_paiement:  data.conditionsPaiement  || null,
      })
      if (dbError) throw new Error(dbError.message)
    })
  }

  return (
    <Card>
      <SectionHeader
        icon={Palette}
        title="Personnalisation des devis"
        subtitle="Apparence et valeurs par défaut de vos documents"
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Color swatches */}
        <div>
          <label className="mb-3 block text-sm font-medium text-kantoo-text">Couleur principale</label>
          <div className="flex gap-3">
            {COLOR_SWATCHES.map(({ hex, label }) => {
              const selected = couleur === hex
              return (
                <button
                  key={hex} type="button" title={label}
                  onClick={() => setCouleur(hex)} aria-label={label}
                  className="relative h-9 w-9 rounded-full transition-transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: hex,
                    ...(selected ? { outline: `3px solid ${hex}`, outlineOffset: '3px' } : {}),
                  }}
                >
                  {selected && (
                    <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow" />
                  )}
                </button>
              )
            })}
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Couleur utilisée dans l&apos;en-tête et les accents de vos devis.
          </p>
        </div>

        <Textarea id="messageRemerciement" label="Message de remerciement par défaut"
          hint="Pré-rempli automatiquement sur chaque nouveau devis"
          {...register('messageRemerciement')}
        />

        <Select id="conditionsPaiement" label="Conditions de paiement par défaut"
          options={CONDITIONS_OPTIONS} {...register('conditionsPaiement')}
        />

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex items-center justify-between pt-2">
          <SavedBadge visible={saved} />
          <Button type="submit" loading={saving}>Sauvegarder</Button>
        </div>
      </form>
    </Card>
  )
}

// ─── 4. SÉCURITÉ ─────────────────────────────────────────────────────────────

interface PasswordFields {
  actuel:    string
  nouveau:   string
  confirmer: string
}

function SectionSecurite() {
  const router = useRouter()
  const { saving, saved, error, triggerSave } = useSaveState()
  const [showActuel,    setShowActuel]    = useState(false)
  const [showNouveau,   setShowNouveau]   = useState(false)
  const [showConfirmer, setShowConfirmer] = useState(false)
  const [showModal,     setShowModal]     = useState(false)
  const [deleteInput,   setDeleteInput]   = useState('')
  const [deleting,      setDeleting]      = useState(false)

  const { register, handleSubmit, watch, reset, formState: { errors } } =
    useForm<PasswordFields>({ mode: 'onTouched' })

  const nouveauVal = watch('nouveau')

  async function onSubmit(data: PasswordFields) {
    await triggerSave(async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Non connecté')

      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email, password: data.actuel,
      })
      if (verifyError) throw new Error('Mot de passe actuel incorrect')

      const { error: updateError } = await supabase.auth.updateUser({ password: data.nouveau })
      if (updateError) throw new Error(updateError.message)
      reset()
    })
  }

  async function handleDeleteConfirm() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
      <button type="button"
        className="pointer-events-auto cursor-pointer text-gray-400 hover:text-gray-600"
        onClick={onToggle} tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <>
      <Card>
        <SectionHeader icon={ShieldCheck} title="Sécurité" subtitle="Gérez votre mot de passe et votre compte" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <p className="text-sm font-medium text-kantoo-text">Changer le mot de passe</p>

          <Input id="actuel" type={showActuel ? 'text' : 'password'} label="Mot de passe actuel"
            placeholder="••••••••" error={errors.actuel?.message}
            suffix={<EyeBtn show={showActuel} onToggle={() => setShowActuel((v) => !v)} />}
            {...register('actuel', { required: 'Le mot de passe actuel est obligatoire' })}
          />
          <Input id="nouveau" type={showNouveau ? 'text' : 'password'} label="Nouveau mot de passe"
            placeholder="••••••••"
            hint={!errors.nouveau ? '8 caractères minimum, une majuscule' : undefined}
            error={errors.nouveau?.message}
            suffix={<EyeBtn show={showNouveau} onToggle={() => setShowNouveau((v) => !v)} />}
            {...register('nouveau', {
              required:  'Le nouveau mot de passe est obligatoire',
              minLength: { value: 8, message: 'Au moins 8 caractères requis' },
              validate:  (v) => /[A-Z]/.test(v) || 'Au moins une majuscule requise',
            })}
          />
          <Input id="confirmer" type={showConfirmer ? 'text' : 'password'} label="Confirmer le mot de passe"
            placeholder="••••••••" error={errors.confirmer?.message}
            suffix={<EyeBtn show={showConfirmer} onToggle={() => setShowConfirmer((v) => !v)} />}
            {...register('confirmer', {
              required: 'Veuillez confirmer le mot de passe',
              validate: (v) => v === nouveauVal || 'Les mots de passe ne correspondent pas',
            })}
          />

          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center justify-between pt-2">
            <SavedBadge visible={saved} />
            <Button type="submit" loading={saving}>Mettre à jour</Button>
          </div>
        </form>

        {/* Danger zone */}
        <div className="mt-8 rounded-2xl border-2 border-red-100 bg-red-50/50 p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-bold text-red-700">Zone de danger</p>
          </div>
          <p className="mb-4 text-sm text-red-600">
            La suppression de votre compte est définitive. Toutes vos données
            (devis, factures, clients) seront effacées et irrécupérables.
          </p>
          <Button type="button" variant="danger" size="sm" onClick={() => setShowModal(true)}>
            Supprimer mon compte
          </Button>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) { setShowModal(false); setDeleteInput('') }
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-kantoo-text">Supprimer le compte</h3>
                  <p className="text-xs text-gray-400">Cette action est irréversible</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setDeleteInput('') }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mb-5 text-sm text-gray-600">
              Pour confirmer, tapez{' '}
              <strong className="font-bold text-red-600">SUPPRIMER</strong>{' '}
              dans le champ ci-dessous.
            </p>

            <input
              type="text"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="SUPPRIMER"
              className="mb-4 block w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-mono font-semibold uppercase tracking-widest text-red-700 placeholder:text-gray-300 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1"
                onClick={() => { setShowModal(false); setDeleteInput('') }}
              >
                Annuler
              </Button>
              <Button type="button" variant="danger" className="flex-1"
                disabled={deleteInput !== 'SUPPRIMER' || deleting}
                loading={deleting}
                onClick={handleDeleteConfirm}
              >
                Supprimer définitivement
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── 5. DOCUMENTS LÉGAUX ─────────────────────────────────────────────────────

function SectionDocumentsLegaux() {
  return (
    <Card>
      <SectionHeader
        icon={ShieldCheck}
        title="Documents légaux"
        subtitle="Attestations et conformité réglementaire"
      />

      <div className="space-y-3">
        {/* Badges conformité */}
        <div className="flex flex-wrap gap-2">
          {[
            'Conforme loi anti-fraude TVA',
            'Données hébergées en Europe',
            'Facturation électronique 2027',
          ].map((label) => (
            <span
              key={label}
              className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
            >
              <Check className="h-3 w-3" />
              {label}
            </span>
          ))}
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-100 pt-3">
          <a
            href="/attestation-conformite.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-[0.98]"
          >
            <Download className="h-4 w-4 text-green-600" />
            Télécharger l&apos;attestation de conformité
          </a>
        </div>
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComptePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setEmail(user.email ?? '')

      const { data, error } = await supabase
        .from('profiles')
        .select('prenom, nom, telephone, metier, nom_entreprise, siret, adresse, statut_juridique, tva, iban, couleur_principale, message_remerciement, conditions_paiement, tva_non_applicable')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        setLoadError('Impossible de charger votre profil.')
      }

      setProfile((data as ProfileData | null) ?? {
        prenom: null, nom: null, telephone: null, metier: null,
        nom_entreprise: null, siret: null, adresse: null, statut_juridique: null,
        tva: null, iban: null, couleur_principale: null,
        message_remerciement: null, conditions_paiement: null,
        tva_non_applicable: null,
      })
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <PageSkeleton />

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-medium text-red-500">{loadError}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8 sm:px-6 lg:py-10">
      <div>
        <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Mon compte</h1>
        <p className="mt-1 text-sm text-gray-400">
          Gérez votre profil, votre entreprise et vos préférences.
        </p>
      </div>

      <SectionProfil           profile={profile!} email={email} />
      <SectionEntreprise       profile={profile!} />
      <SectionPersonnalisation profile={profile!} />
      <SectionSecurite />
      <SectionDocumentsLegaux />

      <div className="h-4" />
    </div>
  )
}
