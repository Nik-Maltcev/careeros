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

-- Включение Row Level Security для payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Политики безопасности для payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON payments
  FOR UPDATE USING (true);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_inv_id ON payments(inv_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);