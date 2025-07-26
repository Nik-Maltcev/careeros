export interface PaymentPlan {
  id: string
  name: string
  interviews: number
  price: number
  description: string
  popular?: boolean
}

export interface RobokassaPayment {
  merchantLogin: string
  outSum: number
  invId: number
  description: string
  signatureValue: string
  culture?: string
  email?: string
  shp_plan?: string
  shp_interviews?: string
}

export interface PaymentResult {
  success: boolean
  invId?: number
  outSum?: number
  fee?: number
  email?: string
  paymentMethod?: string
  error?: string
}