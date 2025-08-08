import crypto from 'crypto'
import type { PaymentPlan, RobokassaPayment } from '@/types/payment'

// Конфигурация Robokassa
const ROBOKASSA_CONFIG = {
  merchantLogin: process.env.ROBOKASSA_MERCHANT_LOGIN || 'careeros',
  password1: process.env.ROBOKASSA_PASSWORD_1 || 'fhZJ0oqzmo1258YYbTop',
  password2: process.env.ROBOKASSA_PASSWORD_2 || 'ZKstGV72xKGTua8NJ2R5',
  testMode: false, // Продакшн режим как было час назад
  paymentUrl: 'https://auth.robokassa.ru/Merchant/Index.aspx'
}

console.log('Robokassa config:', {
  merchantLogin: ROBOKASSA_CONFIG.merchantLogin,
  hasPassword1: !!ROBOKASSA_CONFIG.password1,
  hasPassword2: !!ROBOKASSA_CONFIG.password2,
  testMode: ROBOKASSA_CONFIG.testMode
})

// Тарифные планы
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'single',
    name: '1 интервью',
    interviews: 1,
    price: 50,
    description: 'Попробуйте наш сервис (тест)',
    popular: true
  },
  {
    id: 'basic',
    name: '5 интервью',
    interviews: 5,
    price: 350,
    description: 'Подготовьтесь к собеседованиям'
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
    shpParams?: Record<string, string>,
    receipt?: string
  ): string {
    // Базовая строка для подписи согласно документации
    let signatureString = `${merchantLogin}:${outSum}:${invId}`
    
    // Добавляем receipt если есть (должен быть перед паролем)
    if (receipt) {
      signatureString += `:${receipt}`
    }
    
    // Добавляем пароль
    signatureString += `:${password}`
    
    // Добавляем пользовательские параметры в алфавитном порядке
    if (shpParams) {
      const sortedKeys = Object.keys(shpParams).sort()
      for (const key of sortedKeys) {
        signatureString += `:${key}=${shpParams[key]}`
      }
    }
    
    console.log('Signature string:', signatureString)
    const signature = crypto.createHash('md5').update(signatureString).digest('hex')
    console.log('Generated signature:', signature)
    
    return signature
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

  // Создание чека для фискализации
  static createReceipt(plan: PaymentPlan): string {
    const receipt = {
      items: [
        {
          name: `Тариф "${plan.name}" - ${plan.interviews} интервью`,
          quantity: 1,
          sum: plan.price,
          tax: "none",
          payment_method: "full_payment",
          payment_object: "service"
        }
      ]
    }
    return encodeURIComponent(JSON.stringify(receipt))
  }

  // Создание данных для платежа (минимальная версия без пользовательских параметров)
  static createPayment(
    plan: PaymentPlan,
    userEmail?: string,
    userId?: string
  ): RobokassaPayment {
    // Генерируем более короткий inv_id (последние 9 цифр timestamp + случайное число)
    const invId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000)
    
    // Генерируем подпись БЕЗ пользовательских параметров для избежания ошибки 29
    const signatureValue = this.generateSignature(
      ROBOKASSA_CONFIG.merchantLogin,
      plan.price,
      invId,
      ROBOKASSA_CONFIG.password1
    )
    
    console.log('Payment signature data (minimal):', {
      merchantLogin: ROBOKASSA_CONFIG.merchantLogin,
      outSum: plan.price,
      invId,
      signatureValue
    })

    return {
      merchantLogin: ROBOKASSA_CONFIG.merchantLogin,
      outSum: plan.price,
      invId,
      description: `Plan ${plan.id}`, // Минимальное описание на английском
      signatureValue,
      culture: 'ru',
      email: userEmail,
      shp_plan: plan.id,
      shp_user_id: userId
    }
  }

  // Генерация URL для оплаты (только обязательные параметры)
  static generatePaymentUrl(payment: RobokassaPayment): string {
    const params = new URLSearchParams()
    
    // Только обязательные параметры для избежания ошибки 29
    params.set('MerchantLogin', payment.merchantLogin)
    params.set('OutSum', payment.outSum.toString())
    params.set('InvId', payment.invId.toString())
    params.set('Description', payment.description)
    params.set('SignatureValue', payment.signatureValue)
    
    // Культура (рекомендуемый параметр)
    if (payment.culture) {
      params.set('Culture', payment.culture)
    }
    
    // Email только если есть
    if (payment.email) {
      params.set('Email', payment.email)
    }
    
    // Тестовый режим
    if (ROBOKASSA_CONFIG.testMode) {
      params.set('IsTest', '1')
    }

    const fullUrl = `${ROBOKASSA_CONFIG.paymentUrl}?${params.toString()}`
    console.log('Generated payment URL (minimal):', fullUrl)
    console.log('Payment URL params:', Object.fromEntries(params.entries()))
    return fullUrl
  }

  // Получение плана по ID
  static getPlanById(planId: string): PaymentPlan | undefined {
    return PAYMENT_PLANS.find(plan => plan.id === planId)
  }
}