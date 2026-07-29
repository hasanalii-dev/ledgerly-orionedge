-- Add custom_config to planners for tax engine state management
ALTER TABLE public.planners ADD COLUMN IF NOT EXISTS custom_config JSONB DEFAULT '{}'::jsonb;
