import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Paramètres' }

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      <div className="mt-8 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Profil</h2>
          <p className="mt-1 text-sm text-gray-500">Gérez vos informations personnelles.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Abonnement</h2>
          <p className="mt-1 text-sm text-gray-500">Gérez votre abonnement et vos paiements.</p>
        </div>
      </div>
    </div>
  )
}
