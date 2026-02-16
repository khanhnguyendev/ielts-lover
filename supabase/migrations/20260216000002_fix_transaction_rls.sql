-- Fix RLS for credit_transactions
-- Allow users to insert their own transactions

CREATE POLICY "Users can insert their own transactions" ON ielts_lover_v1.credit_transactions FOR INSERT
WITH
    CHECK (auth.uid () = user_id);