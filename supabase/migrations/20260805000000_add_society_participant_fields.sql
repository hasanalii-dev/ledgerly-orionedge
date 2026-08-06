-- Migration: Add Participant fields for Society / Event Planner to clients table
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS amount_paid numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS member_count integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS payment_type text DEFAULT 'cash',
  ADD COLUMN IF NOT EXISTS payment_proof_url text DEFAULT NULL;
