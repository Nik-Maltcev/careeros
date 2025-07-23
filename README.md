# Careeros - AI Interview Platform

Платформа для проведения технических интервью с использованием искусственного интеллекта.

## 🚀 Возможности

- **Генерация вопросов** с помощью Perplexity AI (модель Sonar Pro)
- **Голосовые ответы** с распознаванием речи
- **Анализ ответов** с детальной обратной связью
- **Построение резюме** с оптимизацией под вакансии
- **Подготовка к интервью** с персонализированными рекомендациями

## 🛠 Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Perplexity AI (Sonar Pro), OpenAI (TTS, GPT-4)
- **Auth**: Supabase Authentication
- **Database**: Supabase PostgreSQL
- **UI**: shadcn/ui, Lucide Icons

## 📦 Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Nik-Maltcev/careeros.git
cd careeros
```

2. Установите зависимости:
```bash
pnpm install
```

3. Настройте переменные окружения:
```bash
cp .env.example .env.local
```

4. Заполните `.env.local`:
```env
PERPLEXITY_API_KEY=your_perplexity_api_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Запустите проект:
```bash
pnpm dev
```

## 🔧 Настройка API ключей

### Perplexity AI
1. Зарегистрируйтесь на [perplexity.ai](https://perplexity.ai)
2. Получите API ключ в настройках
3. Добавьте в `.env.local` как `PERPLEXITY_API_KEY`

### OpenAI
1. Зарегистрируйтесь на [platform.openai.com](https://platform.openai.com)
2. Создайте API ключ
3. Добавьте в `.env.local` как `OPENAI_API_KEY`

### Supabase
1. Создайте проект на [supabase.com](https://supabase.com)
2. Получите URL и anon key
3. Добавьте в `.env.local`

## 📁 Структура проекта

```
careeros/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── interview/         # Страница интервью
│   ├── resume-builder/    # Конструктор резюме
│   └── ...
├── components/            # React компоненты
├── lib/                   # Утилиты и конфигурация
├── types/                 # TypeScript типы
└── public/               # Статические файлы
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения
3. Деплой произойдет автоматически

### Другие платформы
- Netlify
- Railway
- Render

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

Приветствуются Pull Request'ы и Issues!

## 📞 Контакты

- GitHub: [@Nik-Maltcev](https://github.com/Nik-Maltcev)
- Проект: [Careeros](https://github.com/Nik-Maltcev/careeros)