# Careeros - AI Interview Platform

Платформа для проведения технических интервью с использованием искусственного интеллекта.

## 🚀 Возможности

- **Генерация вопросов** с помощью Perplexity AI (модель Sonar Pro)
- **Голосовые ответы** с распознаванием речи через OpenAI Whisper
- **Анализ ответов** с детальной обратной связью
- **Генерация сопроводительных писем** с оптимизацией под вакансии
- **Аутентификация пользователей** через Supabase
- **База данных** для хранения профилей и результатов интервью
- **Гостевой режим** для пробного использования

## 🛠 Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **AI**: Perplexity AI (Sonar Pro), OpenAI (Whisper, TTS, GPT-4)
- **UI**: shadcn/ui, Lucide Icons
- **Storage**: Supabase Database + LocalStorage для гостей

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
# AI API Keys
PERPLEXITY_API_KEY=your_perplexity_api_key
OPENAI_API_KEY=your_openai_api_key

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Firecrawl for job parsing
FIRECRAWL_API_KEY=your_firecrawl_api_key
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
2. Выполните SQL скрипт из `scripts/create-tables.sql` в SQL Editor
3. Получите URL проекта и anon key в Settings > API
4. Добавьте в `.env.local` как `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Firecrawl (опционально)
1. Зарегистрируйтесь на [firecrawl.dev](https://firecrawl.dev)
2. Получите API ключ
3. Добавьте в `.env.local` как `FIRECRAWL_API_KEY`



## 📁 Структура проекта

```
careeros/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (Perplexity, OpenAI)
│   ├── interview/         # Страница интервью
│   ├── interview-prep/    # Подготовка к интервью
│   ├── interview-results/ # Результаты интервью
│   ├── resume-builder/    # Конструктор резюме
│   └── contacts/          # Контакты
├── components/            # React компоненты
│   └── ui/               # UI компоненты (shadcn/ui)
├── lib/                   # Утилиты и конфигурация
│   ├── auth-supabase.ts  # Сервис аутентификации
│   ├── supabase.ts       # Клиент Supabase
│   └── interview-manager.ts # Менеджер интервью
├── types/                 # TypeScript типы
│   └── database.ts       # Типы базы данных Supabase
├── scripts/              # SQL скрипты
│   └── create-tables.sql # Создание таблиц в Supabase
├── hooks/                 # React хуки
└── public/               # Статические файлы
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения:
   - `PERPLEXITY_API_KEY` - для генерации вопросов
   - `OPENAI_API_KEY` - для TTS, Whisper и генерации писем
   - `NEXT_PUBLIC_SUPABASE_URL` - URL проекта Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - публичный ключ Supabase
   - `FIRECRAWL_API_KEY` - для парсинга вакансий (опционально)
3. Деплой произойдет автоматически

### Другие платформы
- Netlify
- Railway
- Render

## ✨ Особенности

- **Двойной режим работы** - с аутентификацией через Supabase и гостевой режим
- **Безопасность данных** - Row Level Security (RLS) в Supabase
- **Голосовое распознавание** - транскрипция аудио ответов через OpenAI Whisper
- **Персонализация** - сохранение истории интервью для зарегистрированных пользователей
- **Современный UI** - адаптивный дизайн с темной темой
- **Быстрый деплой** - готов к продакшену

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

Приветствуются Pull Request'ы и Issues!

## 📞 Контакты

- GitHub: [@Nik-Maltcev](https://github.com/Nik-Maltcev)
- Проект: [Careeros](https://github.com/Nik-Maltcev/careeros)