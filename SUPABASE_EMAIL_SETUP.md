# Настройка Email в Supabase

## Проблема
Письма с подтверждением регистрации не приходят пользователям.

## Решение

### 1. Проверьте настройки Authentication в Supabase Dashboard:

1. Откройте ваш проект в [Supabase Dashboard](https://supabase.com/dashboard)
2. Перейдите в **Authentication** → **Settings**
3. В разделе **Email Auth** убедитесь, что:
   - ✅ **Enable email confirmations** включено
   - ✅ **Email confirmation URL** установлен на: `https://your-domain.com/auth/callback`

### 2. Настройте Email Templates:

1. Перейдите в **Authentication** → **Email Templates**
2. Выберите **Confirm signup**
3. Убедитесь, что ссылка содержит: `{{ .ConfirmationURL }}`

### 3. Настройте SMTP (рекомендуется для продакшена):

1. Перейдите в **Settings** → **Project Settings** → **Auth**
2. В разделе **SMTP Settings** настройте:
   - **SMTP Host**: ваш SMTP сервер
   - **SMTP Port**: обычно 587
   - **SMTP User**: ваш email
   - **SMTP Pass**: пароль приложения
   - **SMTP Sender Name**: название вашего сервиса

### 4. Для тестирования (временное решение):

Можно временно отключить подтверждение email:
1. **Authentication** → **Settings**
2. Отключите **Enable email confirmations**

⚠️ **Внимание**: Отключение подтверждения email снижает безопасность!

### 5. Проверьте домен:

Убедитесь, что ваш домен добавлен в **Site URL** и **Redirect URLs** в настройках Auth.