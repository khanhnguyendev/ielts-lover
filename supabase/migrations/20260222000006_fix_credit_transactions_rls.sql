-- Fix RLS for credit_transactions
-- Allow users to insert their own transactions
-- AND allow admins to insert transactions for any user

DROP POLICY IF EXISTS "Users can insert their own transactions" ON ielts_lover_v1.credit_transactions;

CREATE POLICY "Users can insert their own transactions" ON ielts_lover_v1.credit_transactions FOR INSERT
WITH
    CHECK (
        auth.uid () = user_id
        OR ielts_lover_v1.is_admin ()
    );

-- Allow admins to view all transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON ielts_lover_v1.credit_transactions;

CREATE POLICY "Users can view their own transactions" ON ielts_lover_v1.credit_transactions FOR
SELECT USING (
        auth.uid () = user_id
        OR ielts_lover_v1.is_admin ()
    );