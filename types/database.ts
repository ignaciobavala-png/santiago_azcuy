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
      albumes: {
        Row: {
          activo: boolean
          año: number | null
          apple_music_url: string | null
          created_at: string
          id: string
          orden: number | null
          portada_url: string | null
          spotify_url: string | null
          titulo: string
          youtube_music_url: string | null
        }
        Insert: {
          activo?: boolean
          año?: number | null
          apple_music_url?: string | null
          created_at?: string
          id?: string
          orden?: number | null
          portada_url?: string | null
          spotify_url?: string | null
          titulo: string
          youtube_music_url?: string | null
        }
        Update: {
          activo?: boolean
          año?: number | null
          apple_music_url?: string | null
          created_at?: string
          id?: string
          orden?: number | null
          portada_url?: string | null
          spotify_url?: string | null
          titulo?: string
          youtube_music_url?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          orden: number | null
          poster_url: string | null
          titulo: string | null
          video_url: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number | null
          poster_url?: string | null
          titulo?: string | null
          video_url: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number | null
          poster_url?: string | null
          titulo?: string | null
          video_url?: string
        }
        Relationships: []
      }
      biografia: {
        Row: {
          frase: string | null
          id: number
          texto: string | null
          updated_at: string | null
        }
        Insert: {
          frase?: string | null
          id?: number
          texto?: string | null
          updated_at?: string | null
        }
        Update: {
          frase?: string | null
          id?: number
          texto?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      consultas: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          leido: boolean
          mensaje: string | null
          nombre: string | null
          obra_id: string | null
          telefono: string | null
          tipo_consulta: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id?: string
          leido?: boolean
          mensaje?: string | null
          nombre?: string | null
          obra_id?: string | null
          telefono?: string | null
          tipo_consulta?: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          leido?: boolean
          mensaje?: string | null
          nombre?: string | null
          obra_id?: string | null
          telefono?: string | null
          tipo_consulta?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultas_obra_id_fkey"
            columns: ["obra_id"]
            isOneToOne: false
            referencedRelation: "obras"
            referencedColumns: ["id"]
          },
        ]
      }
      dossier_secciones: {
        Row: {
          datos: Json
          slug: string
          updated_at: string
        }
        Insert: {
          datos?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          datos?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      exposiciones: {
        Row: {
          ciudad: string | null
          created_at: string | null
          fecha_fin: string | null
          fecha_inicio: string | null
          id: string
          lugar: string | null
          pais: string | null
          tipo: string | null
          titulo: string
          url: string | null
        }
        Insert: {
          ciudad?: string | null
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          lugar?: string | null
          pais?: string | null
          tipo?: string | null
          titulo: string
          url?: string | null
        }
        Update: {
          ciudad?: string | null
          created_at?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string | null
          id?: string
          lugar?: string | null
          pais?: string | null
          tipo?: string | null
          titulo?: string
          url?: string | null
        }
        Relationships: []
      }
      institucional_secciones: {
        Row: {
          datos: Json
          slug: string
          updated_at: string
        }
        Insert: {
          datos?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          datos?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      novela_contenido: {
        Row: {
          descripcion: string | null
          id: number
          portada_url: string | null
          spotify_show_id: string | null
          subtitulo: string | null
          titulo: string | null
          updated_at: string
        }
        Insert: {
          descripcion?: string | null
          id?: number
          portada_url?: string | null
          spotify_show_id?: string | null
          subtitulo?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Update: {
          descripcion?: string | null
          id?: number
          portada_url?: string | null
          spotify_show_id?: string | null
          subtitulo?: string | null
          titulo?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      novela_leads: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      obras: {
        Row: {
          año: number | null
          blur_data_url: string | null
          created_at: string | null
          descripcion: string | null
          destacada: boolean
          dimensiones: string | null
          dimensiones_alto: number | null
          dimensiones_ancho: number | null
          disponible: boolean
          id: string
          imagen_hires: string | null
          imagen_url: string | null
          orden: number | null
          precio: number | null
          print_edicion: number | null
          print_precio: number | null
          print_stock: number | null
          publicada: boolean
          serie_id: string | null
          slug: string
          tecnica: string | null
          tipo_venta: string | null
          titulo: string
        }
        Insert: {
          año?: number | null
          blur_data_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          destacada?: boolean
          dimensiones?: string | null
          dimensiones_alto?: number | null
          dimensiones_ancho?: number | null
          disponible?: boolean
          id?: string
          imagen_hires?: string | null
          imagen_url?: string | null
          orden?: number | null
          precio?: number | null
          print_edicion?: number | null
          print_precio?: number | null
          print_stock?: number | null
          publicada?: boolean
          serie_id?: string | null
          slug: string
          tecnica?: string | null
          tipo_venta?: string | null
          titulo: string
        }
        Update: {
          año?: number | null
          blur_data_url?: string | null
          created_at?: string | null
          descripcion?: string | null
          destacada?: boolean
          dimensiones?: string | null
          dimensiones_alto?: number | null
          dimensiones_ancho?: number | null
          disponible?: boolean
          id?: string
          imagen_hires?: string | null
          imagen_url?: string | null
          orden?: number | null
          precio?: number | null
          print_edicion?: number | null
          print_precio?: number | null
          print_stock?: number | null
          publicada?: boolean
          serie_id?: string | null
          slug?: string
          tecnica?: string | null
          tipo_venta?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "obras_serie_id_fkey"
            columns: ["serie_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      plataformas: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          nombre: string
          orden: number | null
          url: string | null
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre: string
          orden?: number | null
          url?: string | null
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          nombre?: string
          orden?: number | null
          url?: string | null
        }
        Relationships: []
      }
      series: {
        Row: {
          año_fin: number | null
          año_inicio: number | null
          created_at: string | null
          descripcion: string | null
          id: string
          imagen_cover: string | null
          nombre: string
          orden: number | null
          slug: string
        }
        Insert: {
          año_fin?: number | null
          año_inicio?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_cover?: string | null
          nombre: string
          orden?: number | null
          slug: string
        }
        Update: {
          año_fin?: number | null
          año_inicio?: number | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          imagen_cover?: string | null
          nombre?: string
          orden?: number | null
          slug?: string
        }
        Relationships: []
      }
      videos_musica: {
        Row: {
          activo: boolean
          created_at: string
          id: string
          orden: number | null
          seccion: string
          titulo: string | null
          youtube_id: string
        }
        Insert: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number | null
          seccion: string
          titulo?: string | null
          youtube_id: string
        }
        Update: {
          activo?: boolean
          created_at?: string
          id?: string
          orden?: number | null
          seccion?: string
          titulo?: string | null
          youtube_id?: string
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
