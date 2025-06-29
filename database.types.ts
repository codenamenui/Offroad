export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      mechanics: {
        Row: {
          email: string | null
          id: number
          name: string | null
          password: string | null
          schedule: string | null
          url: string | null
        }
        Insert: {
          email?: string | null
          id?: never
          name?: string | null
          password?: string | null
          schedule?: string | null
          url?: string | null
        }
        Update: {
          email?: string | null
          id?: never
          name?: string | null
          password?: string | null
          schedule?: string | null
          url?: string | null
        }
        Relationships: []
      }
      parts: {
        Row: {
          description: string | null
          id: number
          name: string | null
          price: number | null
          stock: number | null
          type_id: number | null
          url: string | null
          vehicle_id: number | null
        }
        Insert: {
          description?: string | null
          id?: never
          name?: string | null
          price?: number | null
          stock?: number | null
          type_id?: number | null
          url?: string | null
          vehicle_id?: number | null
        }
        Update: {
          description?: string | null
          id?: never
          name?: string | null
          price?: number | null
          stock?: number | null
          type_id?: number | null
          url?: string | null
          vehicle_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "parts_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      types: {
        Row: {
          id: number
          name: string | null
        }
        Insert: {
          id?: never
          name?: string | null
        }
        Update: {
          id?: never
          name?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          contact_number: string | null
          email: string | null
          id: number
          name: string | null
          user_id: string | null
        }
        Insert: {
          contact_number?: string | null
          email?: string | null
          id?: never
          name?: string | null
          user_id?: string | null
        }
        Update: {
          contact_number?: string | null
          email?: string | null
          id?: never
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: number
          make: string | null
          model: string | null
          name: string | null
          url: string | null
          year: string | null
        }
        Insert: {
          id?: never
          make?: string | null
          model?: string | null
          name?: string | null
          url?: string | null
          year?: string | null
        }
        Update: {
          id?: never
          make?: string | null
          model?: string | null
          name?: string | null
          url?: string | null
          year?: string | null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
