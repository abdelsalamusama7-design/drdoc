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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          confirmation_status: string | null
          created_at: string | null
          created_by: string | null
          date: string
          doctor: string | null
          id: string
          notes: string | null
          patient_id: string | null
          patient_name: string
          phone: string | null
          reminder_sent: boolean | null
          status: string | null
          time: string
          visit_type: string | null
        }
        Insert: {
          clinic_id?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          date: string
          doctor?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name: string
          phone?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          time: string
          visit_type?: string | null
        }
        Update: {
          clinic_id?: string | null
          confirmation_status?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          doctor?: string | null
          id?: string
          notes?: string | null
          patient_id?: string | null
          patient_name?: string
          phone?: string | null
          reminder_sent?: boolean | null
          status?: string | null
          time?: string
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_members: {
        Row: {
          clinic_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string
        }
        Insert: {
          clinic_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id: string
        }
        Update: {
          clinic_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_members_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_referrals: {
        Row: {
          created_at: string | null
          id: string
          referred_clinic_name: string
          referred_contact: string
          referred_email: string | null
          referred_phone: string | null
          referrer_clinic_id: string | null
          reward_applied: boolean | null
          reward_type: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referred_clinic_name: string
          referred_contact: string
          referred_email?: string | null
          referred_phone?: string | null
          referrer_clinic_id?: string | null
          reward_applied?: boolean | null
          reward_type?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referred_clinic_name?: string
          referred_contact?: string
          referred_email?: string | null
          referred_phone?: string | null
          referrer_clinic_id?: string | null
          reward_applied?: boolean | null
          reward_type?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_referrals_referrer_clinic_id_fkey"
            columns: ["referrer_clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_satisfaction: {
        Row: {
          category: string | null
          clinic_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clinic_satisfaction_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          max_users: number | null
          name: string
          name_en: string | null
          owner_id: string | null
          phone: string | null
          settings: Json | null
          slug: string
          subscription_plan: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          max_users?: number | null
          name: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          max_users?: number | null
          name?: string
          name_en?: string | null
          owner_id?: string | null
          phone?: string | null
          settings?: Json | null
          slug?: string
          subscription_plan?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      demo_requests: {
        Row: {
          clinic_name: string
          contact_name: string
          created_at: string | null
          email: string | null
          id: string
          message: string | null
          patient_count: string | null
          phone: string | null
          request_type: string | null
          specialty: string | null
          status: string | null
        }
        Insert: {
          clinic_name: string
          contact_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          patient_count?: string | null
          phone?: string | null
          request_type?: string | null
          specialty?: string | null
          status?: string | null
        }
        Update: {
          clinic_name?: string
          contact_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          message?: string | null
          patient_count?: string | null
          phone?: string | null
          request_type?: string | null
          specialty?: string | null
          status?: string | null
        }
        Relationships: []
      }
      doctor_notes: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          description: string | null
          id: string
          patient_id: string
          title: string
          type: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          patient_id: string
          title: string
          type?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          description?: string | null
          id?: string
          patient_id?: string
          title?: string
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_notes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_notes_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          id: string
          notes: string | null
        }
        Insert: {
          amount?: number
          category: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          notes?: string | null
        }
        Update: {
          amount?: number
          category?: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          follow_up_date: string
          id: string
          notified: boolean | null
          patient_id: string
          reason: string | null
          status: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_date: string
          id?: string
          notified?: boolean | null
          patient_id: string
          reason?: string | null
          status?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          follow_up_date?: string
          id?: string
          notified?: boolean | null
          patient_id?: string
          reason?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follow_ups_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          approved_amount: number | null
          claim_date: string | null
          claim_number: string | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          insurance_company_id: string
          notes: string | null
          patient_id: string
          patient_share: number | null
          rejection_reason: string | null
          resolved_at: string | null
          status: string | null
          submitted_at: string | null
          total_amount: number | null
          updated_at: string | null
          visit_id: string | null
        }
        Insert: {
          approved_amount?: number | null
          claim_date?: string | null
          claim_number?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_company_id: string
          notes?: string | null
          patient_id: string
          patient_share?: number | null
          rejection_reason?: string | null
          resolved_at?: string | null
          status?: string | null
          submitted_at?: string | null
          total_amount?: number | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Update: {
          approved_amount?: number | null
          claim_date?: string | null
          claim_number?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          insurance_company_id?: string
          notes?: string | null
          patient_id?: string
          patient_share?: number | null
          rejection_reason?: string | null
          resolved_at?: string | null
          status?: string | null
          submitted_at?: string | null
          total_amount?: number | null
          updated_at?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          address: string | null
          clinic_id: string | null
          contact_person: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          discount_percentage: number | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          name_en: string | null
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          clinic_id?: string | null
          contact_person?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_en?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          clinic_id?: string | null
          contact_person?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          discount_percentage?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_companies_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_invoice_claims: {
        Row: {
          amount: number | null
          claim_id: string
          created_at: string | null
          id: string
          invoice_id: string
        }
        Insert: {
          amount?: number | null
          claim_id: string
          created_at?: string | null
          id?: string
          invoice_id: string
        }
        Update: {
          amount?: number | null
          claim_id?: string
          created_at?: string | null
          id?: string
          invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_invoice_claims_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_invoice_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "insurance_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_invoices: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          insurance_company_id: string
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          sent_at: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          insurance_company_id: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          insurance_company_id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          sent_at?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_invoices_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          expiry_date: string | null
          id: string
          min_quantity: number | null
          name: string
          purchase_price: number | null
          quantity: number
          selling_price: number | null
          sku: string | null
          supplier: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          min_quantity?: number | null
          name: string
          purchase_price?: number | null
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expiry_date?: string | null
          id?: string
          min_quantity?: number | null
          name?: string
          purchase_price?: number | null
          quantity?: number
          selling_price?: number | null
          sku?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_transactions: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          notes: string | null
          patient_id: string | null
          quantity: number
          transaction_type: string
          visit_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          notes?: string | null
          patient_id?: string | null
          quantity: number
          transaction_type?: string
          visit_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          patient_id?: string | null
          quantity?: number
          transaction_type?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_transactions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          status: string
          subscription_id: string | null
        }
        Insert: {
          amount?: number
          clinic_id: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_alerts: {
        Row: {
          alert_type: string
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          patient_id: string
          severity: string
          title: string
        }
        Insert: {
          alert_type?: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          patient_id: string
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          patient_id?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_alerts_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_alerts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          clinic_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          clinic_id: string | null
          completed_steps: Json | null
          created_at: string | null
          current_step: number | null
          id: string
          is_completed: boolean | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          is_completed?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: true
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_files: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          file_name: string
          file_path: string
          file_type: string | null
          id: string
          notes: string | null
          patient_id: string
          uploaded_by: string | null
          visit_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          uploaded_by?: string | null
          visit_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          uploaded_by?: string | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_files_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_files_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_files_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_ratings: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          comment: string | null
          created_at: string | null
          id: string
          patient_id: string | null
          rating: number
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          rating: number
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          patient_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "patient_ratings_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_ratings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_ratings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age: number | null
          allergies: string[] | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          current_medications: string[] | null
          gender: string | null
          id: string
          insurance_company_id: string | null
          insurance_expiry: string | null
          insurance_number: string | null
          last_visit: string | null
          marital_status: string | null
          medical_history: string | null
          name: string
          no_show_count: number | null
          phone: string
          previous_surgeries: string | null
          risk_score: number | null
          segment: string | null
          visit_count: number | null
        }
        Insert: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: string[] | null
          gender?: string | null
          id?: string
          insurance_company_id?: string | null
          insurance_expiry?: string | null
          insurance_number?: string | null
          last_visit?: string | null
          marital_status?: string | null
          medical_history?: string | null
          name: string
          no_show_count?: number | null
          phone: string
          previous_surgeries?: string | null
          risk_score?: number | null
          segment?: string | null
          visit_count?: number | null
        }
        Update: {
          address?: string | null
          age?: number | null
          allergies?: string[] | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          current_medications?: string[] | null
          gender?: string | null
          id?: string
          insurance_company_id?: string | null
          insurance_expiry?: string | null
          insurance_number?: string | null
          last_visit?: string | null
          marital_status?: string | null
          medical_history?: string | null
          name?: string
          no_show_count?: number | null
          phone?: string
          previous_surgeries?: string | null
          risk_score?: number | null
          segment?: string | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          patient_id: string
          payment_method: string | null
          remaining_amount: number | null
          total_amount: number | null
          visit_id: string
        }
        Insert: {
          amount?: number
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          payment_method?: string | null
          remaining_amount?: number | null
          total_amount?: number | null
          visit_id: string
        }
        Update: {
          amount?: number
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          payment_method?: string | null
          remaining_amount?: number | null
          total_amount?: number | null
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      prescription_medications: {
        Row: {
          dosage: string | null
          duration: string | null
          id: string
          name: string
          notes: string | null
          prescription_id: string
        }
        Insert: {
          dosage?: string | null
          duration?: string | null
          id?: string
          name: string
          notes?: string | null
          prescription_id: string
        }
        Update: {
          dosage?: string | null
          duration?: string | null
          id?: string
          name?: string
          notes?: string | null
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          date: string | null
          doctor_notes: string | null
          id: string
          patient_id: string | null
          patient_name: string
          visit_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id?: string | null
          patient_name: string
          visit_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      queue_entries: {
        Row: {
          appointment_id: string | null
          called_time: string | null
          check_in_time: string | null
          clinic_id: string | null
          completed_time: string | null
          created_at: string | null
          doctor: string | null
          id: string
          patient_id: string | null
          patient_name: string
          queue_number: number
          status: string
        }
        Insert: {
          appointment_id?: string | null
          called_time?: string | null
          check_in_time?: string | null
          clinic_id?: string | null
          completed_time?: string | null
          created_at?: string | null
          doctor?: string | null
          id?: string
          patient_id?: string | null
          patient_name: string
          queue_number: number
          status?: string
        }
        Update: {
          appointment_id?: string | null
          called_time?: string | null
          check_in_time?: string | null
          clinic_id?: string | null
          completed_time?: string | null
          created_at?: string | null
          doctor?: string | null
          id?: string
          patient_id?: string | null
          patient_name?: string
          queue_number?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "queue_entries_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string | null
          clinic_id: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          price: number
        }
        Insert: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          price?: number
        }
        Update: {
          category?: string | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          clinic_id: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          id: string
          payment_method: string
          plan: string
          receipt_path: string | null
          sender_name: string | null
          sender_phone: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          amount?: number
          clinic_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          plan: string
          receipt_path?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          clinic_id?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          id?: string
          payment_method?: string
          plan?: string
          receipt_path?: string | null
          sender_name?: string | null
          sender_phone?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          auto_renew: boolean | null
          clinic_id: string
          created_at: string | null
          end_date: string | null
          id: string
          plan: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          auto_renew?: boolean | null
          clinic_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          auto_renew?: boolean | null
          clinic_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      therapy_sessions: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          notes: string | null
          patient_id: string
          session_date: string | null
          session_number: number | null
          status: string | null
          total_sessions: number | null
          visit_id: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          session_date?: string | null
          session_number?: number | null
          status?: string | null
          total_sessions?: number | null
          visit_id?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          session_date?: string | null
          session_number?: number | null
          status?: string | null
          total_sessions?: number | null
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "therapy_sessions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "therapy_sessions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visit_services: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          price: number | null
          quantity: number | null
          service_id: string
          visit_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          quantity?: number | null
          service_id: string
          visit_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          price?: number | null
          quantity?: number | null
          service_id?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_services_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visit_services_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          appointment_id: string | null
          clinic_id: string | null
          created_at: string | null
          created_by: string | null
          date: string
          diagnosis: string | null
          doctor_notes: string | null
          id: string
          patient_id: string
          payment_type: string | null
          status: string | null
          time: string | null
          visit_type: string | null
        }
        Insert: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          diagnosis?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id: string
          payment_type?: string | null
          status?: string | null
          time?: string | null
          visit_type?: string | null
        }
        Update: {
          appointment_id?: string | null
          clinic_id?: string | null
          created_at?: string | null
          created_by?: string | null
          date?: string
          diagnosis?: string | null
          doctor_notes?: string | null
          id?: string
          patient_id?: string
          payment_type?: string | null
          status?: string | null
          time?: string | null
          visit_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_clinic_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_clinic_member: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "doctor"
        | "receptionist"
        | "accountant"
        | "patient"
        | "super_admin"
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
    Enums: {
      app_role: [
        "admin",
        "doctor",
        "receptionist",
        "accountant",
        "patient",
        "super_admin",
      ],
    },
  },
} as const
