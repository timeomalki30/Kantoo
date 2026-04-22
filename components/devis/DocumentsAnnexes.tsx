'use client'

import { useState, useRef } from 'react'
import { Paperclip, Plus, Trash2, Loader2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { DocumentAnnexe, DocumentType } from '@/types/devis'

// ─── Constants ───────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: DocumentType; label: string }[] = [
  { value: 'cgv',                  label: 'CGV'                    },
  { value: 'assurance_decennale',  label: 'Assurance décennale'    },
  { value: 'attestation_tva',      label: 'Attestation TVA'        },
  { value: 'rib',                  label: 'RIB'                    },
  { value: 'autre',                label: 'Autre'                  },
]

const TYPE_LABEL: Record<DocumentType, string> = {
  cgv:                 'CGV',
  assurance_decennale: 'Assurance décennale',
  attestation_tva:     'Attestation TVA',
  rib:                 'RIB',
  autre:               'Autre',
}

const TYPE_COLOR: Record<DocumentType, string> = {
  cgv:                 'bg-blue-100 text-blue-700',
  assurance_decennale: 'bg-green-100 text-green-700',
  attestation_tva:     'bg-purple-100 text-purple-700',
  rib:                 'bg-amber-100 text-amber-700',
  autre:               'bg-gray-100 text-gray-600',
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DocumentsAnnexesProps {
  documents: DocumentAnnexe[]
  onChange: (docs: DocumentAnnexe[]) => void
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DocumentsAnnexes({
  documents,
  onChange,
  disabled = false,
}: DocumentsAnnexesProps) {
  const [showAdd,     setShowAdd]     = useState(false)
  const [selectedType, setSelectedType] = useState<DocumentType>('cgv')
  const [uploading,   setUploading]   = useState(false)
  const [error,       setError]       = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).')
      return
    }

    setError('')
    setUploading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Non authentifié.'); return }

      const docId  = nanoid()
      const path   = `${user.id}/${docId}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`

      const { error: uploadErr } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: 'application/pdf', upsert: false })

      if (uploadErr) {
        setError('Erreur lors de l\'upload : ' + uploadErr.message)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(path)

      const newDoc: DocumentAnnexe = {
        id:   docId,
        type: selectedType,
        nom:  file.name,
        url:  publicUrl,
        path,
      }

      onChange([...documents, newDoc])
      setShowAdd(false)
      setSelectedType('cgv')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(doc: DocumentAnnexe) {
    const supabase = createClient()
    await supabase.storage.from('documents').remove([doc.path])
    onChange(documents.filter((d) => d.id !== doc.id))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-orange-500" />
          <CardTitle>Documents annexes</CardTitle>
        </div>
        <span className="text-xs text-gray-400">Optionnel — CGV, assurance, RIB…</span>
      </CardHeader>

      {/* Liste des documents */}
      {documents.length > 0 && (
        <ul className="mb-4 space-y-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Paperclip className="h-4 w-4 shrink-0 text-gray-400" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-kantoo-text">{doc.nom}</p>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${TYPE_COLOR[doc.type]}`}>
                    {TYPE_LABEL[doc.type]}
                  </span>
                </div>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="Supprimer ce document"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Zone d'ajout */}
      {!disabled && (
        <>
          {!showAdd ? (
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 py-3 text-sm font-semibold text-orange-500 transition-colors hover:border-orange-300 hover:bg-orange-50"
            >
              <Plus className="h-4 w-4" />
              Ajouter un document
            </button>
          ) : (
            <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 space-y-3">
              {/* Type */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Type de document
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as DocumentType)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-kantoo-text shadow-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                >
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* File input */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Fichier PDF (max 10 Mo)
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleUpload}
                  disabled={uploading}
                  className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-500 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white file:hover:bg-orange-600 focus:outline-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-xs font-medium text-red-500">{error}</p>
              )}

              {/* Spinner */}
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Upload en cours…
                </div>
              )}

              {/* Cancel */}
              <button
                type="button"
                onClick={() => { setShowAdd(false); setError('') }}
                className="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600"
              >
                Annuler
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  )
}
