const crypto = require('crypto');

// Тестовые данные
const merchantLogin = 'careeros';
const password1 = 'fhZJ0oqzmo1258YYbTop';
const password2 = 'ZKstGV72xKGTua8NJ2R5';
const outSum = 99;
const invId = 1234567890;

// Тест 1: Генерация подписи для платежа (как в Python)
function testPaymentSignature() {
  const signatureString = `${merchantLogin}:${outSum}:${invId}:${password1}`;
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');
  
  console.log('=== PAYMENT SIGNATURE TEST ===');
  console.log('Signature string:', signatureString);
  console.log('Generated signature:', signature);
  console.log('');
}

// Тест 2: Проверка подписи результата (как в Python)
function testResultSignature() {
  const signatureString = `${outSum}:${invId}:${password2}`;
  const signature = crypto.createHash('md5').update(signatureString).digest('hex').toUpperCase();
  
  console.log('=== RESULT SIGNATURE TEST ===');
  console.log('Signature string:', signatureString);
  console.log('Generated signature:', signature);
  console.log('');
}

// Тест 3: С пользовательскими параметрами
function testWithShpParams() {
  const shpParams = {
    shp_plan: 'single',
    shp_interviews: '1'
  };
  
  let signatureString = `${merchantLogin}:${outSum}:${invId}:${password1}`;
  
  // Добавляем shp параметры в алфавитном порядке
  const sortedKeys = Object.keys(shpParams).sort();
  for (const key of sortedKeys) {
    signatureString += `:${key}=${shpParams[key]}`;
  }
  
  const signature = crypto.createHash('md5').update(signatureString).digest('hex');
  
  console.log('=== PAYMENT WITH SHP PARAMS TEST ===');
  console.log('Signature string:', signatureString);
  console.log('Generated signature:', signature);
  console.log('');
}

// Запускаем тесты
testPaymentSignature();
testResultSignature();
testWithShpParams();

console.log('Test completed! Use these signatures to verify your implementation.');