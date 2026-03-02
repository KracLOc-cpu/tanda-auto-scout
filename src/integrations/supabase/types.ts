export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      cars: {
        Row: {
          id: number
          created_at: string
          brand: string
          model: string
          body_type: string | null
          fuel_type: string | null
          year: number | null
          image_url: string | null
          engine_options: Json | null
          length_mm: number | null
          width_mm: number | null
          height_mm: number | null
          wheelbase_mm: number | null
          clearance_mm: number | null
          cargo_volume_l: number | null
          fuel_tank_l: number | null
          max_speed_kmh: number | null
          fuel_consumption_city: number | null
          fuel_consumption_highway: number | null
          fuel_consumption_mixed: number | null
          range_km: number | null
          pros: string | null
          cons: string | null
          description: string | null
          liquidity_score: number | null
          seats_options: number[] | null
          last_verified_by: string | null
          last_verified_at: string | null
          city: string | null
          is_available: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          brand: string
          model: string
          body_type?: string | null
          fuel_type?: string | null
          year?: number | null
          image_url?: string | null
          engine_options?: Json | null
          length_mm?: number | null
          width_mm?: number | null
          height_mm?: number | null
          wheelbase_mm?: number | null
          clearance_mm?: number | null
          cargo_volume_l?: number | null
          fuel_tank_l?: number | null
          max_speed_kmh?: number | null
          fuel_consumption_city?: number | null
          fuel_consumption_highway?: number | null
          fuel_consumption_mixed?: number | null
          range_km?: number | null
          pros?: string | null
          cons?: string | null
          description?: string | null
          liquidity_score?: number | null
          seats_options?: number[] | null
          last_verified_by?: string | null
          last_verified_at?: string | null
          city?: string | null
          is_available?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          brand?: string
          model?: string
          body_type?: string | null
          fuel_type?: string | null
          year?: number | null
          image_url?: string | null
          engine_options?: Json | null
          length_mm?: number | null
          width_mm?: number | null
          height_mm?: number | null
          wheelbase_mm?: number | null
          clearance_mm?: number | null
          cargo_volume_l?: number | null
          fuel_tank_l?: number | null
          max_speed_kmh?: number | null
          fuel_consumption_city?: number | null
          fuel_consumption_highway?: number | null
          fuel_consumption_mixed?: number | null
          range_km?: number | null
          pros?: string | null
          cons?: string | null
          description?: string | null
          liquidity_score?: number | null
          seats_options?: number[] | null
          last_verified_by?: string | null
          last_verified_at?: string | null
          city?: string | null
          is_available?: boolean
        }
        Relationships: []
      }
      car_trims: {
        Row: {
          id: number
          created_at: string
          car_id: number
          trim_name: string
          engine: string | null
          transmission: string | null
          drive_type: string | null
          seats: number | null
          price: number | null
          promo_price: number | null
          promo_until: string | null
          car_year: number | null
          features: Json | null
          is_available: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          car_id: number
          trim_name: string
          engine?: string | null
          transmission?: string | null
          drive_type?: string | null
          seats?: number | null
          price?: number | null
          promo_price?: number | null
          promo_until?: string | null
          car_year?: number | null
          features?: Json | null
          is_available?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          car_id?: number
          trim_name?: string
          engine?: string | null
          transmission?: string | null
          drive_type?: string | null
          seats?: number | null
          price?: number | null
          promo_price?: number | null
          promo_until?: string | null
          car_year?: number | null
          features?: Json | null
          is_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "car_trims_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          created_at: string
          user_id: string
          car_id: number
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          car_id: number
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          car_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "favorites_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          }
        ]
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

export type Tables
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

export type TablesInsert
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

export type TablesUpdate
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

export type Enums
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

export const Constants = {
  public: {
    Enums: {},
  },
} as const
