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
- **UI**: shadcn/ui, Lucide Icons
- **Storage**: LocalStorage для гостевого режима

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
├── types/                 # TypeScript типы
├── hooks/                 # React хуки
└── public/               # Статические файлы
```

## 🚀 Деплой

### Vercel (рекомендуется)
1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения:
   - `PERPLEXITY_API_KEY` - для генерации вопросов
   - `OPENAI_API_KEY` - для TTS и генерации резюме
3. Деплой произойдет автоматически

### Другие платформы
- Netlify
- Railway
- Render

## ✨ Особенности

- **Работает без базы данных** - использует localStorage
- **Гостевой режим** - не требует регистрации
- **Современный UI** - адаптивный дизайн
- **Быстрый деплой** - минимальная настройка

## 📝 Лицензия

MIT License

## 🤝 Вклад в проект

Приветствуются Pull Request'ы и Issues!

## 📞 Контакты

- GitHub: [@Nik-Maltcev](https://github.com/Nik-Maltcev)
- Проект: [Careeros](https://github.com/Nik-Maltcev/careeros)