export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: "admin" | "writer" | "doctor"
          name: string
          profile_image_url: string | null
          is_active: boolean
          doctor_id: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          role: "admin" | "writer" | "doctor"
          name: string
          profile_image_url?: string | null
          is_active?: boolean
          doctor_id?: string | null
          last_login?: string | null
        }
        Update: {
          email?: string
          password_hash?: string
          role?: "admin" | "writer" | "doctor"
          name?: string
          profile_image_url?: string | null
          is_active?: boolean
          doctor_id?: string | null
          last_login?: string | null
          updated_at?: string
        }
      }
      account_requests: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          role: "writer" | "doctor"
          specialization: string | null
          bio: string | null
          message: string | null
          status: "pending" | "approved" | "rejected"
          created_at: string
          updated_at: string
          reviewed_by: string | null
          review_notes: string | null
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          role: "writer" | "doctor"
          specialization?: string | null
          bio?: string | null
          message?: string | null
          status?: "pending" | "approved" | "rejected"
          reviewed_by?: string | null
          review_notes?: string | null
        }
        Update: {
          name?: string
          email?: string
          phone?: string | null
          role?: "writer" | "doctor"
          specialization?: string | null
          bio?: string | null
          message?: string | null
          status?: "pending" | "approved" | "rejected"
          reviewed_by?: string | null
          review_notes?: string | null
          updated_at?: string
        }
      }
      admin_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          expires_at: string
          created_at: string
          last_accessed: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          expires_at?: string
          last_accessed?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          featured_image_url: string | null
          category_id: string | null
          author_id: string | null
          read_count: number
          like_count: number
          comment_count: number
          is_featured: boolean
          is_published: boolean
          tags: string[] | null
          estimated_read_time: number | null
          created_at: string
          updated_at: string
          status: "draft" | "pending_review" | "approved" | "rejected"
          reviewed_by: string | null
          review_notes: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          featured_image_url?: string | null
          category_id?: string | null
          author_id?: string | null
          read_count?: number
          like_count?: number
          comment_count?: number
          is_featured?: boolean
          is_published?: boolean
          tags?: string[] | null
          estimated_read_time?: number | null
          status?: "draft" | "pending_review" | "approved" | "rejected"
          reviewed_by?: string | null
          review_notes?: string | null
        }
        Update: {
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          featured_image_url?: string | null
          category_id?: string | null
          author_id?: string | null
          read_count?: number
          like_count?: number
          comment_count?: number
          is_featured?: boolean
          is_published?: boolean
          tags?: string[] | null
          estimated_read_time?: number | null
          status?: "draft" | "pending_review" | "approved" | "rejected"
          reviewed_by?: string | null
          review_notes?: string | null
          updated_at?: string
        }
      }
      doctors: {
        Row: {
          id: string
          name: string
          title: string
          specialization: string
          bio: string | null
          profile_image_url: string | null
          contact_email: string | null
          contact_phone: string | null
          years_experience: number | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title: string
          specialization: string
          bio?: string | null
          profile_image_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          years_experience?: number | null
          verified?: boolean
        }
        Update: {
          name?: string
          title?: string
          specialization?: string
          bio?: string | null
          profile_image_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          years_experience?: number | null
          verified?: boolean
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: "info" | "warning" | "success" | "error"
          is_active: boolean
          target_audience: "all" | "doctors" | "patients"
          created_by: string
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          type?: "info" | "warning" | "success" | "error"
          is_active?: boolean
          target_audience?: "all" | "doctors" | "patients"
          created_by: string
          expires_at?: string | null
        }
        Update: {
          title?: string
          content?: string
          type?: "info" | "warning" | "success" | "error"
          is_active?: boolean
          target_audience?: "all" | "doctors" | "patients"
          expires_at?: string | null
          updated_at?: string
        }
      }
      donation_causes: {
        Row: {
          id: string
          title: string
          description: string
          background_image_url: string | null
          impact_details: string
          fundraising_goal: number
          current_amount: number
          target_date: string
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          background_image_url?: string | null
          impact_details: string
          fundraising_goal: number
          current_amount?: number
          target_date: string
          is_active?: boolean
          created_by: string
        }
        Update: {
          title?: string
          description?: string
          background_image_url?: string | null
          impact_details?: string
          fundraising_goal?: number
          current_amount?: number
          target_date?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      article_categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          requires_doctor_review: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          requires_doctor_review?: boolean
        }
        Update: {
          name?: string
          slug?: string
          description?: string | null
          requires_doctor_review?: boolean
          updated_at?: string
        }
      }
    }
  }
}

export type UserRole = "admin" | "writer" | "doctor"
export type ArticleStatus = "draft" | "pending_review" | "approved" | "rejected"
export type AnnouncementType = "info" | "warning" | "success" | "error"
export type RequestStatus = "pending" | "approved" | "rejected"
