-- Создание таблицы профилей пользователей
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  interviews_used INTEGER DEFAULT 0,
  max_interviews INTEGER DEFAULT 1
);

-- Создание таблицы результатов интервью
CREATE TABLE IF NOT EXISTS interview_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL,
  level TEXT NOT NULL,
  overall_score DECIMAL,
  questions_count INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  analysis_data JSONB
);

-- Включение Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_results ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики безопасности для interview_results
CREATE POLICY "Users can view own interview results" ON interview_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview results" ON interview_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, max_interviews)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    1
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Создание таблицы платежей
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inv_id INTEGER UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  fee DECIMAL DEFAULT 0,
  email TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Создание таблицы ожидающих платежей (для связи с Robokassa)
CREATE TABLE IF NOT EXISTS pending_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inv_id INTEGER UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Включение Row Level Security для payments и pending_payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payments ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- Политики безопасности для pending_payments
CREATE POLICY "Users can view own pending payments" ON pending_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert pending payments" ON pending_payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update pending payments" ON pending_payments
  FOR UPDATE USING (true);

CREATE POLICY "System can delete pending payments" ON pending_payments
  FOR DELETE USING (true);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_interview_results_user_id ON interview_results(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_results_completed_at ON interview_results(completed_at);
CREATE INDEX IF NOT EXISTS idx_interview_results_specialty ON interview_results(specialty);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv_id ON payments(inv_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_user_id ON pending_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_inv_id ON pending_payments(inv_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_status ON pending_payments(status);
CREATE INDEX IF NOT EXISTS idx_pending_payments_expires_at ON pending_payments(expires_at);