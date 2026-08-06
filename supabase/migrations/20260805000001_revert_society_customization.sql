-- Revert Migration: Drop Society Participant fields from clients table
ALTER TABLE public.clients
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS amount_paid,
  DROP COLUMN IF EXISTS member_count,
  DROP COLUMN IF EXISTS payment_type,
  DROP COLUMN IF EXISTS payment_proof_url;
