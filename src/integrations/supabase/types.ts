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
      accounts: {
        Row: {
          color: string | null
          created_at: string
          currency: string
          id: string
          kind: string
          name: string
          opening_balance: number
          planner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          name: string
          opening_balance?: number
          planner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          currency?: string
          id?: string
          kind?: string
          name?: string
          opening_balance?: number
          planner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          meta: Json
          planner_id: string
          ref_id: string | null
          ref_table: string | null
          subtitle: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          meta?: Json
          planner_id: string
          ref_id?: string | null
          ref_table?: string | null
          subtitle?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
          planner_id?: string
          ref_id?: string | null
          ref_table?: string | null
          subtitle?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          id: string
          label: string | null
          month: string
          planner_id: string
          user_id: string
        }
        Insert: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          label?: string | null
          month?: string
          planner_id: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          label?: string | null
          month?: string
          planner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          planner_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          planner_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          planner_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_columns: {
        Row: {
          created_at: string
          id: string
          key: string
          label: string
          module: string
          planner_id: string
          position: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          label: string
          module: string
          planner_id: string
          position?: number
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          label?: string
          module?: string
          planner_id?: string
          position?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_columns_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      doc_folders: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          name: string
          planner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          name: string
          planner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          name?: string
          planner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "doc_folders_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          folder_id: string | null
          id: string
          mime_type: string | null
          planner_id: string
          size_bytes: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          planner_id: string
          size_bytes?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          mime_type?: string | null
          planner_id?: string
          size_bytes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "doc_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          planner_id: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          planner_id: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          planner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_entries: {
        Row: {
          account_id: string | null
          amount: number
          category_id: string | null
          created_at: string
          currency: string
          custom_fields: Json
          date: string
          description: string | null
          id: string
          notes: string | null
          planner_id: string
          receipt_path: string | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          planner_id: string
          receipt_path?: string | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          category_id?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json
          date?: string
          description?: string | null
          id?: string
          notes?: string | null
          planner_id?: string
          receipt_path?: string | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_entries_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string
          currency: string
          deadline: string | null
          emoji: string | null
          id: string
          name: string
          planner_id: string
          saved_amount: number
          target_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          deadline?: string | null
          emoji?: string | null
          id?: string
          name: string
          planner_id: string
          saved_amount?: number
          target_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          deadline?: string | null
          emoji?: string | null
          id?: string
          name?: string
          planner_id?: string
          saved_amount?: number
          target_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      income_entries: {
        Row: {
          account_id: string | null
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          custom_fields: Json
          date: string
          description: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          planner_id: string
          project_id: string | null
          proof_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json
          date?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          planner_id: string
          project_id?: string | null
          proof_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          custom_fields?: Json
          date?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          planner_id?: string
          project_id?: string | null
          proof_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_entries_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          client_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          pdf_path: string | null
          planner_id: string
          project_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          pdf_path?: string | null
          planner_id: string
          project_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          pdf_path?: string | null
          planner_id?: string
          project_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          planner_id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          planner_id: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          planner_id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_proofs: {
        Row: {
          account_id: string | null
          client_id: string | null
          created_at: string
          file_name: string
          file_path: string
          id: string
          income_id: string | null
          invoice_id: string | null
          mime_type: string | null
          notes: string | null
          planner_id: string
          project_id: string | null
          user_id: string
        }
        Insert: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          income_id?: string | null
          invoice_id?: string | null
          mime_type?: string | null
          notes?: string | null
          planner_id: string
          project_id?: string | null
          user_id: string
        }
        Update: {
          account_id?: string | null
          client_id?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          income_id?: string | null
          invoice_id?: string | null
          mime_type?: string | null
          notes?: string | null
          planner_id?: string
          project_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_proofs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_income_id_fkey"
            columns: ["income_id"]
            isOneToOne: false
            referencedRelation: "income_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_proofs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      planners: {
        Row: {
          created_at: string
          currency: string
          emoji: string | null
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          emoji?: string | null
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          emoji?: string | null
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_format: string
          default_currency: string
          display_name: string | null
          id: string
          last_planner_id: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_format?: string
          default_currency?: string
          display_name?: string | null
          id: string
          last_planner_id?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_format?: string
          default_currency?: string
          display_name?: string | null
          id?: string
          last_planner_id?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string
          currency: string
          deadline: string | null
          id: string
          name: string
          notes: string | null
          planner_id: string
          start_date: string | null
          status: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          id?: string
          name: string
          notes?: string | null
          planner_id: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          currency?: string
          deadline?: string | null
          id?: string
          name?: string
          notes?: string | null
          planner_id?: string
          start_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          expense_id: string | null
          file_name: string
          file_path: string
          id: string
          mime_type: string | null
          notes: string | null
          planner_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expense_id?: string | null
          file_name: string
          file_path: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          planner_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          expense_id?: string | null
          file_name?: string
          file_path?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          planner_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expense_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          currency: string
          date: string
          from_account_id: string | null
          id: string
          notes: string | null
          planner_id: string
          to_account_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          from_account_id?: string | null
          id?: string
          notes?: string | null
          planner_id: string
          to_account_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          from_account_id?: string | null
          id?: string
          notes?: string | null
          planner_id?: string
          to_account_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_planner_id_fkey"
            columns: ["planner_id"]
            isOneToOne: false
            referencedRelation: "planners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
