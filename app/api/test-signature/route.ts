import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET() {
  const merchantLogin = process.env.ROBOKASSA_MERCHANT_LOGIN || 'careeros'
  const password1 = process.env.ROBOKASSA_PASSWORD_1 || 'fhZJ0oqzmo1258YYbTop'
  const password2 = process.env.ROBOKASSA_PASSWORD_2 || 'ZKstGV72xKGTua8NJ2R5'
  
  const testData = {
    outSum: 99,
    invId: Date.now(),
    shpParams: {
      shp_plan: 'single',
      shp_interviews: '1'
    }
  }

  // Тест подписи для платежа
  let paymentSignatureString = `${merchantLogin}:${testData.outSum}:${testData.invId}:${password1}`
  const sortedKeys = Object.keys(testData.shpParams).sort()
  for (const key of sortedKeys) {
    paymentSignatureString += `:${key}=${testData.shpParams[key]}`
  }
  const paymentSignature = crypto.createHash('md5').update(paymentSignatureString).digest('hex')

  // Тест подписи для результата
  const resultSignatureString = `${testData.outSum}:${testData.invId}:${password2}`
  const resultSignature = crypto.createHash('md5').update(resultSignatureString).digest('hex').toUpperCase()

  return NextResponse.json({
    config: {
      merchantLogin,
      hasPassword1: !!password1,
      hasPassword2: !!password2,
      nodeEnv: process.env.NODE_ENV
    },
    testData,
    signatures: {
      payment: {
        string: paymentSignatureString,
        signature: paymentSignature
      },
      result: {
        string: resultSignatureString,
        signature: resultSignature
      }
    }
  })
}