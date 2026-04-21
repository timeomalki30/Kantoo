'use client'

import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, User, Mail, Phone, MapPin, Briefcase, FileText, Building2 } from 'lucide-react'

import { Input }    from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { Button }   from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useToast }     from '@/components/ui/Toast'

// ─── Form fields ─────────────────────────────────────────────────────────────

interface ClientFields {
  prenom:     string
  nom:        string
  email:      string
  telephone:  string
  adresse:    string
  type:       'particulier' | 'professionnel'
  entreprise: string
  note:       string
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NouveauClientPage() {
  const router    = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFields>({
    mode:          'onTouched',
    defaultValues: { type: 'particulier' },
  })

  const type = watch('type')

  async function onSubmit(data: ClientFields) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { error } = await supabase.from('clients').insert({
        user_id:       user.id,
        prenom:        data.prenom,
        nom:           data.nom,
        email:         data.email || null,
        telephone:     data.telephone || null,
        adresse:       data.adresse || null,
        type:          data.type,
        nom_entreprise: data.type === 'professionnel' ? data.entreprise || null : null,
        note_interne:  data.note || null,
      })

      if (error) {
        toast(error.message, 'error')
        return
      }

      toast('Client créé avec succès !', 'success')
    }

    router.push('/clients')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:py-10">

      {/* ── Back button ───────────────────────────────────────────────────── */}
      <Link
        href="/clients"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-orange-500"
      >
        <ChevronLeft className="h-4 w-4" />
        Retour aux clients
      </Link>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-kantoo-text sm:text-3xl">Nouveau client</h1>
        <p className="mt-1 text-sm text-gray-400">
          Renseignez les informations du client pour le retrouver facilement.
        </p>
      </div>

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white px-6 py-8 shadow-card sm:px-8">

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

          {/* ── Section : Identité ──────────────────────────────────────── */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <User className="h-3.5 w-3.5" />
              Identité
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="prenom"
                label="Prénom"
                placeholder="Jean"
                autoComplete="given-name"
                required
                error={errors.prenom?.message}
                {...register('prenom', {
                  required:  'Le prénom est obligatoire',
                  minLength: { value: 2, message: 'Au moins 2 caractères' },
                })}
              />
              <Input
                id="nom"
                label="Nom"
                placeholder="Dupont"
                autoComplete="family-name"
                required
                error={errors.nom?.message}
                {...register('nom', {
                  required:  'Le nom est obligatoire',
                  minLength: { value: 2, message: 'Au moins 2 caractères' },
                })}
              />
            </div>
          </div>

          {/* ── Section : Contact ───────────────────────────────────────── */}
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Phone className="h-3.5 w-3.5" />
              Contact
            </p>

            <Input
              id="email"
              type="email"
              label="Adresse email"
              placeholder="jean.dupont@exemple.fr"
              autoComplete="email"
              inputMode="email"
              required
              error={errors.email?.message}
              {...register('email', {
                required: "L'email est obligatoire",
                pattern: {
                  value:   /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Format d'email invalide",
                },
              })}
            />

            <Input
              id="telephone"
              type="tel"
              label="Téléphone"
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              inputMode="tel"
              required
              error={errors.telephone?.message}
              {...register('telephone', {
                required: 'Le téléphone est obligatoire',
                pattern: {
                  value:   /^(\+33|0)[1-9](\s?\d{2}){4}$/,
                  message: 'Numéro de téléphone invalide',
                },
              })}
            />

            <Input
              id="adresse"
              label="Adresse complète"
              placeholder="12 rue des Artisans, 75011 Paris"
              autoComplete="street-address"
              required
              prefix={<MapPin className="h-4 w-4" />}
              error={errors.adresse?.message}
              {...register('adresse', {
                required:  "L'adresse est obligatoire",
                minLength: { value: 5, message: 'Adresse trop courte' },
              })}
            />
          </div>

          {/* ── Section : Type de client ────────────────────────────────── */}
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <Briefcase className="h-3.5 w-3.5" />
              Type de client
            </p>

            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { value: 'particulier',   label: 'Particulier',   icon: User      },
                  { value: 'professionnel', label: 'Professionnel', icon: Building2 },
                ] as const
              ).map(({ value, label, icon: Icon }) => {
                const active = type === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('type', value, { shouldValidate: true })}
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-all ${
                      active
                        ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                )
              })}
            </div>

            <div
              className={`overflow-hidden transition-all duration-200 ${
                type === 'professionnel' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <Input
                id="entreprise"
                label="Nom de l'entreprise"
                placeholder="Dupont Rénovations SARL"
                autoComplete="organization"
                prefix={<Building2 className="h-4 w-4" />}
                required={type === 'professionnel'}
                error={errors.entreprise?.message}
                {...register('entreprise', {
                  validate: (v) =>
                    type !== 'professionnel' ||
                    (v?.trim().length >= 2) ||
                    "Le nom de l'entreprise est obligatoire",
                })}
              />
            </div>
          </div>

          {/* ── Section : Note interne ──────────────────────────────────── */}
          <div className="space-y-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-500">
              <FileText className="h-3.5 w-3.5" />
              Note interne
              <span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-gray-400">
                Optionnel
              </span>
            </p>

            <Textarea
              id="note"
              placeholder="Ex : Client fidèle, préfère être contacté le matin. Chantier en zone bleue de stationnement."
              hint="Visible uniquement par vous — non transmis au client."
              {...register('note')}
            />
          </div>

          {/* ── Divider ─────────────────────────────────────────────────── */}
          <div className="border-t border-gray-100" />

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Enregistrement…' : 'Créer le client'}
          </Button>

        </form>
      </div>

      <div className="h-8" />
    </div>
  )
}
