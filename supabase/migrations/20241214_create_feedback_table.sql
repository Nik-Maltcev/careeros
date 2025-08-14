-- Создание таблицы для обратной связи
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  stage TEXT NOT NULL, -- На каком этапе поиска находится
  purpose TEXT NOT NULL, -- Для чего проходит интервью
  liked TEXT NOT NULL, -- Что понравилось
  improvements TEXT NOT NULL, -- Чего не хватило, что улучшить
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
COMMENT ON COLUMN feedback.stage IS 'На каком этапе поиска находится: learning, job-searching, self-development';
COMMENT ON COLUMN feedback.purpose IS 'Для чего проходит интервью: fear-of-interviews, future-preparation, practice-after-rejections';
COMMENT ON COLUMN feedback.liked IS 'Что понравилось в сервисе';
COMMENT ON COLUMN feedback.improvements IS 'Чего не хватило, что можно улучшить';