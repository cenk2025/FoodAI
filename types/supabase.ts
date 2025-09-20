export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          display_name: string | null
          photo_url: string | null
          created_at: string | null
          is_admin: boolean | null
        }
        Insert: {
          id: string
          email?: string | null
          display_name?: string | null
          photo_url?: string | null
          created_at?: string | null
          is_admin?: boolean | null
        }
        Update: {
          id?: string
          email?: string | null
          display_name?: string | null
          photo_url?: string | null
          created_at?: string | null
          is_admin?: boolean | null
        }
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
  }
}