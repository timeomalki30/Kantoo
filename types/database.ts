export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          adresse: string | null
          created_at: string | null
          email: string | null
          id: string
          nom: string | null
          nom_entreprise: string | null
          note_interne: string | null
          prenom: string | null
          telephone: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          adresse?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string | null
          nom_entreprise?: string | null
          note_interne?: string | null
          prenom?: string | null
          telephone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          adresse?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nom?: string | null
          nom_entreprise?: string | null
          note_interne?: string | null
          prenom?: string | null
          telephone?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devis: {
        Row: {
          client_id: string | null
          created_at: string | null
          date_emission: string | null
          date_validite: string | null
          id: string
          message_client: string | null
          numero: string | null
          prestations: Json | null
          signature_image: string | null
          signe_le: string | null
          statut: string | null
          titre: string | null
          token: string | null
          total_ht: number | null
          total_ttc: number | null
          total_tva: number | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          date_emission?: string | null
          date_validite?: string | null
          id?: string
          message_client?: string | null
          numero?: string | null
          prestations?: Json | null
          signature_image?: string | null
          signe_le?: string | null
          statut?: string | null
          titre?: string | null
          token?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          date_emission?: string | null
          date_validite?: string | null
          id?: string
          message_client?: string | null
          numero?: string | null
          prestations?: Json | null
          signature_image?: string | null
          signe_le?: string | null
          statut?: string | null
          titre?: string | null
          token?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      factures: {
        Row: {
          client_id: string | null
          conditions_paiement: string | null
          created_at: string | null
          date_echeance: string | null
          date_emission: string | null
          devis_id: string | null
          id: string
          numero: string | null
          prestations: Json | null
          statut: string | null
          titre: string | null
          total_ht: number | null
          total_ttc: number | null
          total_tva: number | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          conditions_paiement?: string | null
          created_at?: string | null
          date_echeance?: string | null
          date_emission?: string | null
          devis_id?: string | null
          id?: string
          numero?: string | null
          prestations?: Json | null
          statut?: string | null
          titre?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          conditions_paiement?: string | null
          created_at?: string | null
          date_echeance?: string | null
          date_emission?: string | null
          devis_id?: string | null
          id?: string
          numero?: string | null
          prestations?: Json | null
          statut?: string | null
          titre?: string | null
          total_ht?: number | null
          total_ttc?: number | null
          total_tva?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "factures_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "factures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          adresse: string | null
          conditions_paiement: string | null
          couleur_principale: string | null
          created_at: string | null
          email: string | null
          iban: string | null
          id: string
          message_remerciement: string | null
          metier: string | null
          nom: string | null
          nom_entreprise: string | null
          prenom: string | null
          siret: string | null
          statut_juridique: string | null
          telephone: string | null
          tva: string | null
        }
        Insert: {
          adresse?: string | null
          conditions_paiement?: string | null
          couleur_principale?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id: string
          message_remerciement?: string | null
          metier?: string | null
          nom?: string | null
          nom_entreprise?: string | null
          prenom?: string | null
          siret?: string | null
          statut_juridique?: string | null
          telephone?: string | null
          tva?: string | null
        }
        Update: {
          adresse?: string | null
          conditions_paiement?: string | null
          couleur_principale?: string | null
          created_at?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          message_remerciement?: string | null
          metier?: string | null
          nom?: string | null
          nom_entreprise?: string | null
          prenom?: string | null
          siret?: string | null
          statut_juridique?: string | null
          telephone?: string | null
          tva?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
