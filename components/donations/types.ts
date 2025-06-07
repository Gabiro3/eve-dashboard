export interface Donation {
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

export interface DonationFormData {
  title: string
  description: string
  imageFile?: File
  impactDetails: string
  fundraisingGoal: number
  targetDate: string
}

export interface DonationUpdateData {
  title?: string
  description?: string
  imageFile?: File
  background_image_url?: string | null
  impact_details?: string
  fundraising_goal?: number
  current_amount?: number
  target_date?: string
  is_active?: boolean
}
