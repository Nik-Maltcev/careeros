-- Создание таблицы для обратной связи
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  question1 TEXT NOT NULL, -- Что не устраивает в сервисе
  question2 TEXT NOT NULL, -- Как бы вы улучшили продукт
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Индексы для быстрого поиска
  UNIQUE(user_id) -- Один пользователь может отправить только одну обратную связь
);

-- Включаем RLS (Row Level Security)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Users can view their own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Комментарии к таблице
COMMENT ON TABLE feedback IS 'Таблица для хранения обратной связи от пользователей';
COMMENT ON COLUMN feedback.question1 IS 'Ответ на вопрос: Что не устраивает в сервисе?';
COMMENT ON COLUMN feedback.question2 IS 'Ответ на вопрос: Как бы вы улучшили продукт?';