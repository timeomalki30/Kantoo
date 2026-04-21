'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CheckCircle } from 'lucide-react'

interface ResetFields {
  email: string
}

export function ResetPasswordForm() {
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ResetFields>({ mode: 'onTouched' })

  async function onSubmit(_data: ResetFields) {
    await new Promise((r) => setTimeout(r, 1000))
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <p className="text-sm font-medium text-kantoo-text">Email envoyé !</p>
        <p className="text-sm text-gray-500">
          Vérifiez votre boîte <span className="font-medium">{getValues('email')}</span>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Input
        id="email"
        type="email"
        label="Adresse email"
        placeholder="vous@exemple.fr"
        autoComplete="email"
        inputMode="email"
        error={errors.email?.message}
        {...register('email', {
          required: "L'email est obligatoire",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "Format d'email invalide",
          },
        })}
      />
      <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
        Envoyer le lien
      </Button>
    </form>
  )
}
