export type { Database, Tables, TablesInsert, TablesUpdate } from './database'

// Convenience row-type aliases
import type { Tables, TablesInsert, TablesUpdate } from './database'
export type ProfileRow    = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>
export type ClientRow     = Tables<'clients'>
export type DevisRow      = Tables<'devis'>
export type FactureRow    = Tables<'factures'>

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  perPage: number
}

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'paused'
  | 'trialing'
  | 'unpaid'
