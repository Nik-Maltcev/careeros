import crypto from 'crypto'
import type { PaymentPlan, RobokassaPayment } from '@/types/payment'

// Конфигурация Robokassa
const ROBOKASSA_CONFIG = {
  merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || 'demo',
  password1: process.env.ROBOKASSA_PASSWORD_1 || 'password_1',
  password2: process.env.ROBOKASSA_PASSWORD_2 || 'password_2',
  testMode: process.env.NODE_ENV !== 'production',
  paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
}

// Тарифные планы
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'single',
    name: '1 интервью',
    interviews: 1,
    price: 99,
    description: 'Попробуйте наш сервис'
  },
  {
    id: 'basic',
    name: '5 интервью',
    interviews: 5,
    price: 350,
    description: 'Подготовьтесь к собеседованиям',
    popular: true
  },
  {
    id: 'pro',
    name: '10 интервью',
    interviews: 10,
    price: 649,
    description: 'Максимальная подготовка'
  }
]

export class RobokassaService {
  // Генерация подписи для платежа
  static generateSignature(
    merchantLogin: string,
    outSum: number,
    invId: number,
    password: string,
    shpParams?: Record<string, string>
  ): string {
    let signatureString = `${merchantLogin}:${outSum}:${invId}:${password}`
    
    // Добавляем пользовательские параметры в алфавитном порядке
    if (shpParams) {
      const sortedKeys = Object.keys(shpParams).sort()
      for (const key of sortedKeys) {
        signatureString += `:${key}=${shpParams[key]}`
      }
    }
    
    return crypto.createHash('md5').update(signatureString).digest('hex')
  }

  // Проверка подписи от Robokassa
  static verifySignature(
    outSum: number,
    invId: number,
    signatureValue: string,
    shpParams?: Record<string, string>
  ): boolean {
    let signatureString = `${outSum}:${invId}:${ROBOKASSA_CONFIG.password2}`
    
    if (shpParams) {
      const sortedKeys = Object.keys(shpParams).sort()
      for (const key of sortedKeys) {
        signatureString += `:${key}=${shpParams[key]}`
      }
    }
    
    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase()
    return expectedSignature === signatureValue.toUpperCase()
  }

  // Создание данных для платежа
  static createPayment(
    plan: PaymentPlan,
    userEmail?: string,
    userId?: string
  ): RobokassaPayment {
    const invId = Date.now() // Уникальный номер заказа
    const shpParams = {
      shp_plan: plan.id,
      shp_interviews: plan.interviews.toString(),
      ...(userId && { shp_user_id: userId })
    }
    
    const signatureValue = this.generateSignature(
      ROBOKASSA_CONFIG.merchantLogin,
      plan.price,
      invId,
      ROBOKASSA_CONFIG.password1,
      shpParams
    )

    return {
      merchantLogin: ROBOKASSA_CONFIG.merchantLogin,
      outSum: plan.price,
      invId,
      description: `Покупка тарифа "${plan.name}" - ${plan.interviews} интервью`,
      signatureValue,
      culture: 'ru',
      email: userEmail,
      shp_plan: plan.id,
      shp_interviews: plan.interviews.toString()
    }
  }

  // Генерация URL для оплаты
  static generatePaymentUrl(payment: RobokassaPayment): string {
    const params = new URLSearchParams({
      MerchantLogin: payment.merchantLogin,
      OutSum: payment.outSum.toString(),
      InvId: payment.invId.toString(),
      Description: payment.description,
      SignatureValue: payment.signatureValue,
      Culture: payment.culture || 'ru',
      ...(payment.email && { Email: payment.email }),
      ...(payment.shp_plan && { Shp_plan: payment.shp_plan }),
      ...(payment.shp_interviews && { Shp_interviews: payment.shp_interviews }),
      ...(ROBOKASSA_CONFIG.testMode && { IsTest: '1' })
    })

    return `${ROBOKASSA_CONFIG.paymentUrl}?${params.toString()}`
  }

  // Получение плана по ID
  static getPlanById(planId: string): PaymentPlan | undefined {
    return PAYMENT_PLANS.find(plan => plan.id === planId)
  }
}