export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      pharmacies: {
        Row: {
          id: string
          name: string
          pharmacy_code: string
          address: string
          city: string
          country: string
          phone: string
          email: string
          website: string
          logo_url: string
          currency: string
          tax_rate: number
          subscription_plan: string
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          pharmacy_code: string
          address?: string
          city?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          logo_url?: string
          currency?: string
          tax_rate?: number
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          pharmacy_code?: string
          address?: string
          city?: string
          country?: string
          phone?: string
          email?: string
          website?: string
          logo_url?: string
          currency?: string
          tax_rate?: number
          subscription_plan?: string
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
      medicine_categories: {
        Row: {
          id: string
          pharmacy_id: string
          name: string
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          name: string
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          name?: string
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      medicines: {
        Row: {
          id: string
          pharmacy_id: string
          name: string
          description: string
          manufacturer: string
          sku: string
          barcode: string
          category_id: string
          unit_price: number
          stock_quantity: number
          reorder_level: number
          expiry_date: string
          currency: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          name: string
          description?: string
          manufacturer?: string
          sku?: string
          barcode?: string
          category_id: string
          unit_price: number
          stock_quantity: number
          reorder_level?: number
          expiry_date?: string
          currency?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          name?: string
          description?: string
          manufacturer?: string
          sku?: string
          barcode?: string
          category_id?: string
          unit_price?: number
          stock_quantity?: number
          reorder_level?: number
          expiry_date?: string
          currency?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      prescriptions: {
        Row: {
          id: string
          pharmacy_id: string
          patient_id: string
          doctor_name: string
          issue_date: string
          expiry_date: string
          notes: string
          share_code: string
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          patient_id: string
          doctor_name: string
          issue_date?: string
          expiry_date?: string
          notes?: string
          share_code?: string
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          patient_id?: string
          doctor_name?: string
          issue_date?: string
          expiry_date?: string
          notes?: string
          share_code?: string
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      prescription_items: {
        Row: {
          id: string
          prescription_id: string
          medicine_id: string
          quantity: number
          dosage: string
          frequency: string
          duration: string
          instructions: string
          created_at: string
        }
        Insert: {
          id?: string
          prescription_id: string
          medicine_id: string
          quantity: number
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string
          created_at?: string
        }
        Update: {
          id?: string
          prescription_id?: string
          medicine_id?: string
          quantity?: number
          dosage?: string
          frequency?: string
          duration?: string
          instructions?: string
          created_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          pharmacy_id: string
          invoice_number: string
          customer_name: string
          patient_id: string | null
          prescription_id: string | null
          total_amount: number
          payment_method: string
          payment_status: string
          currency: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          invoice_number?: string
          customer_name?: string
          patient_id?: string | null
          prescription_id?: string | null
          total_amount: number
          payment_method?: string
          payment_status?: string
          currency?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          invoice_number?: string
          customer_name?: string
          patient_id?: string | null
          prescription_id?: string | null
          total_amount?: number
          payment_method?: string
          payment_status?: string
          currency?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      sale_items: {
        Row: {
          id: string
          sale_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          discount: number
          total_price: number
          currency: string
          created_at: string
        }
        Insert: {
          id?: string
          sale_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          discount?: number
          total_price: number
          currency?: string
          created_at?: string
        }
        Update: {
          id?: string
          sale_id?: string
          medicine_id?: string
          quantity?: number
          unit_price?: number
          discount?: number
          total_price?: number
          currency?: string
          created_at?: string
        }
      }
      sales_forecasts: {
        Row: {
          id: string
          pharmacy_id: string
          medicine_id: string
          start_date: string
          end_date: string
          forecast_period: string
          forecasted_quantity: number
          confidence_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          medicine_id: string
          start_date: string
          end_date: string
          forecast_period: string
          forecasted_quantity: number
          confidence_level: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          medicine_id?: string
          start_date?: string
          end_date?: string
          forecast_period?: string
          forecasted_quantity?: number
          confidence_level?: number
          created_at?: string
          updated_at?: string
        }
      }
      inventory_transactions: {
        Row: {
          id: string
          pharmacy_id: string
          medicine_id: string
          quantity: number
          transaction_type: string
          reference_id: string | null
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          medicine_id: string
          quantity: number
          transaction_type: string
          reference_id?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          medicine_id?: string
          quantity?: number
          transaction_type?: string
          reference_id?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          pharmacy_id: string
          name: string
          patient_info: Json
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          name: string
          patient_info?: Json
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          name?: string
          patient_info?: Json
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          pharmacy_id: string
          full_name: string
          email: string
          role: string
          is_admin: boolean
          profile_picture_url: string | null
          phone: string | null
          is_active: boolean
          last_login: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          full_name: string
          email: string
          role?: string
          is_admin?: boolean
          profile_picture_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          full_name?: string
          email?: string
          role?: string
          is_admin?: boolean
          profile_picture_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pharmacy_roles: {
        Row: {
          id: string
          user_id: string
          pharmacy_id: string
          role: string
          permissions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pharmacy_id: string
          role: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pharmacy_id?: string
          role?: string
          permissions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_activity_logs: {
        Row: {
          id: string
          user_id: string
          pharmacy_id: string
          action: string
          resource_type: string
          resource_id: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pharmacy_id: string
          action: string
          resource_type: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pharmacy_id?: string
          action?: string
          resource_type?: string
          resource_id?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      budget_plans: {
        Row: {
          id: string
          pharmacy_id: string
          title: string
          start_date: string
          end_date: string
          total_budget: number
          currency: string
          status: string
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          title: string
          start_date: string
          end_date: string
          total_budget: number
          currency?: string
          status?: string
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          title?: string
          start_date?: string
          end_date?: string
          total_budget?: number
          currency?: string
          status?: string
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      budget_allocations: {
        Row: {
          id: string
          budget_plan_id: string
          category_id: string
          allocated_amount: number
          currency: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          budget_plan_id: string
          category_id: string
          allocated_amount: number
          currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          budget_plan_id?: string
          category_id?: string
          allocated_amount?: number
          currency?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      procurement_orders: {
        Row: {
          id: string
          pharmacy_id: string
          order_number: string
          supplier_name: string
          supplier_id: string | null
          total_amount: number
          currency: string
          status: string
          expected_delivery_date: string | null
          notes: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pharmacy_id: string
          order_number?: string
          supplier_name: string
          supplier_id?: string | null
          total_amount: number
          currency?: string
          status?: string
          expected_delivery_date?: string | null
          notes?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pharmacy_id?: string
          order_number?: string
          supplier_name?: string
          supplier_id?: string | null
          total_amount?: number
          currency?: string
          status?: string
          expected_delivery_date?: string | null
          notes?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      procurement_items: {
        Row: {
          id: string
          procurement_order_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          currency: string
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          procurement_order_id: string
          medicine_id: string
          quantity: number
          unit_price: number
          currency?: string
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          procurement_order_id?: string
          medicine_id?: string
          quantity?: number
          unit_price?: number
          currency?: string
          total_price?: number
          created_at?: string
        }
      }
    }
  }
}
