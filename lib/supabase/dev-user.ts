import type { User } from '@supabase/supabase-js'

export const DEV_USER: User = {
  id:             'dev-user-123',
  email:          'dev@kantoo.fr',
  aud:            'authenticated',
  role:           'authenticated',
  created_at:     '2024-01-01T00:00:00.000Z',
  updated_at:     '2024-01-01T00:00:00.000Z',
  app_metadata:   { provider: 'email', providers: ['email'] },
  user_metadata:  { full_name: 'Timéo Dev' },
}
